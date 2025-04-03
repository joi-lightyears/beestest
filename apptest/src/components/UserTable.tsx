import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Settings, Loader2, Pencil, Trash, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Interface for User data
export interface TUser {
  id: string;
  name: string;
  balance: number;
  email: string;
  registerAt: Date;
  active: boolean;
}

// Generate sample data
const generateSampleData = (count: number): TUser[] => {
  const names = [
    "Andrew Taylor", "Alvaro Garcia", "Pedro Moreno", "John Robinson", "Sarah White",
    "William King", "Emma Gonzalez", "Ryan Young", "Michael Taylor", "Jennifer King",
    "David Smith", "Maria Rodriguez", "James Johnson", "Patricia Martinez", "Robert Brown",
    "Linda Davis", "Michael Miller", "Elizabeth Wilson", "William Moore", "Barbara Taylor"
  ];
  
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  
  return Array.from({ length: count }, (_, i) => {
    const name = names[Math.floor(Math.random() * names.length)];
    const nameParts = name.toLowerCase().split(' ');
    const emailPrefix = Math.random() > 0.5 
      ? `${nameParts[0]}.${nameParts[1]}` 
      : `${nameParts[0][0]}${nameParts[1]}`;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    // Generate a random date within the last 5 years
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - Math.floor(Math.random() * 5), 
                             Math.floor(Math.random() * 12), 
                             Math.floor(Math.random() * 28) + 1);
    
    return {
      id: `user-${i + 1}`,
      name,
      balance: Math.floor(Math.random() * 10000) + 1000,
      email: `${emailPrefix}${Math.random() > 0.7 ? Math.floor(Math.random() * 100) : ''}@${domain}`,
      registerAt: pastDate,
      active: Math.random() > 0.3
    };
  });
};

// Fixed Motion Dialog Content - This is where the error was occurring
const MotionDialogContent = React.forwardRef((props: any, ref: any) => {
  const { open, children, ...rest } = props;
  
  return (
    <AnimatePresence>
      {open && (
        <DialogContent className="" {...rest} forceMount>
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </DialogContent>
      )}
    </AnimatePresence>
  );
});
MotionDialogContent.displayName = "MotionDialogContent";

export const UserTable: React.FC = () => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<TUser[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const infiniteScrollChunkSize = 20;

  // Check viewport width for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Set initial value
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch or generate data (only once on mount)
  useEffect(() => {
    try {
      // Simulate loading delay
      setInitialLoading(true);
      setTimeout(() => {
        const data = generateSampleData(100);
        setUsers(data);
        setInitialLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load user data');
      setInitialLoading(false);
    }
  }, []);

  // Handle checkbox selection
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const targetUsers = isInfiniteScroll ? visibleUsers : currentUsers;
      setSelectedUsers(targetUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, id]);
      // Check if all current page users are now selected
      const targetUsers = isInfiniteScroll ? visibleUsers : currentUsers;
      if (selectedUsers.length + 1 === targetUsers.length) {
        setSelectAll(true);
      }
    }
  };

  // Memoized filtered users
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      if (filterStatus === "active") {
        return user.active;
      } else if (filterStatus === "inactive") {
        return !user.active;
      }
      return true;
    });
  }, [users, filterStatus]);

  // Memoized sorted users
  const sortedUsers = React.useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortColumn === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortColumn === "balance") {
        return sortOrder === "asc" ? a.balance - b.balance : b.balance - a.balance;
      }
      if (sortColumn === "registerAt") {
        return sortOrder === "asc" ? a.registerAt.getTime() - b.registerAt.getTime() : b.registerAt.getTime() - a.registerAt.getTime();
      }
      return 0;
    });
  }, [filteredUsers, sortColumn, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  // Handle changing rowsPerPage option
  const handleRowsPerPageChange = useCallback((value: string) => {
    if (value === 'all') {
      setRowsPerPage(users.length);
      setIsInfiniteScroll(true);
    } else {
      setRowsPerPage(parseInt(value));
      setIsInfiniteScroll(false);
    }
    setCurrentPage(1);
  }, [users.length]);

  // Reset visible users when filters or sorting changes or when switching to infinite scroll
  useEffect(() => {
    if (isInfiniteScroll) {
      setVisibleUsers(sortedUsers.slice(0, infiniteScrollChunkSize));
    }
  }, [sortedUsers, isInfiniteScroll]);

  // Infinite scroll implementation with Intersection Observer
  const loadMoreItems = useCallback(() => {
    if (loadingMore || visibleUsers.length >= sortedUsers.length) return;
    
    setLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      const nextItems = sortedUsers.slice(
        visibleUsers.length,
        visibleUsers.length + infiniteScrollChunkSize
      );
      setVisibleUsers(prevUsers => [...prevUsers, ...nextItems]);
      setLoadingMore(false);
    }, 500);
  }, [loadingMore, sortedUsers, visibleUsers.length]);

  // Set up the intersection observer for infinite scroll
  useEffect(() => {
    if (!isInfiniteScroll || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentObserverTarget = observerTarget.current;
    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [isInfiniteScroll, loadMoreItems]);

  // Generate pagination items
  const renderPaginationItems = useCallback(() => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Add first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  }, [currentPage, totalPages]);

  // Settings component - for both inline and modal display
  const SettingsContent = () => (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-2 lg:space-y-0 ">
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-32 h-8">
            <SelectValue>{filterStatus}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
        <Select value={sortColumn} onValueChange={setSortColumn}>
          <SelectTrigger className="w-full lg:w-32 h-8">
            <SelectValue>{sortColumn}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="balance">Balance</SelectItem>
            <SelectItem value="registerAt">Registration Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order:</span>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full lg:w-32 h-8">
            <SelectValue>{sortOrder}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rows per page:</span>
        <Select
          value={isInfiniteScroll ? "all" : rowsPerPage.toString()}
          onValueChange={handleRowsPerPageChange}
        >
          <SelectTrigger className="w-full lg:w-32 h-8">
            <SelectValue>{isInfiniteScroll ? "All" : rowsPerPage}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="all">All (infinite)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Glass container */}
      <div className="relative w-full p-6 bg-white backdrop-filter backdrop-blur-lg shadow-xl dark:bg-black rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r dark:from-[#141414] dark:to-[#000000] from-gray-200 to-gray-300 opacity-75 rounded-3xl" />
        <div className="absolute inset-[10px] dark:bg-black bg-white rounded-[calc(1.5rem-5px)]" />
        
        {/* Table header with rows per page selector */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {initialLoading ? 'Loading data...' : `${sortedUsers.length} results`}
          </div>

          {/* Responsive Settings - Desktop or Mobile */}
          {isMobile ? (
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <motion.div
                    whileHover={{ rotate: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Settings className="h-4 w-4" />
                  </motion.div>
                </Button>
              </DialogTrigger>
              <MotionDialogContent open={isSettingsOpen}>
                <DialogHeader className="flex items-center justify-between mb-4">
                  <DialogTitle>Table Settings</DialogTitle>
                </DialogHeader>
                <SettingsContent />
              </MotionDialogContent>
            </Dialog>
          ) : (
            <div className="items-center space-x-2">
              <SettingsContent />
            </div>
          )}
        </div>

        {/* Table wrapper with loading state */}
        <div className="relative w-full overflow-auto">
          {initialLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Balance ($)</TableHead>
                  <TableHead className="hidden md:table-cell font-medium">Email</TableHead>
                  <TableHead className="hidden sm:table-cell font-medium">Registration</TableHead>
                  <TableHead className="font-medium">STATUS</TableHead>
                  <TableHead className="text-right font-medium">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isInfiniteScroll ? visibleUsers : currentUsers).map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>${user.balance.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {user.email}
                      </a>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {format(user.registerAt, 'yyyy-MM-dd')}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(user.registerAt, 'yyyy-MM-dd HH:mm:ss')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 text-xs rounded-full inline-flex items-center justify-center ${
                        user.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Intersection Observer Target for Infinite Scroll */}
          {isInfiniteScroll && !initialLoading && (
            <div ref={observerTarget} className="w-full py-4 text-center">
              {loadingMore ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : visibleUsers.length < sortedUsers.length ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Scroll to load more...
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  All data loaded
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pagination - Only show when not in infinite scroll mode */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1">
            {isInfiniteScroll 
              ? `Showing ${visibleUsers.length} of ${sortedUsers.length} entries` 
              : `Showing ${startIndex + 1} to ${Math.min(endIndex, sortedUsers.length)} of ${sortedUsers.length} entries`
            }
          </div>
          
          {!isInfiniteScroll && (
            <Pagination className="order-1 sm:order-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
};