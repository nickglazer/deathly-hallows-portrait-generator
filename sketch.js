const roundingMethods = {
  'floor': Math.floor,
  'ceil': Math.ceil,
  'round': Math.round,
}

let img = null, c, dropzone, fileAvailable = false;

function setup() {
  const form = document.getElementById('parameterForm');
  form.addEventListener('submit', drawPortrait);

  const saveForm = document.getElementById('saveForm');
  saveForm.addEventListener('submit', saveCanvasHandler);

  pixelDensity(1);
  c = createCanvas(0, 0);
  background(0);
  stroke(255);

  dropzone = select('#dropzone');
  dropzone.drop(fileDropHandler);
}

const drawPortrait = e => {
  e.preventDefault();

  if (img == null || !fileAvailable) {
    return;
  }

  let { paddingSizeInput: { value: paddingSize },
          maskSizeInput: { value: maskSize},
          roundSelect: { value: roundSelect},
          displayImageInput: { checked: displayImage },
        } = e.target.elements;
  clear();
  background(0);

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
  const roundingMethod = roundingMethods[roundSelect];

  for (let y = 0; y < img.height; y += maskSize + 1) {
    for (let x = 0; x < img.width; x += maskSize + 1) {
      const avgLum = averageMaskLuminance(x, y, config);
      const brightness = roundingMethod((avgLum / 255) * 7);

      const i = x + halfMaskSize;
      const j = y + halfMaskSize;
      drawDeathlyHallows(i, j, brightness, config);
    }
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

const drawElderWand = (x, y, { halfMaskSize, paddingSize}) => {
  line(x, y - halfMaskSize + paddingSize, x, y + halfMaskSize - paddingSize);
}

const drawResurrectionStone = (x, y, { paddingSize, halfMaskSize, maskSize, halfPaddingSize }) => {
  noFill();
  circle(x, y + (maskSize / 4) - halfPaddingSize, halfMaskSize - paddingSize);
}

const drawInvisibilityCloak = (x, y, { halfMaskSize, paddingSize}) => {
  noFill();
  triangle(x - halfMaskSize + paddingSize, y + halfMaskSize - paddingSize,
            x + halfMaskSize - paddingSize, y + halfMaskSize - paddingSize,
            x, y - halfMaskSize + paddingSize);
}

const drawDeathlyHallows = (x, y, brightness, config) => {
  switch(brightness) {
    case 0:
      return;
    case 1:
      drawElderWand(x, y, config);
      return;
    case 2:
      drawResurrectionStone(x, y, config);
      return;
    case 3:
      drawInvisibilityCloak(x, y, config);
      return;
    case 4:
      drawElderWand(x, y, config);
      drawResurrectionStone(x, y, config);
      return;
    case 5:
      drawElderWand(x, y, config);
      drawInvisibilityCloak(x, y, config);
      return;
    case 6:
      drawResurrectionStone(x, y, config);
      drawInvisibilityCloak(x, y, config);
      return;
    case 7:
      drawElderWand(x, y, config);
      drawResurrectionStone(x, y, config);
      drawInvisibilityCloak(x, y, config);
  }
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
  let filename = e.target.elements.saveFilename.value || 'DeathlyHallowsPortrat';
  saveCanvas(`${filename}-${Date.now().toString()}`, 'jpg');
  e.preventDefault();
  return false;
}

function draw() {
  noLoop();
}
