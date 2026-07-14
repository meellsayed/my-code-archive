# Bank System Project

This folder contains the full C++ solution for the PDF requirements.

## Build

Using `g++`:

```bash
g++ -std=c++17 -Iinclude main.cpp src/*.cpp -o bank_system
```

Using CMake:

```bash
cmake -S . -B build
cmake --build build
```

## Notes

- The program stores data inside the local `data/` folder.
- A default admin is created automatically if there are no admins yet:
  - `id = 1`
  - `password = admin123`
