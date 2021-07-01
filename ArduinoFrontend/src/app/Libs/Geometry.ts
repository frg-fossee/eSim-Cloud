import _ from 'lodash';

export class BoundingBox {
    x: number;
    y: number;
    height: number;
    width: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static loadFromRaphaelBbox(bBox) {
        return new BoundingBox(bBox.x, bBox.y, bBox.width, bBox.height);
    }

    static getCombinedBBox(bBoxes: BoundingBox[]) {
        const minX = _.minBy(bBoxes, box => box.x).x;
        const maxX = _.maxBy(bBoxes, box => box.x).x;
        const minY = _.minBy(bBoxes, box => box.y).y;
        const maxY = _.maxBy(bBoxes, box => box.y).y;
        return new BoundingBox(
            minX, minY, maxX - minX, maxY - minY
        );
    }
}
