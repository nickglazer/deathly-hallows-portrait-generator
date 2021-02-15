const DEBUG = false;
let pixels = [], destinations = [];

function setup() {
  angleMode(DEGREES);
  createCanvas(520, 520);
  background(0);
  stroke(255);

  const form = document.getElementById('parameterForm');
  form.addEventListener('submit', drawSketchHandler);

  const randomForm = document.getElementById('randomForm');
  randomForm.addEventListener('submit', drawRandomSketch);

  const saveForm = document.getElementById('saveForm');
  saveForm.addEventListener('submit', saveCanvasHandler);

  drawRandomSketch();
}

const drawSketchHandler = e => {
  e.preventDefault();
  let { seed: { value: seed } } = e.target.elements;
  setupSketch(seed);
  return false;
}

const drawRandomSketch = e => {
  if (e) {
    e.preventDefault();
  }
  const newSeed = Math.round(random(100000000));
  select('#seed').value(newSeed)
  setupSketch(newSeed);
  return false;
}

const setupSketch = seed => {
  clear();
  background(255);
  randomSeed(seed);

  pixels = [], destinations = [];

  for (let i = 60; i < 461; i += 40) {
    let row = [], destinationsRow = [];
    for (let j = 60; j < 461; j += 40) {
      const x = (shouldNegative() * random(30)) + i;
      const y = (shouldNegative() * random(30)) + j;
      destinationsRow.push([x, y]);
      row.push([i, j]);
    }
    pixels.push(row);
    destinations.push(destinationsRow);
  }

  loop();
}

const saveCanvasHandler = e => {
  let filename = e.target.elements.saveFilename.value || 'SkewedGrid';
  saveCanvas(`${filename}-${Date.now().toString()}`, 'png');
  e.preventDefault();
  return false;
}

const shouldNegative = () => (random(0, 1) > 0.5) ? -1 : 1;

function draw() {
  background(0);
  let done = true;

  // move pixels
  for (let i = 0; i < pixels.length; i++) {
    for (let j = 0; j < pixels[0].length; j++) {
      const [destX, destY] = destinations[i][j];
      const [pixelX, pixelY] = pixels[i][j];
      const distance = dist(pixelX, pixelY, destX, destY);
      if (distance > 1) {
        done = false;
      }
      const heading = atan2(destY - pixelY, destX - pixelX);
      const delta = getDisplacement(heading, distance * 0.02);
      pixels[i][j] = [pixelX + delta.x, pixelY + delta.y];
    }
  }

  if (DEBUG) {
    for (let i = 0; i < destinations.length; i++) {
      for (let j = 0; j < destinations[0].length; j++) {
        circle(destinations[i][j][0], destinations[i][j][1], 2)
      }
    }
  }
  
  // draw
  for (let i = 1; i < pixels[0].length; i++) {
    const [currX, currY] = pixels[i][0];
    const [leftX, leftY] = pixels[i - 1][0];
    line(currX, currY, leftX, leftY);
  }
  
  for (let i = 1; i < pixels.length; i++) {
    const [currX, currY] = pixels[0][i];
    const [aboveX, aboveY] = pixels[0][i - 1];
    line(currX, currY, aboveX, aboveY);
  }
  
  for (let i = 1; i < pixels.length; i++) {
    for (let j = 1; j < pixels[0].length; j++) {
      const [currX, currY] = pixels[i][j];
      const [aboveX, aboveY] = pixels[i][j - 1];
      const [leftX, leftY] = pixels[i - 1][j];
      line(currX, currY, aboveX, aboveY);
      line(currX, currY, leftX, leftY);
    }
  }

  if (done) {
    noLoop();
  }
}

const getDisplacement = (angle, speed) =>
  ({ x: speed * cos(angle), y: speed * sin(angle)});
