# BEESTEST

> By Nguyen Thanh Dat

![Last Commit](https://img.shields.io/badge/last_commit-today-blue)
![Languages](https://img.shields.io/badge/languages-4-blue)

## Overview

BEESTEST contains of TypeScript tests and React components showcasing asynchronous processing and modern UI component design.

## Live Demo

Check out the live demo of the App Test (User Management Table):
[https://beestest.vercel.app/](https://beestest.vercel.app/)

## Built with

- ![JSON](https://img.shields.io/badge/-JSON-000000?style=flat&logo=json)
- ![npm](https://img.shields.io/badge/-npm-CB3837?style=flat&logo=npm)
- ![Autoprefixer](https://img.shields.io/badge/-Autoprefixer-DD3735?style=flat&logo=autoprefixer)
- ![PostCSS](https://img.shields.io/badge/-PostCSS-DD3A0A?style=flat&logo=postcss)
- ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
- ![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)
- ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
- ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white)
- ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat&logo=eslint)
- ![CSS](https://img.shields.io/badge/-CSS-1572B6?style=flat&logo=css3)
- ![date-fns](https://img.shields.io/badge/-date--fns-770C56?style=flat)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joi-lightyears/beestest
   cd apptest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Test Overview

This project includes two primary tests:

1. **Logic Test**: A TypeScript implementation of asynchronous processing with delay and cancellation capabilities
2. **App Test**: A React component that implements a sophisticated user management table

## Logic Test Details

### File: `logictest.ts`

This test implements an asynchronous processing function with delay and cancellation capabilities. You can run this test either in your local environment or through the [TypeScript Playground](https://www.typescriptlang.org/play/).

### Key Features

- Processes arrays of numbers with configurable delays between each item
- Implements progress tracking with callback function
- Supports cancellation via AbortSignal
- Includes comprehensive error handling
- Has TypeScript type safety

### Algorithm Overview

1. **Input Validation**: Checks if the input is a valid array of numbers
2. **Delayed Processing**: Processes each number with a configurable delay time
3. **Progress Tracking**: Reports processing progress through a callback
4. **Cancellation Support**: Allows cancellation at any point using AbortController
5. **Error Handling**: Handles invalid inputs, type mismatches, and cancellation

### Test Cases

The implementation includes six test cases:
1. Basic functionality with default delay
2. Custom delay time
3. Progress tracking with percentage
4. Empty array handling
5. Error handling for invalid inputs
6. Cancellation during processing

### Usage Example

```typescript
// Process numbers with 500ms delay and track progress
await processWithDelay([1, 2, 3, 4, 5], { 
  delayTime: 500,
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
  }
});

// With cancellation support
const controller = new AbortController();
const processPromise = processWithDelay([1, 2, 3, 4, 5], { 
  signal: controller.signal 
});

// Cancel after some time
setTimeout(() => controller.abort(), 1200);
```

## App Test Details

### Component: `UserTable`

A feature-rich React component that implements a sophisticated user management table using modern React patterns and UI components.

### Key Features

- **Responsive Design**: Adapts to different screen sizes with mobile-optimized views
- **Advanced Data Handling**:
  - Sorting by different columns
  - Filtering by user status
  - Pagination with custom rows per page
  - Infinite scroll option
- **Rich User Interface**:
  - Selection with individual and "select all" functionality
  - Status indicators with semantic colors
  - Tooltips for detailed information
  - Animated transitions
- **Modern UI Components**:
  - Uses shadcn/ui component library
  - Integrates with Framer Motion for animations
  - Dark/light mode support

### Algorithm Highlights

1. **Data Management**:
   - Generates sample user data with randomized properties
   - Implements filtering, sorting, and pagination logic
   - Uses React's memoization for performance optimization

2. **Infinite Scroll Implementation**:
   - Uses Intersection Observer API to detect when user scrolls to the bottom
   - Loads data in chunks to maintain performance
   - Shows loading indicators during data fetching

3. **Responsive Design Approach**:
   - Detects viewport width for responsive layout changes
   - Uses modal dialog for settings on mobile

4. **State Management**:
   - Tracks multiple state values (page, sort, filter, etc.)
   - Implements optimized selection logic
   - Handles edge cases (empty data, errors, etc.)

### Component Architecture

The component follows modern React best practices:
- Functional component with hooks
- Custom hooks for specific functionality
- Memoized calculations for performance
- Controlled components for form elements
- Responsive design with conditional rendering
- Accessibility considerations

Wish me luck - <3 BEES


