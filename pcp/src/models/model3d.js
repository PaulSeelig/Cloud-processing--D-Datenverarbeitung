class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}   

class Model3D {
    constructor() {
        this.points = [];
    }

    addPoint(x, y, z) {
        const point = new Point(x, y, z);
        this.points.push(point);
    }

    removePoint(index) {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
        }
    }

    getPoints() {
        return this.points;
    }
}


export { Point, Model3D };