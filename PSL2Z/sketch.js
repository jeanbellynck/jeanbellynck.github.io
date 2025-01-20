

function setup() {
  frameRate(10);
  padding = 200;
  widthPerSquare = 100;

  maxX = 5;
  maxY = 5;
  
  actualWidth = (2*maxX)  * widthPerSquare + 2*padding;
  actualHeight = maxY * widthPerSquare + 2*padding;
  createCanvas(actualWidth, actualHeight);





  //Set Cell Stroke Weight
	voronoiCellStrokeWeight(1);
	//Set Site Stroke Weight
	voronoiSiteStrokeWeight(3);
	//Set Cell Stroke
	voronoiCellStroke(0);
	//Set Site Stroke
	voronoiSiteStroke(0);
	//Set flag to draw Site
	voronoiSiteFlag(true);


	//Add array of custom sites
	voronoiSites([[5,5],[10,5],[15,5]]);

	//Add array of custom sites with custom colors associated (255 = white)
	voronoiSites([[5,20,255],[10,20,255],[15,20,255]]);

	//Remove custom site with coordinates 15,5
	voronoiRemoveSite(15, 5);


	//Add custom site with coordinates i*30,50
	for (var i = 0; i < 10; i++) {
		voronoiSite(i * 30, 50);
	}

	//Add custom site with custom color at coordinates 50,100 (255 = white)
	voronoiSite(50, 100, 255);

	//Clear custom sites (does not clear random sites)
	//voronoiClearSites();

	//Jitter Settings (These are the default settings)

	//Compute voronoi diagram with size 700 by 500
	//With a prepared jitter structure (true)
}


function draw() {
  background(220);
  voronoiClearSites();
  
  // Get mouse position in math units
  let mousePos = createVector(mouseX, mouseY);
  points = getPSL2ZPoints(screenToMath(mousePos), 2, 0);
  strokeWeight(10);
  point(mousePos);

  print("points: " + points);

  // Draw points
  /*
  for (let i = 0; i < points.length; i++) {
    //print(points[i]);
    let p = points[i];
    point(mathToScreen(p));
  }*/



	voronoi(2*maxX*widthPerSquare, maxY*widthPerSquare, false);
	let voronoiPos = mathToScreen(createVector(-maxX,maxY));
  voronoiDraw(voronoiPos.x, voronoiPos.y, true, false);
  //voronoiDraw(voronoiPos.x, voronoiPos.y, true, false);

  drawNumberAxes();
}

function drawNumberAxes() {
  // Draw the x axis
  strokeWeight(1);

  print("maxX: " + maxX);
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

function getPSL2ZPoints(originalPoint, iterations) {
  let modulo = 0;
  let pPos = mathToScreen(originalPoint);
  voronoiSite(pPos.x-padding, pPos.y-padding, moduloToColor(modulo));
  movePoints(originalPoint,iterations, modulo);
  invertPoint(originalPoint, iterations, modulo);
  
}

function movePoints(originalPoint, iterations, modulo1) {
  if (iterations == 0) {
    return;
  }else{
    iterations--;
  }
  for (let i = -4; i <= 4; i+=1) {
    if (i == 0) {
      continue;
    }
    let newPoint = createVector(originalPoint.x + i, originalPoint.y);
    let pPos = mathToScreen(newPoint);
    voronoiSite(pPos.x-padding, pPos.y-padding, moduloToColor(modulo1+i));
    invertPoint(newPoint, iterations, modulo1+i);
  }
}

function invertPoint(point, iterations, modulo) {
  let invP = createVector(-point.x/point.magSq(), point.y/point.magSq());
  let pPos = mathToScreen(invP);
  voronoiSite(pPos.x-padding, pPos.y-padding, moduloToColor(modulo-1));
  movePoints(invP, iterations, modulo-1);
}

function moduloToColor(modulo2) {
  if ((modulo2+20)%2 == 0) return color(200,100,100);
  if ((modulo2+20)%2 == 1) return color(100,200,100);
  //if ((modulo2+30)%3 == 2) return color(100,100,200);
}

