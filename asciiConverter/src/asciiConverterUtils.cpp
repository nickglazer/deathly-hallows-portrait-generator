#include <iostream>

#include <opencv2/imgproc.hpp>

#include "asciiConverterUtils.hpp"

#define MASK_WIDTH 4
#define MASK_HEIGHT (2 * MASK_WIDTH)
#define NUMBER_OF_LEVELS 70
const char *levels = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

void render(cv::Mat img)
{
  cv::Mat hsvRoi = cv::Mat();

  for (int j = 0; j < img.rows - MASK_HEIGHT; j += MASK_HEIGHT)
  {
    for (int i = 0; i < img.cols - MASK_WIDTH; i += MASK_WIDTH)
    {
      cv::Mat roi = img(cv::Rect(i, j, MASK_WIDTH, MASK_HEIGHT));
      cv::cvtColor(roi, hsvRoi, cv::COLOR_BGR2HSV);
      cv::Scalar mean = cv::mean(hsvRoi);
      int level = NUMBER_OF_LEVELS - (int)((mean[2] / 255) * NUMBER_OF_LEVELS) - 1;
      char m[1][3] = {{(char)mean[0], (char)mean[1], (char)255}};
      cv::Mat hueOnly = cv::Mat(1, 1, CV_8UC3, m);
      cv::cvtColor(hueOnly, hueOnly, cv::COLOR_HSV2RGB);

      cv::Vec3b vec = hueOnly.at<cv::Vec3b>(0, 0);
      std::cout << "\033[38;2;" << (int)vec(0) << ";" << (int)vec(1) << ";" << (int)vec(2) << "m" << levels[level];
    }
    std::cout << '\n';
  }
  std::cout << std::endl;
}
