var svg = document.getElementById("svg");
var G = document.getElementById("g");
var path = G.getAttributeNS(null, "d").trim();
var debug = document.getElementById("debug");

/**
 * Circle
 */
class Circle {
	private center: P;
	private r: string;
	private css: string;
	private id: string;
	private el: HTMLElement;

	constructor(p: P, r: string, css: string, id: string) {
		this.center = p;
		this.r = r;
		this.css = css;
		this.id = id;
		var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("class", this.css);
		circle.setAttribute("cx", this.center.x.toString());
		circle.setAttribute("cy", this.center.y.toString());
		circle.setAttribute("r", this.r);
		circle.setAttribute("id", this.id);
		svg.appendChild(circle);
		this.el = document.getElementById(this.id);
	}

	update(p: P) {
		this.center = p;
		this.el.setAttributeNS(null, "cx", p.x.toString());
		this.el.setAttributeNS(null, "cy", p.y.toString());
	}
}

/**
 * Line
 */
class Line {
	private p1: P;
	private p2: P;
	private css: string;
	private id: string;
	private el: HTMLElement;

	constructor(p1, p2, css, id) {
		this.p1 = p1;
		this.p2 = p2;
		this.css = css;
		this.id = id;
		var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
		line.setAttribute("points", this.p1.toPath() + " " + this.p2.toPath());
		line.setAttribute("class", this.css);
		line.setAttribute("id", this.id);
		svg.appendChild(line);
		this.el = document.getElementById(this.id);
	}
	update(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		this.el.setAttribute("points", this.p1.toPath() + " " + this.p2.toPath());
	}
}

/**
 * Point
 */
class P {
	x: number;
	y: number;
	constructor(point: string) {
		this.x = parseFloat(point.split(",")[0]);
		this.y = parseFloat(point.split(",")[1]);
	}
	toPath() {
		return this.x.toString() + "," + this.y.toString();
	}
}

/**
 * SVGPointC
 */
class SVGPointC {
	cp1: P;
	cp2: P;
	p: P;
	pCircle: any;
	cp1Circle: any;
	cp2Circle: any;
	cp1Line: any;
	cp2Line: any;

	constructor(cp1: P, p: P, cp2: P, i: number) {
		this.p = p;
		this.cp2 = cp2;
		this.cp1 = cp1;

		var pCircle: Circle = new Circle(p, "3", "currentPoint", "p-" + i);
		var cp1Circle: Circle = new Circle(cp1, "3", "controlPoint", "cp1-" + i); //blue
		var cp1Line: Line = new Line(p, cp1, "controlLine", "cl1-" + i)
		var cp2Circle: Circle = new Circle(cp2, "3", "controlPoint", "cp2-" + i); //green
		var cp2Line: Line = new Line(p, cp2, "controlLine", "cl2-" + i)

		this.pCircle = pCircle;
		this.cp1Circle = cp1Circle;
		this.cp2Circle = cp2Circle;
		this.cp1Line = cp1Line;
		this.cp2Line = cp2Line;
	}

	update(newX, newY, pointType) {
		switch (pointType) {
			case "p":
				var dx = this.p.x - newX;
				var dy = this.p.y - newY;
				var newP = new P(newX + "," + newY);
				var newCp1 = new P((this.cp1.x - dx) + "," + (this.cp1.y - dy));
				var newCp2 = new P((this.cp2.x - dx) + "," + (this.cp2.y - dy));
				break;
			case "cp1":
				var dx = this.cp1.x - newX;
				var dy = this.cp1.y - newY;
				var newP = this.p;
				var newCp1 = new P(newX + "," + newY);
				var newCp2 = new P((this.cp2.x + dx) + "," + (this.cp2.y + dy));
				break;
			case "cp2":
				var dx = this.cp2.x - newX;
				var dy = this.cp2.y - newY;
				var newP = this.p;
				var newCp1 = new P((this.cp1.x + dx) + "," + (this.cp1.y + dy));
				var newCp2 = new P(newX + "," + newY);
				break;
		}

		this.p = newP;
		this.cp1 = newCp1;
		this.cp2 = newCp2;

		this.pCircle.update(newP);
		this.cp1Circle.update(newCp1);
		this.cp2Circle.update(newCp2);
		this.cp1Line.update(newP, newCp1);
		this.cp2Line.update(newP, newCp2);
	}
}

/**
 * SVGMPoint
 */
class SVGPointM {
	p: P;
	cp2: P;
	pCircle: Circle;
	cp2Circle: Circle;
	cp2Line: Line;

	constructor(p: P, cp2: P) {
		this.p = p;
		this.cp2 = cp2;

		var pCircle: Circle = new Circle(p, "3", "currentPoint", "p-1");
		var cp2Circle: Circle = new Circle(cp2, "3", "controlPoint", "cp2-1");
		var cp2Line: Line = new Line(p, cp2, "controlLine", "cl2-1")

		this.pCircle = pCircle;
		this.cp2Circle = cp2Circle;
		this.cp2Line = cp2Line;
	}
}

/**
 * SVG Path
 */
class MySVGPath {
	points: Array<any>;

	constructor(d: string) {
		var temp = d.replace(/[A-Z]/g, "").split(" ");
		var cleanArr = temp.filter(s => s != "");

		//draw first point svgpointM
		var p1: P = new P(cleanArr[0]);
		var p2: P = new P(cleanArr[1]);
		var pkt1 = new SVGPointM(p1, p2);
		this.points = [];
		this.points.push(pkt1);

		//draw points
		var i: number;
		var k = 1;
		for (i = 2; i <= cleanArr.length - 3; i += 3) {
			let cp1 = new P(cleanArr[i]);
			let p = new P(cleanArr[i + 1]);
			let cp2 = new P(cleanArr[i + 2]);
			var pkt = new SVGPointC(cp1, p, cp2, k);
			this.points.push(pkt);
			k++;
		}
	}

	draw() {
		var newPath: string = "";
		this.points.forEach((pkt, i) => {
			if (i == 0) {
				newPath += "M " + pkt.p.toPath();
				newPath += " C " + pkt.cp2.toPath();
			} else {
				newPath += " " + pkt.cp1.toPath();
				newPath += " " + pkt.p.toPath() + " C";
				newPath += " " + pkt.cp2.toPath();
			}
		});
		newPath += " Z";
		debug.innerText = newPath;
		G.setAttributeNS(null, "d", newPath);
	}
}

//svg path to points
var svgpath = new MySVGPath(path);

//d=" M 190,21 C 213,7 246,10 266,28 C 261,34 256,40 251,46 C 242,38 229,33 216,35 C 210,36 204,40 200,45 C 188,57 189,78 201,90 C 208,97 219,99 229,98 C 233,97 238,95 242,93 C 242,84 242,75 242,65 C 250,65 257,65 265,65 C 265,79 265,93 265,107 C 249,117 230,123 211,120 C 196,118 181,109 173,96 C 164,84 162,68 166,54 C 169,40 178,28 190,21 Z"></path>

//user moves controls
svgpath.points.forEach((pkt, i) => {
	//update current point
	pkt.pCircle.el.onmousedown = (e) => {
		document.onmousemove = (e) => {
			var newX = e.pageX;
			var newY = e.pageY;
			pkt.update(newX, newY, "p");
			svgpath.draw()
		}
	}
	if (i > 0) {
		//update control point1
		pkt.cp1Circle.el.onmousedown = (e) => {
			document.onmousemove = (e) => {
				var newX = e.pageX;
				var newY = e.pageY;
				pkt.update(newX, newY, "cp1");
				svgpath.draw()
			}
		}
	}
	//update control point2
	pkt.cp2Circle.el.onmousedown = (e) => {
		document.onmousemove = (e) => {
			var newX = e.pageX;
			var newY = e.pageY;
			pkt.update(newX, newY, "cp2");
			svgpath.draw()
		}
	}
})
//debug.innerText += "";
document.onmouseup = function () {
	document.onmousemove = null;
};
