const DEBUG = false;
const SCALE = 4;
const CELL_COLOR = 'white';
const THREE_D = true;
const INITIAL_POPULATION = 10000;
const FRAME_RATE = 3;
const B = [4];
const S = [4, 8];
let c, running = true, cells;

function setup() {
  frameRate(FRAME_RATE);
  c = createCanvas(400, 400, THREE_D ? WEBGL : P2D);
  c.mouseClicked(startStop);

  cells = Array(Number(c.width / SCALE));
  for (let i = 0; i < cells.length; i++) {
    const column = Array(Number(c.height / SCALE)).fill(0)
    cells[i] = column;
    if (THREE_D) {
      for (let j = 0; j < 100; j++) {
        cells[i][j] = Array(100).fill(0);
      }
    }
  }

  stroke(CELL_COLOR);
  fill(CELL_COLOR);

  for (let i = 0; i < INITIAL_POPULATION; i++) {
    const x = Math.round(random(1, (c.width / SCALE) - 1)), y = Math.round(random(1, (c.height / SCALE) - 1)), z = Math.round(random(1, 99));
    
    if (THREE_D) {
      cells[x][y][z] = 1;
    } else {
      cells[x][y] = 1;
    }
  }

  if (THREE_D) {
    strokeWeight(0.5);
  }
}

function keyPressed() {
  if (keyCode === 32) {
    startStop();
  }
}

const startStop = () => {
  if (running) {
    // noLoop();
    running = false;
  } else {
    loop();
    running = true;
  }
}

function draw() {
  background(0);

  if (THREE_D) {
    translate(-c.width / 2, -c.height / 2, -500);
    rotate(map(mouseX, 0, c.height, PI / -15, PI), new p5.Vector(1, 1, 1));
    draw3D();
  } else {
    draw2D();
  }
}

const draw2D = () => {
  for (let i = 1; i < cells.length - 1; i++) {
    for (let j = 1; j < cells[0].length - 1; j++) {
      const neighbors = checkNeighbors2D(i, j);
      if (cells[i][j] == 1) {
        rect(i * SCALE, j * SCALE, SCALE, SCALE);
        if (!S.includes(neighbors)) {
          cells[i][j] = 0;
        }
      } else {
        if (B.includes(neighbors)) {
          cells[i][j] = 1;
        }
      }
    }
  }
}

const draw3D = () => {
  beginShape(POINTS);
  for (let i = 1; i < cells.length - 1; i++) {
    for (let j = 1; j < cells[0].length - 1; j++) {
      for (let k = 1; k < cells[0][0].length - 1; k++) {
        const neighbors = checkNeighbors3D(i, j, k);
        if (cells[i][j][k] == 1) {
          vertex(i * SCALE, j * SCALE, k * SCALE);
          if (!S.includes(neighbors)) {
            cells[i][j][k] = 0;
          }
        } else {
          if (B.includes(neighbors)) {
            cells[i][j][k] = 1;
          }
        }
      }
    }
  }
  endShape();
};

const checkNeighbors2D = (x, y) => {
  let neighbors = 0;
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (!(dx == 0 && dy == 0)) {
        if (cells[x + dx][y + dy]) {
          neighbors++;
        }
      }
    }
  }
  return neighbors;
};

const checkNeighbors3D = (x, y ,z) => {
  let neighbors = 0;
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      for (let dz = -1; dz < 2; dz++) {
        if (!(dx == 0 && dy == 0 && dz == 0)) {
          if (cells[x + dx][y + dy][z + dz]) {
            neighbors++;
          }
        }
      }
    }
  }
  return neighbors;
}
