async function processWithDelay(
    numbers: number[], 
    options: { 
      delayTime?: number,
      onProgress?: (processed: number, total: number) => void,
      signal?: AbortSignal
    } = {}
    ): Promise<void> {
    // Handle invalid inputs
    if (!Array.isArray(numbers)) {
      throw new Error('Input must be an array of numbers');
    }
    
    // Check if all elements are numbers
    if (numbers.some(item => typeof item !== 'number')) {
      throw new Error('All elements in the array must be numbers');
    }
    
    // Handle empty array case
    if (numbers.length === 0) {
      return Promise.resolve();
    }
    
    // Default options
    const delayTime = options.delayTime ?? 1000; // Default 1 second
    const onProgress = options.onProgress;
    const signal = options.signal;
    
    // Process each number with delay
    for (let i = 0; i < numbers.length; i++) {
      // Check for cancellation before each iteration
      if (signal?.aborted) {
        throw new Error('Operation was cancelled');
      }
      
      // Wait for specified delay before processing each number
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => resolve(), delayTime);
        
        // Add event listener for abort signal if provided
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Operation was cancelled'));
          }, { once: true });
        }
      });
      
      // Check for cancellation again after delay
      if (signal?.aborted) {
        throw new Error('Operation was cancelled');
      }
      
      // Process current number
      console.log(numbers[i]);
      
      // Update progress if callback is provided
      if (onProgress) {
        onProgress(i + 1, numbers.length);
      }
    }
}
  
// Test the function
async function runTests() {
    console.log("Test 1: Basic functionality");
    console.log("Processing [1, 2, 3, 4, 5] with 1-second delay");
    await processWithDelay([1, 2, 3, 4, 5]);
    console.log("All numbers processed");
    
    console.log("Test 2: Custom delay");
    console.log("Processing [1, 2, 3, 4, 5] with 500ms delay");
    await processWithDelay([1, 2, 3, 4, 5], { delayTime: 500 });
    console.log("All numbers processed");
    
    console.log("Test 3: Progress tracking");
    await processWithDelay([1, 2, 3, 4, 5], { 
      delayTime: 500,
      onProgress: (processed, total) => {
        console.log(`Progress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
      }
    });
    console.log("All numbers processed");
    
    console.log("Test 4: Empty array");
    await processWithDelay([]);
    console.log("Empty array handled correctly");
    
    console.log("Test 5: Error handling");
    try {
      // @ts-ignore - passing wrong type for testing
      await processWithDelay("not an array");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error caught: ${error.message}`);
      }
    }
    
    try {
      // @ts-ignore - passing wrong elements for testing
      await processWithDelay([1, "two", 3]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error caught: ${error.message}`);
      }
    }
    
    console.log("Test 6: Cancellation");
    const controller = new AbortController();
    const processPromise = processWithDelay([1, 2, 3, 4, 5], { 
      signal: controller.signal,
      onProgress: (processed, total) => {
        console.log(`Progress: ${processed}/${total}`);
      }
    });
    
    // Cancel after the first number
    setTimeout(() => {
      console.log("Cancelling operation...");
      controller.abort();
    }, 1200);
    
    try {
      await processPromise;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Cancellation caught: ${error.message}`);
      }
    }
}
  
// Run all tests
runTests().then(() => console.log("All tests completed"));