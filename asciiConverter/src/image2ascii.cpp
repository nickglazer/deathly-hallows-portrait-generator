#include <iostream>
#include <string>

#include <opencv2/imgcodecs.hpp>

#include "asciiConverterUtils.hpp"

int main(int argc, char **argv)
{
  const char *image_path = argv[1];
  cv::Mat img = cv::imread(image_path);
  if (img.empty())
  {
    std::cout << "Could not read the image: " << image_path << std::endl;
    return 1;
  }

  render(img);

  return 0;
}
