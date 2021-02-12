// TODO
// break ties for food based on distance not order in buffer
// expose these factors as controls
const CELL_RADIUS = 2.5;
const MIN_VISION_RADIUS = 50;
const MAX_VISION_RADIUS = 100;
const FOOD_COLOR = 'green';
const CELL_COLOR = 0;
const FOOD_RADIUS = 5;
const MIN_CELL_SPEED = 1;
const MAX_CELL_SPEED = 5;
const EAT_RADIUS = 5;
const MAX_ENERGY = 5000;
const MIN_ENERGY = 3000;
const MIN_BREED_RADIUS = 5;
const MAX_BREED_RADIUS = 15;
const MIN_BREED_RATE = 500;
const MAX_BREED_RATE = 1000;
const FOOD_ENERGY = 100;
const MUTATION_LOWER_BOUND = 0.8;
const MUTATION_UPPER_BOUND = 1.2;
const FOOD_SPAWN_RATE = 0.2;
const BREED_ENERGY_COST = 500;
const MIN_ENERGY_TO_BREED = MIN_ENERGY * 0.8;
const MIN_BREED_AGE = 500;
const INITIAL_FOOD = 30;
const INITIAL_POPULATION = 10;
const MAX_POPULATION = 50;
const MAX_FOOD = 50;

const DEBUG = false;
let c, running = true, foods = Array(MAX_FOOD), cells = Array(MAX_POPULATION);

function setup() {
  angleMode(DEGREES);
  c = createCanvas(800, 800);
  c.mouseClicked(startStop);

  stroke(CELL_COLOR);
  for (let i = 0; i < INITIAL_POPULATION; i++) {
    cells[i] = createCell();
  }

  stroke(FOOD_COLOR);
  for (let i = 0; i < INITIAL_FOOD; i++) {
    foods[i] = { x: random(c.width), y: random(c.height), consumed: false };
  }
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

function draw() {
  background(220);
  spawnFood();

  ajudicateInteractions();

  stroke(FOOD_COLOR);
  foods.forEach(food => drawFood(food));
  cells.forEach(cell => drawCell(cell));
}

// TODO refine
const metabolism = ({vision, speed, breedRadius, maxEnergy}) => ((speed * speed) + vision + (speed * speed) + breedRadius + (maxEnergy / 1000)) / 75;

const drawCell = cell => {
  if (!cell.alive) {
    return;
  }

  const { x, y } = cell;

  let moveTo = null;
  // look for food
  if (cell.energy < cell.maxEnergy) {
    let closestFood = null, closestFoodDist = 0;
    foods.forEach(food => {
      if (food.consumed) {
        return;
      }
      const distance = dist(x, y, food.x, food.y);
      if (distance < cell.vision) {
        if (closestFood == null || closestFoodDist > distance) {
          closestFood = food;
          closestFoodDist = distance;
        }
      }
    });

    // look for food
    if (closestFood) {
      if (dist(closestFood.x, closestFood.y, x, y) < EAT_RADIUS && cell.energy < cell.maxEnergy) {
        closestFood.consumed = true;
        cell.energy += FOOD_ENERGY;
        moveTo = closestFood;
      } else {
        cell.heading = atan2(closestFood.y - y, closestFood.x - x);
      }
    }
  }

  // move cell
  if (moveTo != null) {
    // to prevent dithering around food
    cell.x = moveTo.x;
    cell.y = moveTo.y;
  } else {
    const delta = getDisplacement(cell.heading, cell.speed);
    cell.x += delta.x;
    cell.y += delta.y;
  }

  if (cell.x < 0 || cell.x > c.width || cell.y < 0 || cell.y > c.height) {
    cell.heading = random(360);
    cell.x = clamp(x, 0, c.width);
    cell.y = clamp(y, 0, c.height);
  }

  // draw the cell
  const alpha = map(cell.energy, 0, cell.maxEnergy, 0, 255);
  stroke(CELL_COLOR, alpha)
  fill(CELL_COLOR, alpha);
  circle(x, y, CELL_RADIUS * 2);

  if (DEBUG) {
    // draw metabolism
    text(metabolism(cell).toPrecision(4), x - 10, y - 10);
    // draw breed cooldown
    line(x - 10, y + 10, (x - 10) + (20 * cell.breedCooldown / cell.breedRate), y + 10);
  }

  noFill();
  circle(x, y, cell.vision * 2);
  circle(x, y, cell.breedRadius * 2);

  // update
  const cost = metabolism(cell);
  console.log(cost);
  cell.energy -= metabolism(cell);
  cell.age++;
  cell.breedCooldown = Math.max(cell.breedCooldown - 1, 0);
  if (cell.energy < 1) {
    cell.alive = false;
  }
};

const ajudicateInteractions = () => {
  const attemptingToBreed = {};

  cells.forEach((cellA, cellAIndex) => {
    if (!cellA.alive) {
      return;
    }

    // build a DAG of breeding attempts
    if (canBreed(cellA)) {
      cells.forEach((cellB, cellBIndex) => {
        if (!cellB.alive || !canBreed(cellB) || cellAIndex == cellBIndex) {
          return;
        }
        const distance = dist(cellA.x, cellA.y, cellB.x, cellB.y);
        if (distance < cellA.breedRadius && distance < cellB.breedRadius) {
          if (!attemptingToBreed[cellAIndex] || attemptingToBreed[cellAIndex].dist > distance) {
            attemptingToBreed[cellAIndex] = { cellIndex: cellBIndex, distance };
          }
        }
      });
    }
  });

  // ajudicate breeding attempts
  for (const cell in attemptingToBreed) {
    const partner = attemptingToBreed[cell];
    const partnersPartner = attemptingToBreed[partner.cellIndex].cellIndex;
    if (partnersPartner == cell && cell < partner.cellIndex) {
      breed(cells[attemptingToBreed[cell].cellIndex], cells[partner.cellIndex]);
    }
  }
};

const drawFood = food => {
  if (food.consumed) {
    return;
  }

  fill(FOOD_COLOR);
  circle(food.x, food.y, FOOD_RADIUS);
};

const canBreed = cell =>
  cell.energy > MIN_ENERGY_TO_BREED &&
  cell.age > MIN_BREED_AGE &&
  cell.breedCooldown == 0;

const mutationFactor = value => value * random(MUTATION_LOWER_BOUND, MUTATION_UPPER_BOUND);

const breed = (cellA, cellB) => {
  cellA.energy -= BREED_ENERGY_COST;
  cellB.energy -= BREED_ENERGY_COST;
  cellA.breedCooldown = cellA.breedRate;
  cellB.breedCooldown = cellB.breedRate;

  for (let i = 0; i < MAX_POPULATION; i++) {
    if (!cells[i] || !cells[i].alive) {
      const energy = mutationFactor((cellA.maxEnergy + cellB.maxEnergy) / 2);
      const breedRate = mutationFactor((cellA.breedRate + cellB.breedRate) / 2);
      cells[i] = {
        age: 0,
        breedRate,
        breedCooldown: breedRate,
        breedRadius: mutationFactor((cellA.breedRadius + cellB.breedRadius) / 2),
        x: (cellA.x + cellB.x) / 2,
        y: (cellA.y + cellB.y) / 2,
        heading: random(360),
        alive: true,
        energy,
        maxEnergy: energy,
        speed: mutationFactor((cellA.speed + cellB.speed) / 2),
        vision: mutationFactor((cellA.vision + cellB.vision) / 2),
      };
      break;
    }
  }
};

const createCell = () => {
  const energy = random(MIN_ENERGY, MAX_ENERGY);
  const breedRate = random(MIN_BREED_RATE, MAX_BREED_RATE);
  return {
    age: 0,
    breedRate,
    breedCooldown: breedRate,
    breedRadius: random(MIN_BREED_RADIUS, MAX_BREED_RADIUS),
    x: random(c.width),
    y: random(c.height),
    heading: random(360),
    alive: true,
    energy,
    maxEnergy: energy,
    speed: random(MIN_CELL_SPEED, MAX_CELL_SPEED),
    vision: random(MIN_VISION_RADIUS, MAX_VISION_RADIUS),
  }
};

const spawnFood = () => {
  if (random() < FOOD_SPAWN_RATE) {
    for (let i = 0; i < MAX_FOOD; i++) {
      if (!foods[i] || foods[i].consumed) {
        foods[i] = { x: random(c.width), y: random(c.height), consumed: false };
        break;
      }
    }
  }
};

const clamp = (value, x, y) => Math.max(x, Math.min(y, value));

const getDisplacement = (angle, speed) =>
  ({ x: speed * cos(angle), y: speed * sin(angle)});
