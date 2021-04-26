cmake_minimum_required(VERSION 3.1)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED TRUE)
project(asciiConverter)
find_package(OpenCV 4.5.1 REQUIRED)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY bin)
set(SOURCES include/asciiConverterUtils.hpp src/asciiConverterUtils.cpp)

include_directories(include ${OpenCV_INCLUDE_DIRS})
add_executable(image2ascii src/image2ascii.cpp ${SOURCES})
add_executable(video2ascii src/video2ascii.cpp ${SOURCES})
target_link_libraries(image2ascii ${OpenCV_LIBS})
target_link_libraries(video2ascii ${OpenCV_LIBS})
