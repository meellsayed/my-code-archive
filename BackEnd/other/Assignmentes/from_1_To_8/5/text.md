 Q&A on Node.js Internals (5 Grades)

Task 2.1: What is the Node.js Event Loop? (1 Grade)
Answer: The Event Loop is the core mechanism in Node.js that
 handles asynchronous operations in a single thread.
  It continuously checks the "call stack" and "task queues" 
  and runs callbacks when operations like I/O, timers,
   or network requests finish. This lets Node.js handle thousands 
   of connections without blocking.
   Task 2.2: What is the Role of the V8 Engine? (1 Grade)
   Answer:
    V8 is Google's JavaScript engine built into Node.js.
     Its role is to compile your JavaScript code into fast 
     machine code using JIT compilation, and manage memory 
   through garbage collection. Node.js uses V8 to actually
   run the JS code, while Node adds I/O and OS access.
   Task 2.3: What is the Node.js Thread Pool and How to Set the Thread Pool Size? (1 Grade)Answer: The Thread Pool is a group of 4 background threads managed by libuv that Node.js uses for "heavy" blocking tasks like file system operations, DNS lookups, and crypto. This keeps the main Event Loop thread free.Set size: Use the environment variable UV_THREADPOOL_SIZE before starting Node.
Example: UV_THREADPOOL_SIZE=8 node app.js
Max is 128. Default is 4.Task 2.4: What is the purpose of the libuv library in Node.js? (1 Grade)Answer: libuv is the C library that gives Node.js its cross-platform, asynchronous I/O power. It provides the Event Loop, the Thread Pool, and handles all system calls like files, network, timers. Basically, libuv is what makes "non-blocking" I/O work on Windows, Linux, and Mac.Task 2.5: Explain how Node.js handles asynchronous I/O operationsAnswer: When Node.js gets an async I/O task like reading a file:The main JS code tells libuv "read this file" and immediately continues without waiting.libuv sends the task to the OS. If OS supports it, OS handles it directly. If not, libuv puts it in the Thread Pool.Once the file is read, the result/callback goes into the Event Loop's "task queue".When the call stack is empty, the Event Loop picks the callback and runs it.Result: The main thread never blocks, so Node.js can serve other requests while waiting for I/O.Want me to turn these into flashcards or make 3 quick practice questions so you can test yourself before submitting?