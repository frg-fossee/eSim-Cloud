import { Point } from './Point';
import _ from 'lodash';
import { UndoUtils } from './UndoUtils';

/**
 * To prevent window from throwing error
 */
declare let window;
/**
 * Class for Wire
 */
export class Wire {
  /**
   * Keyname require for mapping
   */
  keyName = 'wires';
  /**
   * Stores array of position [x,y]
   */
  points: number[][] = [];
  /**
   * Store the Raphael elements of the joints
   */
  joints: any[] = [];
  /**
   * End circuit node of wire
   */
  end: Point = null;
  /**
   * Body of the wire
   */
  element: any;
  /**
   * Color of the wire
   */
  color: any = '#000';
  /**
   * Store the glows on Hover
   */
  glows: any[] = [];
  /**
   * Id of the Wire
   */
  id: number;
  /**
   * Temporary point (which was used to draw perpendicular last time) of the wire while in drawing status
   */
  lastTempPoint: [number, number];

  /**
   * Constructor of wire
   * @param canvas Raphael Canvas / paper
   * @param start Start circuit node of wire
   */
  constructor(public canvas, public start: Point, public existingId = null) {
    if (existingId) {
      this.id = existingId;
    } else {
      this.id = this.getUniqueId(Date.now());
    }

    // insert the position of start node in array
    this.points.push(start.position());
  }

  /**
   * Recursive function to check if id is already present.
   * If present then return a new unique id
   * @param id current id
   * @returns id number
   */
  getUniqueId(id): number {
    for (const e in window.scope) {
      if (window.scope.hasOwnProperty(e)) {
        for (const i in window.scope[e]) {
          if (window.scope[e][i].id === id) {
            return this.getUniqueId(Date.now() + Math.floor(Math.random() * 1000000));
          }
        }
      }
    }
    return id;
  }
  /**
   * Creates path element for the wire
   * @param element canvas element
   */
  createElement(element) {
    if (this.element) {
      this.removeGlows();
      this.element.remove();
    }

    this.element = element;
    this.element.attr({ 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '4', stroke: this.color });

    this.element.mouseover(() => {
      // only glow if the wire has a start and an end
      if (this.start && this.end) {
        this.glows.push(
          this.element.glow({
            color: this.color
          })
        );
      }
    });

    this.element.mouseout(() => {
      this.removeGlows();
    });

    // set click listener
    this.element.click(() => {
      this.handleClick();
    });
  }
  /**
   * Adds a new coordinate (x, y) to the wire
   * @param x x-coordinate of cursor
   * @param y y-coordinate of cursor
   * @param isPerpendicular is the point to be drawn perpendicular
   */
  addPoint(x: number, y: number, isPerpendicular = false, index?) {
    let newX = x;
    let newY = y;

    if (isPerpendicular) {
      const n = this.points.length;
      const [previousX, previousY] = this.points[n - 1];
      [newX, newY] = this.getPerpendicularXY(x, y, previousX, previousY);
    }

    this.add(newX, newY, index);

    // draw the line from the previous point to cursor's current position
    if (isPerpendicular) {
      this.drawPerpendicular(x, y);
    } else {
      this.draw(x, y);
    }
  }

  /**
   * Removes all the intermediate points from the wire path
   */
  removeAllMiddlePoints() {
    for (let i = this.points.length; i > 0; i--) {
      this.removeJoint(i);
    }
    this.points = [this.points[0], this.points[this.points.length - 1]];
  }

  /**
   * Makes the current temporary line perpendicular depending on current x and y
   * @param toggle: true to draw perpendicular line upto current cursor's position
   * false to undo the current perpendicular status
   */
  togglePerpendicularLine(toggle: boolean) {
    const currentPathAttrs = this.element.attrs.path;
    const n = currentPathAttrs.length;
    const [x, y] = currentPathAttrs[n - 1].slice(1);

    let newX = null;
    let newY = null;

    if (toggle) {
      // if toggle is true, draw perpendicular lines
      const [previousX, previousY] = currentPathAttrs[n - 2].slice(1);
      [newX, newY] = this.getPerpendicularXY(x, y, previousX, previousY);
    } else {
      [newX, newY] = this.lastTempPoint;
    }

    this.drawWire(newX, newY);
  }

  /**
   * draws perpendicular lines based on current x, y coordinates
   * @param x x-coordinate of cursor
   * @param y y-coordinate of cursor
   */
  drawPerpendicular(x: number, y: number) {
    this.lastTempPoint = [x, y];
    const n = this.points.length;
    const [previousX, previousY] = this.points[n - 1];
    const [newX, newY] = this.getPerpendicularXY(x, y, previousX, previousY);
    this.drawWire(newX, newY);
  }

  /**
   * Draws wire to (x, y)
   * @param x x-coordinate
   * @param y y-coordiante
   */
  draw(x: number, y: number) {
    this.lastTempPoint = [x, y];
    this.drawWire(x, y);
  }

  /**
   * Returns x, y for perpendicular lines
   * @param x current x-coordinate
   * @param y current y-coordinate
   * @param previousX previous x-coordinate
   * @param previousY previous y-coordinate
   */
  private getPerpendicularXY(x: number, y: number, previousX: number, previousY: number) {
    const delX = Math.abs(x - previousX);
    const delY = Math.abs(y - previousY);
    return (delX > delY) ? [x, previousY] : [previousX, y];
  }

  /**
   * updates the path of the wire
   * @param newPath new path of the wire
   */
  private updateWirePath(newPath: string) {
    if (this.element) {
      // only update the path if the new path is different
      if (this.element.attrs.path.toString() !== newPath) {
        this.element.attr('path', newPath);
      }
    } else {
      this.createElement(this.canvas.path(newPath));
    }
  }

  /**
   *  Draws wire on the canvas
   * @param x x position of point to be added
   * @param y y position of point to be added
   */
  private drawWire(x?: number, y?: number) {
    let path = `M${this.points[0][0]},${this.points[0][1]}`;
    // Draw lines to other points
    for (let i = 1; i < this.points.length; ++i) {
      path += `L${this.points[i][0]},${this.points[i][1]}`;
    }

    if (x && y) {
      path += `L${x},${y}`;
    }

    // Update path
    this.updateWirePath(path);
  }

  /**
   * Add a point to wire
   * @param x x position
   * @param y y position
   */
  private add(x: number, y: number, index?) {
    if (index) {
      // insert the point [x, y] at the index and create joint
      this.points.splice(index, 0, [x, y]);
      this.createJoint(index, true);
    } else {
      // else, insert at the end
      this.points.push([x, y]);
    }
  }
  /**
   * Handle click on Wire
   */
  handleClick() {
    // If Current Selected item is wire then deselect it
    if (window['Selected'] && (window['Selected'] instanceof Wire)) {
      window['Selected'].deselect();
    }

    // Show all joints
    for (const joint of this.joints) {
      joint.show();
    }

    // Select current instance
    window['isSelected'] = true;
    window['Selected'] = this;

    // Show properties
    window.showProperty(() => {
      return this.properties();
    });
  }

  /**
   * Set Color of the wire
   * @param color color of the wire
   */
  setColor(color: string) {
    this.color = color;
    this.element.attr({ stroke: color }); // set attribute
    // Update the color of joints
    for (const joint of this.joints) {
      joint.attr({ fill: color, stroke: color });
    }
  }

  /**
   * Return Properties of wire
   */
  properties() {
    // Create div and insert options form color
    const body = document.createElement('div');
    body.innerHTML = '<label>Color:</label><br>';
    const select = document.createElement('select');
    select.innerHTML = `<option>Black</option><option>Red</option><option>Yellow</option><option>Blue</option><option>Green</option>`;
    const colors = ['#000', '#ff0000', '#e6a800', '#2593fa', '#31c404'];
    // set the current color
    for (let i = 0; i < colors.length; ++i) {
      if (colors[i] === this.color) {
        select.selectedIndex = i;
      }
    }
    // set on change listener
    select.onchange = () => {
      // Push dump to Undo stack & Reset
      UndoUtils.pushChangeToUndoAndReset({ keyName: this.keyName, element: this.save(), event: 'wire_color' });
      this.setColor(colors[select.selectedIndex]);
    };

    body.append(select);
    return {
      title: 'Wire',
      keyName: this.keyName,
      id: this.id,
      body
    };
  }

  /**
   * Function to connect wire with the node
   * @param t End point / END circuit node
   * @param removeLast remove previously inserted item
   */
  connect(t: Point, removeLast: boolean = false, hideJoint: boolean = false, pushUndo = false, undoEvtType = 'add') {
    // if remove last then pop from array
    if (removeLast && this.points.length > 1) {
      this.points.pop();
    }
    // change the end letiable
    this.end = t;
    // insert the end position
    this.points.push(t.position());

    if (this.points.length > 2) {
      // For each point in the wire except first and last
      for (let i = 1; i < this.points.length - 1; ++i) {
        // Create a Joint
        this.createJoint(i, hideJoint);
      }
    }
    // Update Wire
    this.update();
    // Push dump to Undo stack, only if pushUndo is false
    if (!pushUndo) {
      UndoUtils.pushChangeToUndoAndReset({ keyName: this.keyName, element: this.save(), event: undoEvtType });
    }
    if (undoEvtType === 'breadDrag') {
      UndoUtils.pushChangeToUndo({ keyName: this.keyName, element: this.save(), event: undoEvtType });
    }
  }

  /**
   * Removes joint present at the point at index `pointIndex`
   * @param pointIndex: index of the point whose joint needs to be removed
   */
  removeJoint(pointIndex: number) {
    const jointIndex = pointIndex - 1;
    const joint = this.joints[jointIndex];
    if (joint) {
      joint.remove();
      this.joints.splice(jointIndex, 1);
    }
  }

  /**
   * Creates joint at the index `pointIndex`
   * @param pointIndex index of the point
   * @param hideJoint hide the joint?
   */
  createJoint(pointIndex: number, hideJoint: boolean = false) {
    const joint = this.canvas.circle(this.points[pointIndex][0], this.points[pointIndex][1], 6);
    joint.attr({ fill: this.color, stroke: this.color });  // Give the joint a Color
    // Variables used while dragging joints
    let tmpx;
    let tmpy;
    // set drag listener
    joint.drag((dx, dy) => {
      // Update joints position
      joint.attr({ cx: tmpx + dx, cy: tmpy + dy });
      // Update repective Point
      this.points[pointIndex] = [tmpx + dx, tmpy + dy];
      // Update the wire
      this.update();
    }, () => {
      // Get the Joints center
      const jointAttr = joint.attr();
      tmpx = jointAttr.cx;
      tmpy = jointAttr.cy;
    }, () => {
    });
    this.joints.push(joint);
    // Hide joint if required
    if (hideJoint) {
      joint.hide();
    }
  }

  /**
   * Returns true if both end of wire is connected
   */
  isConnected() {
    return (this.start !== null && this.end !== null);
  }
  /**
   * Update the wire position if the parent element is changed
   */
  update() {
    // check if both start and end node are present
    if (this.end && this.start) {
      // Update the start and ending position
      this.points[0] = this.start.position();
      this.points[this.points.length - 1] = this.end.position();
      this.drawWire();
      return true;
    }
    return false;
  }
  /**
   * Callback called after the wire is deselect
   */
  deselect() {
    for (const joint of this.joints) {
      joint.hide();
    }
  }
  /**
   * Return save object for the wire
   */
  save() {
    return {
      // object contains points,color,start point(id,keyname),end point(id,keybame)
      id: this.id,
      points: this.points,
      color: this.color,
      start: {
        id: this.start.parent.id,
        keyName: this.start.parent.keyName,
        pid: this.start.id,
        isSoldered: this.start.isSoldered()
      },
      end: {
        id: this.end.parent.id,
        keyName: this.end.parent.keyName,
        pid: this.end.id,
        isSoldered: this.end.isSoldered()
      }
    };
  }
  /**
   * Load data from saved object
   * @param data Saved object
   */
  load(data) {
    this.color = data.color;
    this.points = data.points;
    if (data.start.isSoldered) {
      this.start.solderWire();
    }
    if (data.end.isSoldered) {
      this.end.solderWire();
    }
  }
  /**
   * Remove Glow of Wire
   */
  private removeGlows() {
    if (this.glows) {
      while (this.glows.length !== 0) {
        this.glows.pop().remove();
      }
    }
  }
  /**
   * Remove wire from canvas
   */
  remove() {
    // Remove Joint
    for (const joint of this.joints) {
      joint.remove();
    }
    // Remove Glow
    this.removeGlows();
    // Clear Joints
    this.joints = null;
    // Clear Points
    this.points = null;
    // Remove element from dom
    this.element.remove();
    // Clear connection from start node
    if (this.start) {
      this.start.disconnect();
    }
    // Clear connection from end node
    if (this.end) {
      this.end.disconnect();
    }
    this.start = null;
    this.end = null;
    this.element = null;
  }

  /**
   * Removes the wire from window.scope and canvas
   */
  delete() {
    _.remove(window.scope.wires, wire => wire === this);
    this.remove();
  }
}
