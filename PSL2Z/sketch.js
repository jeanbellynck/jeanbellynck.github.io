

function setup() {

  frameRate(10);
  padding = 200;
  widthPerSquare = 100;

  maxX = 5;
  maxY = 5;
  
  actualWidth = (2*maxX)  * widthPerSquare + 2*padding;
  actualHeight = maxY * widthPerSquare + 2*padding;
  let myCanvas = createCanvas(actualWidth, actualHeight);
  // Embed into html
  myCanvas.parent('myContainer1');

  view = 1;
}


function draw() {
  // If anything goes wrong dont draw anything new
  try {
    voronoiClearSites();
    // Calculate the voronoi diagram
    let mousePos = createVector(mouseX, mouseY);
    points = []
    getPSL2ZPoints(screenToMath(mousePos), 0.1);

    voronoi(2*maxX*widthPerSquare, maxY*widthPerSquare, false);

    // Draw
    background(220);

    let voronoiPos = mathToScreen(createVector(-maxX,maxY));
    voronoiDraw(voronoiPos.x, voronoiPos.y, true, false);
    
    //
    if(view == 1) {
      drawPSL2ZCircles();
    } else if (view == 2) {
      drawFareyCircles();
    }
    drawNumberAxes();

  } catch (e) {
    print(e);
  }
}

function keyPressed() {
  if (key === '1') {
    view = 1;
  }
  if (key === '2') {
    view = 2;
  }
  if (key === '3') {
    view = 3;
  }
}

function drawNumberAxes() {
  // Draw the x axis
  strokeWeight(1);

  let xAxisStart = mathToScreen(createVector(-maxX,0));
  let xAxisEnd = mathToScreen(createVector(maxX,0));
  line(xAxisStart.x, xAxisStart.y,xAxisEnd.x, xAxisEnd.y);

  // Draw the y axis
  let yAxisStart = mathToScreen(createVector(0,0));
  let yAxisEnd = mathToScreen(createVector(0,maxY));
  line(yAxisStart.x, yAxisStart.y,yAxisEnd.x, yAxisEnd.y);

  // Draw the x axis numbers
  for (let i = -maxX; i <= maxX; i++) {
    textAlign(CENTER, TOP);
    let markPos = mathToScreen(createVector(i,0));
    text(i, markPos.x, markPos.y+10);
    line(markPos.x,markPos.y-5,markPos.x,markPos.y+5);
  }
  // Draw the y axis numbers
  for (let i = 1; i <= maxY; i++) {
    textAlign(LEFT, CENTER);
    let markPos = mathToScreen(createVector(0,i));
    text(i, markPos.x+10, markPos.y);
    line(markPos.x-5,markPos.y,markPos.x+5,markPos.y);
  }
}

function mathToScreen(p) {
  return createVector(padding + widthPerSquare*(maxX+p.x), padding + widthPerSquare*(maxY-p.y));
}

function screenToMath(p) {
  return createVector((p.x - maxX*widthPerSquare - padding) / widthPerSquare, maxY-(p.y - padding) / widthPerSquare);
}


function getPSL2ZPoints(originalPoint, accuracy) {
  let modulo = 0;
  let pPos = mathToScreen(originalPoint);
  voronoiSite(pPos.x-padding, pPos.y-padding, elementToColor(""));
  movePoints(originalPoint,accuracy, "");
  invertPoint(originalPoint, accuracy, "");


  
}

function movePoints(originalPoint, accuracy, element) {
  let movedPoints = [];
  for (let i = -2*maxX; i <= 2*maxX; i+=1) {
    if (i == 0) {
      continue;
    }
    let newPoint = createVector(originalPoint.x + i, originalPoint.y);
    if(newPoint.x < -maxX || newPoint.x > maxX || newPoint.y < accuracy || inPointCloud(newPoint, accuracy)) {continue};
    points.push(newPoint);
    let pPos = mathToScreen(newPoint);
    let newElement;
    if(i < 0) {
      newElement = element + ("L".repeat(-i)); 
    } else {
      newElement = element + ("R".repeat(i));
    }
    voronoiSite(pPos.x-padding, pPos.y-padding, elementToColor(newElement));
    movedPoints[i] = newPoint;
  }
  // We do two seperate loops to make sure that the points are in the right order
  for (let i = -2*maxX; i <= 2*maxX; i+=1) {
    if(movedPoints[i] == undefined) {continue;}
    if(i < 0) {
      newElement = element + ("L".repeat(-i)); 
    } else {
      newElement = element + ("R".repeat(i));
    }
    invertPoint(movedPoints[i], accuracy, newElement);
  }

}

function invertPoint(point, accuracy, element) {
  let newPoint = createVector(-point.x/point.magSq(), point.y/point.magSq());
  if(newPoint.x < -maxX || newPoint.x > maxX || newPoint.y < accuracy || inPointCloud(newPoint, accuracy)) {return;}
  points.push(newPoint);
  let pPos = mathToScreen(newPoint);
  let newElement = element + "Q";
  voronoiSite(pPos.x-padding, pPos.y-padding, elementToColor(newElement));
  movePoints(newPoint, accuracy, newElement);
}

function inPointCloud(point, accuracy) {
  // Check if the point is in the set (or in the accuracy-neighbourhood)
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    if (p.dist(point) < accuracy) {
      return true;
    }
  }
  return false;
}

function elementToColor(element) {
  element = element.replace(/RQRQRQ/g, "");
  element = element.replace(/LQLQLQ/g, "");
  element = element.replace(/QRQRQR/g, "");
  element = element.replace(/QLQLQL/g, "");
  element = element.replace(/QQ/g, "");
  if(view < 4) {
    // Remove any "RQRQRQ" or "LQLQLQ" from the element

    // Count the R's in the element
    let modulo = 0;
    modulo = modulo + element.split("R").length - 1;
    modulo = modulo - element.split("L").length - 1;
    modulo = modulo - element.split("Q").length - 1;

    if ((modulo+2000)%2 == 0) return color(200,100,100);
    if ((modulo+2000)%2 == 1) return color(100,200,100);
  } else {
    print(element);
    let qCount = element.split("Q").length - 1;
    if(qCount == 0) return color(200,100,100);
    if(qCount == 1) {
      let firstWord = element.split("Q")[0];
      let modulo = 0;
      modulo = modulo + firstWord.split("R").length - 1;
      modulo = modulo - firstWord.split("L").length - 1;
      return color(100,150 + modulo*20,100);
    }
    if(qCount > 1) return color(255, 255, 255);
  }
  
}

function drawPSL2ZCircles() {
  strokeWeight(2);
  for (let i = -maxX; i < maxX; i++) {
    let lineStart = mathToScreen(createVector(i+0.5,0));
    let lineEnd = mathToScreen(createVector(i+0.5,maxY));
    line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  }
  for (let i = -maxX; i < maxX; i++) {
    let center = mathToScreen(createVector(i,0));
    let radius = widthPerSquare;
    noFill();
    if (i - 1 < -maxX || i + 1 > maxX) {continue;}
    arc(center.x, center.y, 2*radius, 2*radius, PI, 2*PI);
  }
  for (let i = -maxX; i < maxX; i++) {
    let footpoint1 = mathToScreen(createVector(i - 2.0/3,0));
    let footpoint2 = mathToScreen(createVector(i, 0));
    let footpoint3 = mathToScreen(createVector(i+ 2.0/3,0));
    noFill();
    if (i - 2/3 < -maxX || i+ 2/3 > maxX) {continue;}
    let diameter = (footpoint2.x - footpoint1.x);
    print(diameter);
    arc((footpoint2.x + footpoint1.x)/2, footpoint1.y, diameter, diameter, PI, 2*PI);
    arc((footpoint3.x + footpoint2.x)/2, footpoint2.y, diameter, diameter, PI, 2*PI);
  }
}

function drawFareyCircles() {
  strokeWeight(2);
  for (let i = -maxX; i < maxX; i++) {
    let lineStart = mathToScreen(createVector(i,0));
    let lineEnd = mathToScreen(createVector(i,maxY));
    line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  }
  for (let i = -maxX; i < maxX; i++) {
    let center = mathToScreen(createVector(i+0.5,0));
    let radius = widthPerSquare / 2;
    noFill();
    if (i - 1 < -maxX || i + 1 > maxX) {continue;}
    arc(center.x, center.y, 2*radius, 2*radius, PI, 2*PI);
  }
  for (let i = -maxX; i < maxX; i++) {
    let footpoint1 = mathToScreen(createVector(i - 1.0/2,0));
    let footpoint2 = mathToScreen(createVector(i, 0));
    let footpoint3 = mathToScreen(createVector(i+ 1.0/2,0));
    noFill();
    if (i - 2/3 < -maxX || i+ 2/3 > maxX) {continue;}
    let diameter = (footpoint2.x - footpoint1.x);
    print(diameter);
    arc((footpoint2.x + footpoint1.x)/2, footpoint1.y, diameter, diameter, PI, 2*PI);
    arc((footpoint3.x + footpoint2.x)/2, footpoint2.y, diameter, diameter, PI, 2*PI);
  }
}