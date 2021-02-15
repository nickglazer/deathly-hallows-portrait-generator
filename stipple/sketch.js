let img = null, c, dropzone, fileAvailable = false, method = 'probabilistic';

function setup() {
  const form = document.getElementById('parameterForm');
  form.addEventListener('submit', drawImage);

  const saveForm = document.getElementById('saveForm');
  saveForm.addEventListener('submit', saveCanvasHandler);

  pixelDensity(1);
  c = createCanvas(0, 0);

  dropzone = select('#dropzone');
  dropzone.drop(fileDropHandler);
}

const drawImage = e => {
  e.preventDefault();

  if (img == null || !fileAvailable) {
    return;
  }

  let { paddingSizeInput: { value: paddingSize },
          maskSizeInput: { value: maskSize},
          methodInput: { value: method},
          displayImageInput: { checked: displayImage },
          invertCheckbox: { checked: invert },
        } = e.target.elements;
  clear();
  background(invert ? 0 : 255);
  stroke(invert ? 255 : 0);
  fill(invert ? 255 : 0);

  if (displayImage) {
    image(img, 0, 0);
  }

  maskSize = Number(maskSize);
  paddingSize = Number(paddingSize);
  const halfMaskSize = maskSize / 2;
  const config = {
    paddingSize,
    maskSize,
    halfMaskSize,
    squaredMaskSize: maskSize * maskSize,
    halfPaddingSize: paddingSize / 2,
  };

  switch(method) {
    // always draw, fixed locations, variable size dot
    case 'fixed':
      for (let y = 0; y < img.height; y += maskSize + 1) {
        for (let x = 0; x < img.width; x += maskSize + 1) {
          const avgLum = averageMaskLuminance(x, y, config);
          const brightness = invert ? (avgLum / 255) : 1 - (avgLum / 255);
          const i = x + halfMaskSize;
          const j = y + halfMaskSize;
          circle(i, j, map(brightness, 0, 1, 0, maskSize));
        }
      }
      break;
    // fixed locations, same size dots, probablistic based on luminance
    case 'prob':
      for (let y = 0; y < img.height; y += maskSize) {
        for (let x = 0; x < img.width; x += maskSize) {
          const avgLum = averageMaskLuminance(x, y, config);
          const brightness = invert ? (avgLum / 255) : 1 - (avgLum / 255);
          if (random(0, 1) < brightness) {
            circle(x, y,maskSize);
          }
        }
      }
      break;
  }
}

const averageMaskLuminance = (x, y, { maskSize, squaredMaskSize }) => {
  let sum = 0;
  for (let i = 0; i < maskSize; i++) {
    for (let j = 0; j < maskSize; j++) {
      sum += luminancePixel(x + i, y + j);
    }
  }
  return sum / squaredMaskSize;
}

const luminancePixel = (x, y) => {
  const [r, g, b, a] = img.get(x, y);
  return ((0.3 * r) + (0.59 * g) + (0.11 * b)) * (a / 255);
}

const fileDropHandler = file => {
  if (file.type === 'image') {
    select('#currentFilename').html(file.name).removeClass('warning');
    img = loadImage(file.data, img => {
      img.loadPixels();
      resizeCanvas(img.width, img.height);
      background(0);
      fileAvailable = true;
    }, () => {
      img = null;
      fileAvailable = false;
    });
  } else {
    select('#currentFilename').html('Not an image file.').addClass('warning');
  }
}

const saveCanvasHandler = e => {
  let filename = e.target.elements.saveFilename.value || 'StippledImage';
  saveCanvas(`${filename}-${Date.now().toString()}`, 'png');
  e.preventDefault();
  return false;
}

function draw() {
  noLoop();
}
