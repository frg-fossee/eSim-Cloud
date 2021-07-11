import { Canvas, Point, Block, Path } from './Components';
import { CircuitElement } from '../Libs/CircuitElement';
import { Wire } from '../Libs/Wire';
import { Point as NodePoint } from '../Libs/Point';
import { Utils } from './PathUtils';
import _ from 'lodash';
import { AlertService } from '../alert/alert-service/alert.service';
import { BoundingBox } from '../Libs/Geometry';
import { UndoUtils } from '../Libs/UndoUtils';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

class PathProblem {
    source: Point;
    destination: Point;
    sourceBlock: Block;
    destinationBlock: Block;
    wire: Wire;

    constructor(source, destination, sourceBlock, destinationBlock, wire) {
        this.source = source;
        this.destination = destination;
        this.sourceBlock = sourceBlock;
        this.destinationBlock = destinationBlock;
        this.wire = wire;
    }
}

export class LayoutUtils {
    /**
     * total count of problemPaths while auto Layouting
     */
    static problemPathsCount = 0;
    /**
     * Solves auto layout problem for `Arduino on Cloud` circuits
     */
    static solveAutoLayout() {
        const canvas = LayoutUtils.generateCanvas();

        const [isInvalid, overlappingEl1, overlappingEl2] = Utils.isCanvasInvalid(canvas);
        if (!isInvalid) {
            LayoutUtils.continueSaveLayout(canvas);
        } else {
            AlertService.showConfirm(
                `Bounding boxes of ${overlappingEl1.getName()} and ${overlappingEl2.getName()} are overlapping.
                 Do you want to continue anyway?`,
                () => LayoutUtils.continueSaveLayout(canvas)
            );
        }
    }

    /**
     * Sub function of `solveAutoLayout`, to be triggered on continuation
     * @param canvas canvas
     */
    private static continueSaveLayout(canvas: Canvas): void {
        const problemPaths = LayoutUtils.getSourcesAndDestsToSolve();
        this.problemPathsCount = problemPaths.length;
        for (const path of problemPaths) {
            const [solvedPath, msg] = Utils.getOptimalPath(path.source, path.destination, path.sourceBlock, path.destinationBlock, canvas);
            if (!solvedPath) {
                continue;
            }
            canvas.addElement(solvedPath);
            LayoutUtils.updateWirePath(path.wire, solvedPath);
            path.wire.update();
        }
    }

    /**
     * Converts the circuit to canvas structure
     */
    static generateCanvas(): Canvas {
        const allElements = LayoutUtils.getAllCircuitElements().filter(el => !(el instanceof Wire));
        let canvasElements = allElements.map(LayoutUtils.convertCircuitElementToBlock);

        const allNodes = _.flatten(allElements.map(element => element.nodes));
        canvasElements = canvasElements.concat(
            allNodes.map(
                (node: NodePoint) => LayoutUtils.convertBoundingBoxToBlock(
                    node.getBoundingBox(), `${node.label} of ${node.parent.getName()}`, true
                )
            )
        );

        return new Canvas(canvasElements);
    }

    /**
     * Updates the path of the wire
     * @param wire wire object
     * @param path new path to be assigned
     */
    static updateWirePath(wire: Wire, path: Path): void {
        // Push dump to Undo stack & Reset
        UndoUtils.pushChangeToUndoAndReset({ keyName: wire.keyName, element: wire.save(), event: 'layout', step: this.problemPathsCount });
        let i = 1;
        const allPoints = path.getAllPoints();
        wire.removeAllMiddlePoints();
        for (const point of allPoints.slice(1, allPoints.length - 1)) {
            wire.addPoint(point.getX(), point.getY(), false, i++);
        }
    }

    /**
     * Converts any circuit element to Block object required for canvas
     * @param element circuit element instance
     */
    static convertCircuitElementToBlock(element: CircuitElement): Block {
        return LayoutUtils.convertBoundingBoxToBlock(element.getBoundingBox(), element.getName());
    }

    /**
     * Converts bounding box to Block object
     * @param boundingBox Bounding box
     * @param name name of the element
     * @param isChild contains parent?
     */
    static convertBoundingBoxToBlock(boundingBox: BoundingBox, name = 'Unnamed', isChild: boolean = false): Block {
        const diagonalPoint1 = new Point(boundingBox.x, boundingBox.y);
        const diagonalPoint2 = new Point(boundingBox.x + boundingBox.width, boundingBox.y + boundingBox.height);

        return new Block(diagonalPoint1, diagonalPoint2, isChild, name);
    }

    /**
     * Gets all the sources and destinations of all the wires on the canvas
     */
    static getSourcesAndDestsToSolve(): PathProblem[] {
        const allWires = LayoutUtils.getAllWires();
        const result: PathProblem[] = [];
        for (const wire of allWires) {
            const [src, dest] = LayoutUtils.getSourceAndDestinationForWire(wire);
            const srcBlock = LayoutUtils.convertCircuitElementToBlock(wire.start.parent);
            const destBlock = LayoutUtils.convertCircuitElementToBlock(wire.end.parent);
            result.push(new PathProblem(src, dest, srcBlock, destBlock, wire));
        }
        return result;
    }

    /**
     * Returns source and destination of a given wire
     * @param wire wire instance
     */
    static getSourceAndDestinationForWire(wire: Wire): [Point, Point] {
        const start = wire.points[0];
        const source = new Point(start[0], start[1]);

        const end = wire.points[wire.points.length - 1];
        const dest = new Point(end[0], end[1]);

        return [source, dest];
    }

    /**
     * Converts a wire to a Path object
     * @param wire wire instance
     */
    static convertWireToPath(wire: Wire): Path {
        const points = wire.points.map(point => new Point(point[0], point[1]));
        return new Path(points);
    }

    /**
     * Returns list of all wires present in the circuit
     */
    static getAllWires(): Wire[] {
        return Object.values(window.scope.wires);
    }

    /**
     * Returns list of all circuit elements on the canvas
     */
    static getAllCircuitElements(): CircuitElement[] {
        return _.flatten(Object.values(window.scope));
    }
}
