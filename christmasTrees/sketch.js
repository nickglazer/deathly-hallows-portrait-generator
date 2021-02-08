function setup() {
  angleMode(DEGREES);
  createCanvas(1200, 500);
  background(255);

  const form = document.getElementById('parameterForm');
  form.addEventListener('submit', drawSketchHandler);

  const randomForm = document.getElementById('randomForm');
  randomForm.addEventListener('submit', drawRandomSketch);

  const saveForm = document.getElementById('saveForm');
  saveForm.addEventListener('submit', saveCanvasHandler);

  drawRandomSketch();
}

const renderTree = x => {
  const treeX = (x * 400) + 200;
  const numberOfBranchLevels = random(5, 30);
  const treeHeight = random(100, 400);
  const treeWidth = random(50, 150);
  const trunkThickness = random(3);
  const stumpHeight = random(10, 30);
  const branchIncrement = treeHeight / numberOfBranchLevels;
  const branchLengthIncrement = treeWidth / numberOfBranchLevels;
  const rotation = random(5, 20);
  const treeY = (500 - treeHeight) / 2;

  const branchRotation =
        (random(0, 1) > 0.5) ? ~rotation : Math.round(rotation);
  strokeWeight(trunkThickness);
  line(treeX, treeY, treeX, treeY + treeHeight + stumpHeight);

  for (let branchLevel = 0; branchLevel < numberOfBranchLevels; branchLevel++) {
    const maxLevelWidth = branchLevel * branchLengthIncrement;
    const branchY = (branchLevel * branchIncrement) + treeY;
    
    renderBranch(-1, treeX, branchY, maxLevelWidth, branchRotation, trunkThickness);
    renderBranch(1, treeX, branchY, maxLevelWidth, branchRotation, trunkThickness);
  }
}

const renderBranch = (side, x, y, maxLevelWidth, rotation, trunkThickness) => {
  const length = maxLevelWidth * random(0.8, 1);
  const endX = x + (side* (length * cos(rotation)));
  const endY = y + (length * sin(rotation));

  const numSubBranches = random(10, 30);
  
  for (let i = 0; i < numSubBranches; i++) {
    const startPos = random(0, 0.75);
    const len = random(0.125, 0.375);
    const start = { x : lerp(x, endX, startPos), y: lerp(y, endY, startPos) };
    const end = { x : lerp(x, endX, startPos + len), y: lerp(y, endY, startPos + len) };

    const size = Math.hypot(endX - x, endY - y);
    const maxRotation = map(
      size,
      maxLevelWidth * 0.8,
      maxLevelWidth,
      2,
      8
    );

    strokeWeight(random(0.25, 0.75) * trunkThickness)
    line(start.x, start.y, end.x, end.y + random(-maxRotation, maxRotation));
  }
}

const drawSketchHandler = e => {
  e.preventDefault();
  let { seed: { value: seed } } = e.target.elements;
  drawSketch(seed);
  return false;
}

const drawRandomSketch = e => {
  if (e) {
    e.preventDefault();
  }
  const newSeed = Math.round(random(100000000));
  select('#seed').value(newSeed)
  drawSketch(newSeed);
  return false;
}

const drawSketch = seed => {
  clear();
  background(255);
  randomSeed(seed);

  for (let i = 0; i < 3; i ++) {
    renderTree(i);
  }
}

const saveCanvasHandler = e => {
  let filename = e.target.elements.saveFilename.value || 'ChristmasTreeSketches';
  saveCanvas(`${filename}-${Date.now().toString()}`, 'png');
  e.preventDefault();
  return false;
}

function draw() {
  noLoop();
}
