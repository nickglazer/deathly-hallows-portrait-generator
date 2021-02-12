const G = 9.8;
const dt = 1;
const SOFTENING_CONSTANT = 0.15;

let running = true, c;

const bodies = [
  {
    name: "Sun",
    m: 1, // in solar masses
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0
  }
];

function setup() {
  c = createCanvas(800, 800, WEBGL);
  c.mouseClicked(generateBody);
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

const generateBody = () => {
  bodies.push({
    name: random(),
    m: random(0.000001, 0.01),
    x: random(-300, 300),
    y: random(-300, 300),
    z: random(-300, 300),
    vx: -0.09,
    vy: 0.09,
    vz: 0.09,
  })
}

function draw() {
  background(220);
  rotateX(map(mouseX, 0, c.height, PI / -15, PI))
  bodies.forEach(updatePositionVectors);
  bodies.forEach(updateAccelerationVectors);
  bodies.forEach(updateVelocityVectors);

  drawAxis();
  stroke(255);
  bodies.forEach(drawBody);
}

const drawAxis =() => {
  strokeWeight(1);
  stroke('blue');
  line(0, 0, 0, 0, 0, 50);
  stroke('green');
  line(0, 0, 0, 0, 50, 0);
  stroke('red');
  line(0, 0, 0, 50, 0, 0);
}

const drawBody = ({ name, m, x, y, z }) => {
  // text(name, x, y);
  beginShape(POINTS);
  strokeWeight(map(m, 0, 1, 5, 10));
  vertex(x, y, z);
  endShape(CLOSE);
};

const updatePositionVectors = body => {
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  body.z += body.vz * dt;
}

const updateVelocityVectors = body => {
  body.vx += body.ax * dt;
  body.vy += body.ay * dt;
  body.vz += body.az * dt;
}

const updateAccelerationVectors = (body, i) => {
  let ax = 0;
  let ay = 0;
  let az = 0;

  for (let j = 0; j < bodies.length; j++) {
    if (i !== j) {
      const massJ = bodies[j];

      const dx = massJ.x - body.x;
      const dy = massJ.y - body.y;
      const dz = massJ.z - body.z;

      const distSq = (dx * dx) + (dy * dy) + (dz * dz);

      const f =
        (G * massJ.m) /
        (distSq * Math.sqrt(distSq + SOFTENING_CONSTANT));

      ax += dx * f;
      ay += dy * f;
      az += dz * f;
    }
  }

  body.ax = ax;
  body.ay = ay;
  body.az = az;
}
