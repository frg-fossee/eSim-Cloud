import { Point } from './Point';

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
  constructor(public canvas, public start: Point) {
    this.id = Date.now(); // Generate New id

    // insert the position of start node in array
    this.points.push(start.position());
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
  addPoint(x: number, y: number, isPerpendicular = false) {
    let newX = x;
    let newY = y;

    if (isPerpendicular) {
      const n = this.points.length;
      const [previousX, previousY] = this.points[n - 1];
      [newX, newY] = this.getPerpendicularXY(x, y, previousX, previousY);
    }

    this.add(newX, newY);

    // draw the line from the previous point to cursor's current position
    if (isPerpendicular) {
      this.drawPerpendicular(x, y);
    } else {
      this.draw(x, y);
    }
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
      const pathArray = [`M${this.points[0][0]},${this.points[0][1]}`];
      // Draw lines to other points
      for (let i = 1; i < this.points.length; ++i) {
        pathArray.push(`L${this.points[i][0]},${this.points[i][1]}`);
      }

      if (x && y) {
        pathArray.push(`L${x},${y}`);
      }

      // Update path
      const path = pathArray.join('');
      this.updateWirePath(path);
  }

  /**
   * Add a point to wire
   * @param x x position
   * @param y y position
   */
  private add(x: number, y: number) {
    this.points.push([x, y]);
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
      // on change update the color
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
  connect(t: Point, removeLast: boolean = false, hideJoint: boolean = false) {
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
        const joint = this.canvas.circle(this.points[i][0], this.points[i][1], 6);
        joint.attr({ fill: this.color, stroke: this.color });  // Give the joint a Color
        // Variables used while dragging joints
        let tmpx;
        let tmpy;
        // set drag listener
        joint.drag((dx, dy) => {
          // Update joints position
          joint.attr({ cx: tmpx + dx, cy: tmpy + dy });
          // Update repective Point
          this.points[i] = [tmpx + dx, tmpy + dy];
          // Update the wire
          this.update();
        }, () => {
          // Get the Joints center
          const xx = joint.attr();
          tmpx = xx.cx;
          tmpy = xx.cy;
        }, () => {
        });
        this.joints.push(joint);
        // Hide joint if required
        if (hideJoint) {
          joint.hide();
        }
      }
    }
    // Update Wire
    this.update();
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
      points: this.points,
      color: this.color,
      start: {
        id: this.start.parent.id,
        keyName: this.start.parent.keyName,
        pid: this.start.id
      },
      end: {
        id: this.end.parent.id,
        keyName: this.end.parent.keyName,
        pid: this.end.id
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
  }
  /**
   * Remove Glow of Wire
   */
  private removeGlows() {
    while (this.glows.length !== 0) {
      this.glows.pop().remove();
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
    this.joints = [];
    this.joints = null;
    // Clear Points
    this.points = [];
    this.points = null;
    // Remove element from dom
    this.element.remove();
    // Clear connection from start node
    if (this.start) {
      this.start.connectedTo = null;
    }
    // Clear connection from end node
    if (this.end) {
      this.end.connectedTo = null;
    }
    this.start = null;
    this.end = null;
    this.element = null;
  }
}
