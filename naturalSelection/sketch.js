const CELL_RADIUS = 5;
const VISION_RADIUS = 100;
const FOOD_COLOR = 'green';
const CELL_COLOR = 0;
const FOOD_RADIUS = 5;
const CELL_SPEED = 2;
const EAT_RADIUS = 4;

let foods = Array(30);
let cells = Array(30);


function setup() {
  angleMode(DEGREES);
  createCanvas(600, 600);
  stroke(CELL_COLOR);
  for (let i = 0; i < 5; i++) {
    cells[i] = {
      x: random(600),
      y: random(600),
      heading: random(360),
      alive: true,
      energy: 10000,
    };
  }
  stroke(FOOD_COLOR);
  for (let i = 0; i < 50; i++) {
    foods[i] = { x: random(600), y: random(600), consumed: false };
  }
}

function draw() {
  background(220);
  stroke(CELL_COLOR);
  cells.forEach(cell => drawCell(cell));
  stroke(FOOD_COLOR);
  foods.forEach(food => drawFood(food));
  spawnFood();
}

const clamp = (value, x, y) => Math.max(x, Math.min(y, value));

const getDisplacement = (x, y, angle) =>
  ({ x: CELL_SPEED * cos(angle), y: CELL_SPEED * sin(angle)});

const drawCell = cell => {
  if (!cell.alive) {
    return;
  }
  cell.energy -= 1;
  if (cell.energy < 1) {
    cell.alive = false;
    return;
  }
  const { x, y, heading, energy } = cell;
  fill(CELL_COLOR);
  circle(x, y, CELL_RADIUS);
  noFill();
  circle(x, y, VISION_RADIUS * 2);
  
  
  let closestFood = null, closestFoodDist = 0;
  foods.forEach(food => {
    if (food.consumed) {
      return;
    }
    const distance = dist(x, y, food.x, food.y);
    if (distance < VISION_RADIUS) {
      if (closestFood == null || closestFoodDist > distance) {
        closestFood = food;
        closestFoodDist = distance;
      }
    }
  });
  
  if (closestFood) {
    if (dist(closestFood.x, closestFood.y, x, y) < EAT_RADIUS) {
      closestFood.consumed = true;
      cell.energy += 5;
    } else {
      cell.heading = atan2(closestFood.y - y, closestFood.x - x);
    }
  }

  const delta = getDisplacement(x, y, cell.heading);
  cell.x += delta.x;
  cell.y += delta.y;
  
  if (cell.x < 0 || cell.x > 600 || cell.y < 0 || cell.y > 600) {
    cell.heading = random(360);
    cell.x = clamp(x, 0, 600);
    cell.y = clamp(y, 0, 600);
  }
  
};

const drawFood = food => {
  if (food.consumed) {
    return;
  }
  fill(FOOD_COLOR);
  circle(food.x, food.y, FOOD_RADIUS);
}

const spawnFood = () => {
  if (random() > 0.98) {
    for (let i = 0; i < 30; i++) {
      if (!foods[i] || foods[i].consumed) {
        foods[i] = { x: random(600), y: random(600), consumed: false };
        break;
      }
    }
  }
}
