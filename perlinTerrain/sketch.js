let FREQ = 2; // 1..7
let EXPONENT = 1; // 0.1..10
let WATER = 0.1;
let TERRACE = 0;

const scl = 25;
let terrain, moisture;
let w, h, cols, rows;

function setup() {
  noiseDetail(8, 0.2);
  frameRate(10);
  select('#frequency').changed(e => { FREQ = Number(e.target.value); generate(); loop(); });
  select('#exponent').changed(e => { EXPONENT = Number(e.target.value); generate(); loop(); });
  select('#waterLevel').changed(e => { WATER = Number(e.target.value); generate(); loop(); });
  select('#terrace').changed(e => { TERRACE = Number(e.target.value); generate(); loop(); });

  c = createCanvas(1600, 800, WEBGL)
  w = c.width * 3;
  h = c.height * 6;
  cols = w / scl;
  rows = h / scl;

  generate();
}

const generate = () => {
  terrain = Array(cols);
  moisture = Array(cols);
  for (var x = 0; x < cols; x++) {
    terrain[x] = Array(rows);
    moisture[x] = Array(rows);
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = (x / cols) * FREQ, ny = (y / rows) * FREQ;
      const elevation = Math.pow(1.2 * noise(nx, ny), EXPONENT);
      terrain[x][y] = elevation;
      if (TERRACE) {
        terrain[x][y] = Math.round(terrain[x][y] * TERRACE) / TERRACE;
      }
    }
  }
}

function draw() {
  background(0);
  noStroke();

  rotateX(PI / 4);
  rotateZ(PI / 4);
  translate(w / -1, -h, -2000);

  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols - 1; x++) {
      const nx = (x/cols), ny = (y/rows);
      fill(biome(terrain[x][y], noise(nx, ny)));
      vertex(x * scl, y * scl, mapElevation(terrain[x][y]));
      vertex(x * scl, (y + 1) * scl, mapElevation(terrain[x][y + 1]));
    }
    endShape(CLOSE);
  }
  noLoop();
}

const mapElevation = e => {
  if (e < WATER) {
    e = WATER - 0.1;
  }
  return map(e, 0, 1, -400, 400);
};

function biome(elevation, moisture) {     
  const OCEAN = color('#44447a');
  const BEACH = color('#033335a');
  const SCORCHED = color('#555555');
  const BARE = color('#888888');
  const TUNDRA = color('#bbbbaa');
  const SNOW = color('#fff');
  const TEMPERATE_DESERT = color('#c9d29b');
  const SHRUBLAND = color('#889977');
  const TAIGA = color('#99aa77');
  const GRASSLAND = color('#88aa55');
  const TEMPERATE_DECIDUOUS_FOREST = color('#679459');
  const TEMPERATE_RAIN_FOREST = color('#448855');
  const SUBTROPICAL_DESERT = color('#d2b98b');
  const TROPICAL_SEASONAL_FOREST = color('#559944');
  const TROPICAL_RAIN_FOREST = color('#337755');

  if (elevation < WATER) return OCEAN;
  if (elevation < 0.12) return BEACH;
  
  if (elevation > 0.8) {
    if (moisture < 0.1) return SCORCHED;
    if (moisture < 0.2) return BARE;
    if (moisture < 0.5) return TUNDRA;
    return SNOW;
  }

  if (elevation > 0.6) {
    if (moisture < 0.33) return TEMPERATE_DESERT;
    if (moisture < 0.66) return SHRUBLAND;
    return TAIGA;
  }

  if (elevation > 0.3) {
    if (moisture < 0.16) return TEMPERATE_DESERT;
    if (moisture < 0.50) return GRASSLAND;
    if (moisture < 0.83) return TEMPERATE_DECIDUOUS_FOREST;
    return TEMPERATE_RAIN_FOREST;
  }

  if (moisture < 0.16) return SUBTROPICAL_DESERT;
  if (moisture < 0.33) return GRASSLAND;
  if (moisture < 0.66) return TROPICAL_SEASONAL_FOREST;
  return TROPICAL_RAIN_FOREST;
}
