cmake_minimum_required(VERSION 3.16)
project(BankSystemProject LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

file(GLOB_RECURSE PROJECT_SOURCES CONFIGURE_DEPENDS src/*.cpp main.cpp)

add_executable(bank_system ${PROJECT_SOURCES})
