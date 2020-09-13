import _ from 'lodash';
// const _ =  require('lodash');

export class MathHelper {
    /**
     * Checks if two numbers are close
     * @param x number 1
     * @param y number 2
     * @param decimals number of decimals up to which equality is to be checked
     */
    static areNumbersClose(x: number, y: number, decimals: number = 8) {
        if (isFinite(x) || isFinite(y)) {
            return Math.abs(x - y) < (10 ** (-1 * decimals));
        }
        return true;
    }

    /**
     * Computes n mod m
     * @param n number n
     * @param m number m
     */
    static modulo(n: number, m: number) {
        return ((n % m) + m) % m;
    }
}

/**
 * Orientation enum
 */
export enum Orientation {
    North = 90, East = 0, South = 270, West = 180
}

/**
 * Abstract class for CanvasElement
 */
export abstract class CanvasElement {
    abstract getName(): string;
}

/**
 * Vector class
 * x î + y j
 */
export class Vector {
    /**
     * magnitude in i direction
     */
    private x: number;

    /**
     * magnitude in j direction
     */
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Returns x component of the vector
     */
    getX(): number {
        return this.x;
    }

    /**
     * Returns y component of the vector
     */
    getY(): number {
        return this.y;
    }

    /**
     * Adds a vector
     * @param vector vector to be added
     */
    add(vector: Vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /**
     * Subtracts a vector
     * @param vector vector to be subtracted
     */
    subtract(vector: Vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    /**
     * Multiplies with a scalar
     * @param factor scalar number to be multiplied with the vector
     */
    multiply(factor: number): Vector {
        return new Vector(this.x * factor, this.y * factor);
    }

    /**
     * Computes dot product with another vector
     * @param vector vector instance
     */
    dotProduct(vector: Vector): number {
        return vector.getX() * this.x + vector.getY() * this.y;
    }

    /**
     * Computes the slope of the vector
     */
    getSlope(): number {
        return this.y / this.x;
    }

    /**
     * Returns the closest orientation of the vector
     */
    getApproxOrientation(): Orientation {
        const absRelativeSlope = Math.abs(this.getSlope());

        if (absRelativeSlope >= 1) {
            return this.y >= 0 ? Orientation.North : Orientation.South;
        } else {
            return this.x >= 0 ? Orientation.East : Orientation.West;
        }
    }

    /**
     * Returns Orientation of the vector if it's horizontal or vertical
     */
    getOrientation(): Orientation {
        if (this.x === 0) {
            return this.y > 0 ? Orientation.North : Orientation.South;
        } else if (this.y === 0) {
            return this.x > 0 ? Orientation.East : Orientation.West;
        }
        return null;
    }
}

/**
 * Utilities methods for Orientation enum
 */
export class OrientationUtil {
    public static getUnitVector(orientation: Orientation) {
        switch (orientation) {
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

    /**
     * Adds two orientations
     * @param orientation1 orientation instance 1
     * @param orientation2 orientation instance 2
     */
    public static addOrientations(orientation1: Orientation, orientation2: Orientation): Orientation {
        return MathHelper.modulo(orientation1 + orientation2, 360);
    }

    /**
     * Subtracts two orientations
     * @param orientation1 orientation instance 1
     * @param orientation2 orientation instance 2
     */
    public static subtractOrientations(orientation1: Orientation, orientation2: Orientation): Orientation {
        return MathHelper.modulo(orientation1 - orientation2, 360);
    }
}

/**
 * Cartesian-plane Point class
 */
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

    /**
     * Loads point from a vector instance
     * @param vector vector instance
     */
    static loadFromVector(vector: Vector) {
        return new Point(vector.getX(), vector.getY());
    }

    /**
     * Returns string representation of the point
     */
    toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    /**
     * Returns x-coordinate of the point
     */
    getX(): number {
        return this.x;
    }

    /**
     * Returns y-coordinate of the point
     */
    getY(): number {
        return this.y;
    }

    /**
     * Adds another point and returns the resultant vector
     * @param point point to be added
     */
    add(point: Point) {
        return this.getVector().add(point.getVector());
    }

    /**
     * Subtracts another point and returns the resultant vector
     * @param point point to be added
     */
    subtract(point: Point) {
        return this.getVector().subtract(point.getVector());
    }

    /**
     * Converts to an instance of Vector class
     */
    getVector(): Vector {
        return new Vector(this.x, this.y);
    }

    /**
     * Computes the distance from another point
     * @param point another point
     */
    calculateDistance(point: Point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }

    /**
     * Checks if the point is equal to another point
     * @param point another point
     */
    equals(point: Point) {
        return (this.x === point.getX()) && (this.y === point.getY());
    }
}

/**
 * Line class
 * (x)---------------(x)
 * point1           point2
 */
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

    /**
     * Returns string representation of the line
     */
    toString(): string {
        return `${this.point1} --> ${this.point2}`;
    }

    /**
     * Checks if the line superimposes with another line
     * @param line another line
     */
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

    /**
     * Checks if the line intersects with another line
     * @param line another line
     */
    doesLineIntersect(line: Line): [boolean, Point] {
        // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
        const [a, b] = [this.point1.getX(), this.point1.getY()];
        const [c, d] = [this.point2.getX(), this.point2.getY()];
        const [p, q] = [line.getPoint1().getX(), line.getPoint1().getY()];
        const [r, s] = [line.getPoint2().getX(), line.getPoint2().getY()];

        const det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return [false, null];
        } else {
            const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            const isIntersect = (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
            let intersectionPoint = null;
            if (isIntersect) {
                intersectionPoint = Point.loadFromVector(this.point1.getVector().add(this.getVector().multiply(lambda)));
            }
            return [isIntersect, intersectionPoint];
        }
    }

    /**
     * Converts the line to a vector representation
     */
    getVector(): Vector {
        return this.point2.subtract(this.point1);
    }

    /**
     * Checks if the line is horizontal
     */
    isHorizontal(): boolean {
        return this.getSlope() === 0;
    }

    /**
     * Checks if the line is vertical
     */
    isVertical(): boolean {
        return !isFinite(this.getSlope());
    }

    /**
     * Returns the array of the two ends of the line
     */
    getEnds(): [Point, Point] {
        return [this.getPoint1(), this.getPoint2()];
    }

    /**
     * Returns point1 of the line
     */
    getPoint1(): Point {
        return this.point1;
    }

    /**
     * Returns point2 of the line
     */
    getPoint2(): Point {
        return this.point2;
    }

    /**
     * Computes the length of the line
     */
    getLength(): number {
        return this.point1.calculateDistance(this.point2);
    }

    /**
     * Computes the slope of the line
     */
    getSlope(): number {
        const lineVector = this.point1.subtract(this.point2);
        return lineVector.getSlope();
    }

    /**
     * Checks if a point lies on the line
     * @param p point instance
     */
    containsPoint(p: Point): boolean {
        return MathHelper.areNumbersClose(this.point1.calculateDistance(p) + this.point2.calculateDistance(p), this.getLength());
    }

    /**
     * Checks if the line equals another line
     * @param line another line
     */
    equals(line: Line): boolean {
        return (this.point1.equals(line.getPoint1()) && this.point2.equals(line.getPoint2())) ||
        (this.point2.equals(line.getPoint1()) && this.point1.equals(line.getPoint2()));
    }
}


/**
 * Path class
 * A path is made up of multiple line segments or multiple points
 */
export class Path extends CanvasElement {
    /**
     * Lines inside the path
     */
    private points: Point[] = [];

    constructor(points: Point[] = []) {
        super();
        this.points = points;
    }

    /**
     * Loads a single-line path from a Line object
     * @param line line instance
     */
    static loadFromLine(line: Line): Path {
        return new Path(line.getEnds());
    }

    /**
     * Checks if the path superimposes with another path anywhere
     * @param path another path
     * Returns [does path superimposes?, line of the path (this) that superimposes, line of the another path that superimposes]
     */
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

    getName(): string {
        return null;
    }

    /**
     * Merges all the mergeable points in the path
     */
    private mergePoints(): void {
        const allPoints = this.getAllPoints();
        let prevPoint = allPoints[0];
        const newPoints = [prevPoint];

        for (const point of allPoints.slice(1)) {
            if (!point.equals(prevPoint)) {
                newPoints.push(point);
            }
            prevPoint = point;
        }
        this.points = newPoints;
    }

    /**
     * Merges collinear points on the path
     */
    private mergeCollinearPoints(): void {
        this.mergePoints();
        const lineSegments = this.getAllLineSegments();
        let prevLine = lineSegments[0];

        const newPoints = [];
        newPoints.push(prevLine.getPoint1());

        // merging collinear points
        let line = null;
        for (line of lineSegments.slice(1)) {
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
        this.points = newPoints;
    }

    /**
     * Detects and deletes all the cycles in the path
     * @param i starting point index
     */
    private deleteCycles(i?) {
        const lineSegments = this.getAllLineSegments();
        // TODO: Make this O(nlogn) when. O(n**2) should work fine for ~100-length paths
        for (i = (i || 0); i < lineSegments.length; i++) {
            for (let j = i + 1; j < lineSegments.length; j++) {
                const line1 = lineSegments[i];
                const line2 = lineSegments[j];
                const [intersect, pointX] = line1.doesLineIntersect(line2);
                if (intersect) {
                    this.points = [...this.points.slice(0, i + 1), pointX, ...this.points.slice(j + 1)];
                    this.deleteCycles(i);
                    return;
                }
                line1.doesLineSuperimpose(line2);
            }
        }
    }

    /**
     * Simplifies the path by removing collinear points and cycles
     */
    simplify(): void {
        this.mergeCollinearPoints();
        this.deleteCycles();
    }

    /**
     * Returns array of all line segments in the path
     */
    getAllLineSegments(): Line[] {
        const result = [];
        let prevPoint = this.points[0];
        for (const point of this.points.slice(1)) {
            result.push(new Line(prevPoint, point));
            prevPoint = point;
        }
        return result;
    }

    /**
     * Returns number of points in the path
     */
    getNumberOfPoints() {
        return this.points.length;
    }

    /**
     * Returns the orientation of the line made by points at two indices
     * @param pointIndex1 point 1 index
     * @param pointIndex2 point 2 index
     */
    private getLineSegmentOrientation(pointIndex1, pointIndex2) {
        const point1 = this.getAllPoints()[pointIndex1];
        const point2 = this.getAllPoints()[pointIndex2];

        const vector = point2.subtract(point1);
        return vector.getOrientation();
    }

    /**
     * Returns the string representation of the path
     */
    toString(): string {
        return this.points.map(p => p.toString()).join('\n');
    }

    /**
     * Checks if the path contains a point
     * @param point point
     */
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
        return new Path(_.reverse(this.getAllPoints()));
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
     * Point 1 -------------- Point 2
     *         |            |
     *         |            |
     *         |            |
     *         |            |
     * Point 4 -------------- Point 3
     */

    /**
     * diagonal 1 point 1
     */
    private point1: Point;

    /**
     * diagonal 1 point 2
     */
    private point3: Point;

    /**
     * diagonal 2 point 1
     */
    private point2: Point;

    /**
     * diagonal 2 point 2
     */
    private point4: Point;

    private name: string;

    private isChildBlock = false;

    constructor(point1: Point, point3: Point, isChildBlock = false, name?) {
        super();
        this.point1 = point1;
        this.point3 = point3;
        this.isChildBlock = isChildBlock;
        this.point2 = new Point(point3.getX(), point1.getY());
        this.point4 = new Point(point1.getX(), point3.getY());
        this.name = name;
    }

    getBoundary(): Path {
        const allPoints = this.getAllVertices();
        return new Path([...allPoints, allPoints[0]]);
    }

    isChild(): boolean {
        return this.isChildBlock;
    }

    getName(): string {
        return this.name;
    }

    /**
     * checks if the point p is inside or on the block
     * @param p point
     */
    containsPoint(p: Point): boolean {
        const xMax = this.getMaxX();
        const xMin = this.getMinX();
        const yMax = this.getMaxY();
        const yMin = this.getMinY();
        return (p.getX() >= xMin) && (p.getX() <= xMax) && (p.getY() >= yMin) && (p.getY() <= yMax);
    }

    getAllVertices(): Point[] {
        return [this.point1, this.point2, this.point3, this.point4];
    }

    getPoint1(): Point {
        return this.point1;
    }

    getPoint2(): Point {
        return this.point2;
    }

    getPoint3(): Point {
        return this.point3;
    }

    getPoint4(): Point {
        return this.point4;
    }

    getMinX(): number {
        return Math.min(this.point1.getX(), this.point3.getX());
    }

    getMaxX(): number {
        return Math.max(this.point1.getX(), this.point3.getX());
    }

    getMinY(): number {
        return Math.min(this.point1.getY(), this.point3.getY());
    }

    getMaxY(): number {
        return Math.max(this.point1.getY(), this.point3.getY());
    }

    /**
     * Returns the tuple of other two diagonal points
     */
    getOtherTwoPoints(): [Point, Point] {
        return [this.point2, this.point4];
    }

    /**
     * Returns the two diagonal vector of the block
     */
    getDiagonals(): [Vector, Vector] {
        return [this.point1.subtract(this.point3), this.point2.subtract(this.point4)];
    }

    /**
     * Returns mid-point of the block
     */
    getCenter(): Point {
        const midX = (this.point1.getX() + this.point3.getX()) / 2;
        const midY = (this.point1.getY() + this.point3.getY()) / 2;
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
        return [...this.elements];
    }

    getBlocks(): Block[] {
        return this.elements.filter(element => element instanceof Block).map(element => (element as Block));
    }

    getParentBlocks(): Block[] {
        return this.elements.filter(element => (element instanceof Block) && (!(element as Block).isChild()))
                            .map(element => (element as Block));
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
                if (line.doesLineIntersect(blockLine)[0]) {
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
