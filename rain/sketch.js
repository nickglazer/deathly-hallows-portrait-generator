const Y_INTERVAL = 5;
const DROP_LENGTH = 6;
const CANVAS_HEIGHT = 1100;
const CANVAS_WIDTH = 1900;
const SPEED = 30;
const LAYERS = 8;
const NUMBER_OF_GENERATIONS = Math.ceil(CANVAS_HEIGHT / SPEED);
const BG_COLOR = 40;

let SPAWN_THRESHOLD = 0.8;
let y = 0, generationIndex = 0, generations = new Array(NUMBER_OF_GENERATIONS), running = true;

function setup() {
  frameRate(30);
  c = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  c.mouseClicked(startStop);
  noFill();
  select('#threshold').changed(thresholdChanged);
}

function keyPressed() {
  if (keyCode === 32) {
    startStop();
  }
}

const startStop = () => {
  if (running) {
    noLoop();
    running = false;
  } else {
    loop();
    running = true;
  }
}

const thresholdChanged = e => {
  SPAWN_THRESHOLD = map(e.target.value, 0.1 , 0.9, 0.65, 0.85);
}

const drawSketchHandler = e => {
  e.preventDefault();
  noLoop();
  clear();
  background(BG_COLOR);
  loop();
  return false;
}

const moduloArithmetic = (a, b, max) => (a + b) % max;

function draw() {
  background(BG_COLOR);

  const generation = [];

  for (let i = 0; i < CANVAS_WIDTH; i += 3) {
    const value = noise(i, y);
    if (value > SPAWN_THRESHOLD) {
      const z = map(value, SPAWN_THRESHOLD, 1, 0, LAYERS);
      generation.push({
        x: i,
        y: 0,
        z,
        speed: map(value, SPAWN_THRESHOLD, 1, SPEED / 2, SPEED),
        color: 255 * z,
        thickness: 2 * z,
        opacity: 255,
        r: 0,
      });
    }
  }

  generations[generationIndex] = generation;
  generations.forEach(generation => generation.forEach(drop => {
    if (generation[0].y / (generation[0].speed * NUMBER_OF_GENERATIONS) > 0.83) {
      drawSplash(drop);
    } else {
      drawDrop(drop);
    }
  }));

  y = moduloArithmetic(y, 5, 400);
  generationIndex = moduloArithmetic(generationIndex, 1, NUMBER_OF_GENERATIONS);
}

const drawDrop = drop => {
  const { x, y, z, speed, color, thickness } = drop;
  stroke(color);
  strokeWeight(thickness);
  line(x, y, x, y + (DROP_LENGTH * z));
  drop.y += speed;
};

const drawSplash = drop => {
  const { x, y, z, color, thickness, opacity, r } = drop;
  stroke(color, opacity);
  strokeWeight((thickness / 2) * (drop.opacity / 255));
  ellipse(x, y, (2 * r) * z, (r / 2) * z);
  drop.opacity -= 30;
  drop.r++;
};
