import _ from 'lodash';
// const _ =  require('lodash');

export class MathHelper {
    static areNumbersClose(x: number, y: number, decimals: number = 8) {
        if (isFinite(x) || isFinite(y)) {
            return Math.abs(x - y) < (10 ** (-1 * decimals));
        }
        return true;
    }

    static modulo(n: number, m: number) {
        return ((n % m) + m) % m;
    }
}

export enum Orientation {
    North = 90, East = 0, South = 270, West = 180
}

export abstract class CanvasElement {
}

export class Vector {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    add(vector: Vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector: Vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(factor: number): Vector {
        return new Vector(this.x * factor, this.y * factor);
    }

    dotProduct(vector: Vector): number {
        return vector.getX() * this.x + vector.getY() * this.y;
    }

    getSlope(): number {
        return this.y / this.x;
    }

    getApproxOrientation(): Orientation {
        const absRelativeSlope = Math.abs(this.getSlope());

        if (absRelativeSlope >= 1) {
            return this.y >= 0 ? Orientation.North : Orientation.South;
        } else {
            return this.x >= 0 ? Orientation.East : Orientation.West;
        }
    }

    getOrientation(): Orientation {
        if (this.x === 0) {
            return this.y > 0 ? Orientation.North : Orientation.South;
        } else if (this.y === 0) {
            return this.x > 0 ? Orientation.East : Orientation.West;
        }
        return null;
    }
}

export class OrientationUtil {
    public static getUnitVector(orientation: Orientation) {
        switch(orientation) {
            case Orientation.North:
                return new Vector(0, 1);
            case Orientation.South:
                return new Vector(0, -1);
            case Orientation.East:
                return new Vector(1, 0);
            case Orientation.West:
                return new Vector(-1, 0);
        }
    }

    public static addOrientations(orientation1: Orientation, orientation2: Orientation): Orientation {
        return MathHelper.modulo(orientation1 + orientation2, 360);
    }

    public static subtractOrientations(orientation1: Orientation, orientation2: Orientation): Orientation {
        return MathHelper.modulo(orientation1 - orientation2, 360);
    }
}

export class Point {
    /**
     * x-coordinate of the point
     */
    private x: number;

    /**
     * y-coordinate of the point
     */
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static loadFromVector(vector: Vector) {
        return new Point(vector.getX(), vector.getY());
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    add(point: Point) {
        return this.getVector().add(point.getVector());
    }

    subtract(point: Point) {
        return this.getVector().subtract(point.getVector());
    }

    getVector(): Vector {
        return new Vector(this.x, this.y);
    }

    calculateDistance(point: Point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }
}

export class Line {
    /**
     * Point 1 of the line
     */
    private point1: Point;

    /**
     * Point 2 of the line
     */
    private point2: Point;

    constructor(point1: Point, point2: Point) {
        this.point1 = point1;
        this.point2 = point2;
    }

    toString(): string {
        return `${this.point1} --> ${this.point2}`;
    }

    doesLineSuperimpose(line: Line): boolean {
        const slope1 = this.getSlope();
        const slope2 = line.getSlope();

        if (MathHelper.areNumbersClose(slope1, slope2)) {
            const isPoint1InLine2 = line.containsPoint(this.getPoint1());
            const isPoint2InLine2 = line.containsPoint(this.getPoint2());
            return isPoint1InLine2 || isPoint2InLine2;
        }
        return false;
    }

    doesLineIntersect(line: Line): boolean {
        // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
        const [a, b] = [this.point1.getX(), this.point1.getY()];
        const [c, d] = [this.point2.getX(), this.point2.getY()];
        const [p, q] = [line.getPoint1().getX(), line.getPoint1().getY()];
        const [r, s] = [line.getPoint2().getX(), line.getPoint2().getY()];

        const det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    }

    getVector(): Vector {
        return this.point2.subtract(this.point1);
    }

    isHorizontal(): boolean {
        return this.getSlope() === 0;
    }

    isVertical(): boolean {
        return !isFinite(this.getSlope());
    }

    getEnds(): [Point, Point] {
        return [this.getPoint1(), this.getPoint2()];
    }

    getPoint1(): Point {
        return this.point1;
    }

    getPoint2(): Point {
        return this.point2;
    }

    getLength(): number {
        return this.point1.calculateDistance(this.point2);
    }

    getSlope(): number {
        const lineVector = this.point1.subtract(this.point2);
        return lineVector.getY() / lineVector.getX();
    }

    containsPoint(p: Point): boolean {
        return MathHelper.areNumbersClose(this.point1.calculateDistance(p) + this.point2.calculateDistance(p), this.getLength());
    }
}


export class Path extends CanvasElement {
    /**
     * Lines inside the path
     */
    private points: Point[] = [];

    constructor(points: Point[] = []) {
        super();
        this.points = points;
    }

    static loadFromLine(line: Line): Path {
        return new Path(line.getEnds());
    }

    doesPathSuperimpose(path: Path): [boolean, Line, Line] {
        const lineSegments = path.getAllLineSegments();
        const thisLineSegments = this.getAllLineSegments();

        // O(n**2) for now. TODO: O(n*logn)
        for (const line1 of lineSegments) {
            for (const line2 of thisLineSegments) {
                if (line1.doesLineSuperimpose(line2)) {
                    return [true, line1, line2];
                }
            }
        }
        return [false, null, null];
    }

    simplify(): Path {
        const lineSegments = this.getAllLineSegments();
        let prevLine = lineSegments[0];

        const newPoints = [];
        newPoints.push(prevLine.getPoint1());

        // merging collinear points
        let line = null;
        for (line of lineSegments.splice(1)) {
            const prevSlope = prevLine.getSlope();
            prevLine = line;

            const currSlope = line.getSlope();
            if (MathHelper.areNumbersClose(currSlope, prevSlope)) {
                continue;
            }
            if (!isFinite(prevSlope) && !isFinite(currSlope)) {
                continue;
            }
            newPoints.push(line.getPoint1());
        }
        newPoints.push(line.getPoint2());
        return new Path(newPoints);
    }

    getAllLineSegments(): Line[] {
        const result = [];
        let prevPoint = this.points[0];
        for (const point of this.points.slice(1)) {
            result.push(new Line(prevPoint, point));
            prevPoint = point;
        }
        return result;
    }

    getNumberOfPoints() {
        return this.points.length;
    }

    private getLineSegmentOrientation(pointIndex1, pointIndex2) {
        const point1 = this.getAllPoints()[pointIndex1];
        const point2 = this.getAllPoints()[pointIndex2];

        const vector = point2.subtract(point1);
        return vector.getOrientation();
    }

    toString(): string {
        return this.points.map(p => p.toString()).join(', ');
    }

    containsPoint(point: Point): boolean {
        for (const line of this.getAllLineSegments()) {
            if (line.containsPoint(point)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the orientation of the last vector in the path
     */
    getLastVectorOrientation(): Orientation {
        const n = this.getNumberOfPoints();
        if (n < 1) {
            return null;
        }
        return this.getLineSegmentOrientation(n - 1, n - 2);
    }

    /**
     * Returns the orientation of the last vector in the path
     */
    getFirstVectorOrientation(): Orientation {
        const n = this.getNumberOfPoints();
        if (n < 1) {
            return null;
        }
        return this.getLineSegmentOrientation(0, 1);
    }

    /**
     * Adds a path and return the instance of the new path
     * @param path path to add
     */
    addPath(path: Path): Path {
        return new Path([...this.getAllPoints(), ...path.getAllPoints()]);
    }

    /**
     * Reverses the path and return a new instance
     */
    reverse(): Path {
        return new Path(_.reverse(this.getAllPoints));
    }

    /**
     * Returns all the points
     */
    getAllPoints(): Point[] {
        return [...this.points];
    }

    /**
     * Adds a point to the path
     * @param point: point to add to the path
     */
    addPoint(point: Point): void {
        this.points.push(point);
    }

    /**
     * Adds multiple points to the path
     * @param point: point to add to the path
     */
    addPoints(points: Point[]): void {
        this.points = this.points.concat(points);
    }
}

export class Block extends CanvasElement {
    /**
     * diagonal point 1
     */
    private point1: Point;

    /**
     * diagonal point 2
     */
    private point2: Point;

    constructor(point1: Point, point2: Point) {
        super();
        this.point1 = point1;
        this.point2 = point2;
    }

    getBoundary(): Path {
        const allPoints = this.getAllVertices();
        return new Path([...allPoints, allPoints[0]]);
    }

    /**
     * checks if the point p is inside or on the block
     * @param p point
     */
    containsPoint(p: Point): boolean {
        const xMax = Math.max(this.point1.getX(), this.point2.getX());
        const xMin = Math.min(this.point1.getX(), this.point2.getX());
        const yMax = Math.max(this.point1.getY(), this.point2.getY());
        const yMin = Math.min(this.point1.getY(), this.point2.getY());
        return (p.getX() >= xMin) && (p.getX() <= xMax) && (p.getY() >= yMin) && (p.getY() <= yMax);
    }

    getAllVertices(): Point[] {
        const [point3, point4] = this.getOtherTwoPoints();
        return [this.point1, point3, this.point2, point4];
    }

    getPoint1(): Point {
        return this.point1;
    }

    getPoint2(): Point {
        return this.point2;
    }

    getMinX(): number {
        return Math.min(this.point1.getX(), this.point2.getX());
    }

    getMaxX(): number {
        return Math.max(this.point1.getX(), this.point2.getX());
    }

    getMinY(): number {
        return Math.min(this.point1.getY(), this.point2.getY());
    }

    getMaxY(): number {
        return Math.max(this.point1.getY(), this.point2.getY());
    }

    /**
     * Returns the tuple of other two diagonal points
     */
    getOtherTwoPoints(): [Point, Point] {
        return [new Point(this.point1.getX(), this.point2.getY()), new Point(this.point2.getX(), this.point1.getY())];
    }

    /**
     * Returns the two diagonal vector of the block
     */
    getDiagonals(): [Vector, Vector] {
        const [point3, point4] = this.getOtherTwoPoints();
        return [this.point1.subtract(this.point2), point3.subtract(point4)];
    }

    /**
     * Returns mid-point of the block
     */
    getCenter(): Point {
        const midX = (this.point1.getX() + this.point2.getX()) / 2;
        const midY = (this.point1.getY() + this.point2.getY()) / 2;
        return new Point(midX, midY);
    }

    /**
     * returns orientation of the point with respect to the block
     * @param point: point
     */
    getRelativeOrientation(point: Point): Orientation {
        const relativeVector = point.subtract(this.getCenter());
        const absRelativeSlope = Math.abs(relativeVector.getSlope());
        const boxDiagonalSlope = Math.abs(this.getDiagonals()[0].getSlope());

        const relativeY = relativeVector.getY();
        const relativeX = relativeVector.getX();

        if (absRelativeSlope >= boxDiagonalSlope) {
            return relativeY >= 0 ? Orientation.North : Orientation.South;
        } else {
            return relativeX >= 0 ? Orientation.East : Orientation.West;
        }
    }

    /**
     * Returns the unit vector of the relative orientation of the point wrt the Box
     * @param point: point
     */
    getRelativeOrientationUnitVector(point: Point): Vector {
        const relativeOrientation = this.getRelativeOrientation(point);
        return OrientationUtil.getUnitVector(relativeOrientation);
    }

    /**
     * Returns a point away from port of the block
     * @param point port
     * @param distance distance of the new point from port
     */
    getPointAwayFromPort(point: Point, distance: number, canvas?: Canvas): Point {
        const unitVector = this.getRelativeOrientationUnitVector(point);
        let resultantVector = point.getVector().add(unitVector.multiply(distance));
        // TODO: get the distance directly by using the boundary of the block
        while (this.containsPoint(Point.loadFromVector(resultantVector))) {
            resultantVector = resultantVector.add(unitVector.multiply(distance));
        }
        return Point.loadFromVector(resultantVector);
    }
}

export class Canvas {
    /**
     * List of elements inside the canvas
     */
    private elements: CanvasElement[];

    constructor(elements: CanvasElement[] = []) {
        this.elements = elements;
    }

    addElement(element: CanvasElement): void {
        this.elements.push(element);
    }

    removeElement(element: CanvasElement): void {
        _.remove(this.elements, (el: CanvasElement) => el === element);
    }

    getElements(): CanvasElement[] {
        return this.elements;
    }

    getBlocks(): Block[] {
        return this.elements.filter(element => element instanceof Block).map(element => (element as Block));
    }

    getPaths(): Path[] {
        return this.elements.filter(element => element instanceof Path).map(element => (element as Path));
    }
}


export class CanvasUtils {
    static doElementsIntersect(element1: CanvasElement, element2: CanvasElement): [boolean, Line, Line] {
        if ((element1 instanceof Path) && (element2 instanceof Block)) {
            return CanvasUtils.doesBlockAndPathIntersects(element1, element2);
        } else if ((element1 instanceof Block) && (element2 instanceof Path)) {
            return CanvasUtils.doesBlockAndPathIntersects(element2, element1);
        } else if ((element1 instanceof Block) && (element2 instanceof Block)) {
            // intersecting lines are returned as null null as doesn't hold true for 2 blocks
            return CanvasUtils.doBlocksIntersect(element1, element2);
        } else if ((element1 instanceof Path) && (element2 instanceof Path)) {
            return element1.doesPathSuperimpose(element2);
        }
        return [false, null, null];
    }

    private static doesBlockAndPathIntersects(path: Path, block: Block): [boolean, Line, Line] {
        const lineSegments = block.getBoundary().getAllLineSegments();
        for (const line of path.getAllLineSegments()) {
            for (const blockLine of lineSegments) {
                if (line.doesLineIntersect(blockLine)) {
                    return [true, line, blockLine];
                }
            }
        }
        return [false, null, null];
    }

    private static doBlocksIntersect(block1: Block, block2: Block): [boolean, Line, Line] {
        const [minAx, minAy, maxAx, maxAy] = [block1.getMinX(), block1.getMinY(), block1.getMaxX(), block1.getMaxY()];
        const [minBx, minBy, maxBx, maxBy] = [block2.getMinX(), block2.getMinY(), block2.getMaxX(), block2.getMaxY()];

        const aLeftOfB = maxAx < minBx;
        const aRightOfB = minAx > maxBx;
        const aAboveB = minAy > maxBy;
        const aBelowB = maxAy < minBy;

        const isIntersect = !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
        return [isIntersect, null, null];
    }

    static getBoundary(element: CanvasElement): Path {
        if (element instanceof Block) {
            return (element as Block).getBoundary();
        } else if (element instanceof Path) {
            return (element as Path);
        }
    }

    static arePointsAligned(point1: Point, point2: Point): boolean {
        return (point1.getX() === point2.getX()) || (point1.getY() === point2.getY());
    }

    static appendPaths(...paths: Path[]): Path {
        const allPoints = _.flatten(paths.map(path => path.getAllPoints()));
        return new Path(allPoints);
    }

    static getSubCanvasIntersectingCanvas(canvas: Canvas, block: Block): Canvas {
        return new Canvas(canvas.getElements().filter(el => CanvasUtils.doElementsIntersect(el, block)));
    }

    static doesPointLieOnCanvaspath(canvas: Canvas, point: Point): boolean {
        const allPaths = canvas.getPaths();
        for (const path of allPaths) {
            if (path.containsPoint(point)) {
                return true;
            }
        }
        return false;
    }

    static getCompactPath(canvas: Canvas, path: Path): Path {
        return null;
    }

}

function test() {
    const line1 = new Line(new Point(1, 1), new Point(4, 4));
    console.log(line1.containsPoint(new Point(2, 2)));
}

test();
