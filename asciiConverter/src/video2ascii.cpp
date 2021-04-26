#include <iostream>
#include <string>
#include <unistd.h>

#include <opencv2/videoio.hpp>

#include "asciiConverterUtils.hpp"

int main(int argc, char **argv)
{
  cv::VideoCapture cap(argv[1]);
  if (!cap.isOpened())
  {
    std::cout << "Error opening video stream or file" << std::endl;
    return -1;
  }
  cv::Mat hsvRoi = cv::Mat();

  while (1)
  {
    cv::Mat img;
    // Capture frame-by-frame
    cap >> img;

    // If the frame is empty, break immediately
    if (img.empty())
    {
      break;
    }

    render(img);

    usleep(30000);
    std::cout << "\x1B[2J\x1B[H";
  }

  return 0;
}
