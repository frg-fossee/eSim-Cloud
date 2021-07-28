import { Wire } from './Wire';
import { CircuitElement } from './CircuitElement';
import { isNull } from 'util';
import { BoundingBox } from './Geometry';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Class For Circuit Node ie. Point wires can connect with nodes
 */
export class Point {

  /**
   * Boolean to either show bubble on hover or not
   */
  static showBubbleBool = true;
  /**
   * Hide node on creation
   */
  static defaultAttr: any = {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)'
  };
  /**
   * Show red color with black stroke on hover
   */
  static nodeAttr: any = {
    fill: 'rgba(255,0,0,1)',
    stroke: 'rgba(0,0,0,1)'
  };
  /**
   * Body of the Circuit Node
   */
  body: any;

  /**
   * Stores the reference of wire which is connected to it
   */
  connectedTo: Wire = null;

  /**
   * Is the point soldered with wire.
   */
  private soldered = false;

  /**
   * Hover callback called on hover over node
   */
  hoverCallback: any = null;

  /**
   * Hover Close Callback called if hover is removed
   */
  hoverCloseCallback: any = null;

  /**
   * Callback called when we connect wire.
   */
  connectCallback: any = null;
  /**
   * The Value of the node
   */
  value = -1;
  /**
   * Value change listener
   */
  listener: (val: number, calledby: Point, current: Point) => void = null;
  /**
   * Graph id used while starting simulation.
   */
  gid = -1;
  /**
   * The Node ID
   */
  id: number;
  /**
   * Boolean for inputPullUp
   */
  pullUpEnabled = false;

  /**
   * Constructor for Circuit Node
   * @param canvas Raphael Canvas / paper
   * @param x x position of node
   * @param y y position of node
   * @param label label to be shown when hover
   * @param half The Half width of Square
   * @param parent parent of the circuit node
   */
  constructor(
    private canvas: any,
    public x: number,
    public y: number,
    public label: string,
    public half: number,
    public parent: CircuitElement
  ) {
    // if (window['point_id']) {
    //   this.id = window['point_id'];
    //   window.point_id += 1;
    // }
    // else {
    //   this.id = 1;
    //   window['point_id'] = 2;
    // }
    this.id = this.parent.nid;
    ++this.parent.nid;
    // Create a rectangle of 4x4 and set default color and stroke
    this.body = this.canvas.rect(x, y, 2 * this.half, 2 * this.half);

    this.body.attr(Point.defaultAttr);
    this.body.node.setAttribute('class', 'mynode');

    // Set Hover callback
    this.body.hover((evt: MouseEvent) => {
      // Check if showBubbleBool is enabled
      if (Point.showBubbleBool) {
        // Check if callback is present if it is then call it
        if (this.hoverCallback) {
          this.hoverCallback(this.x, this.y);
        }
        window.showBubble(this.label, evt.clientX, evt.clientY);
      } else {
        // TODO: Do not show node highligtht
        this.remainHidden();
      }
    }, () => {
      // Check if close callback is present if present call it
      if (this.hoverCloseCallback) {
        this.hoverCloseCallback(this.x, this.y);
      }
      window.hideBubble();
      // Show node highligtht
      this.remainShow();
    });

    // TODO: Remove The following code After Development
    // this.body.drag((dx, dy) => {
    //   this.body.attr({
    //     x: this.x + dx,
    //     y: this.y + dy
    //   });
    // }, () => {
    //   this.x = this.body.attr("x");
    //   this.y = this.body.attr("y");
    // }, () => {
    //   this.x = this.body.attr("x");
    //   this.y = this.body.attr("y");
    // });
    // this.body.dblclick(() => {
    //   alert((this.x - this.parent.x) + "," + (this.y - this.parent.y) + "   " + this.label);
    // });
    // return;

    // Set click listener
    this.body.mousedown(() => {
      if (this.connectedTo != null) {
        return;
      }
      if ((window['Selected'] instanceof Wire) && !window.Selected.isConnected()) {
        this.connectWire(window['Selected']);
        window['isSelected'] = false; // deselect object
        window['Selected'] = null;
      } else {
        // if nothing is selected create a new wire object
        window.isSelected = true;
        const wire = this.startNewWire();
        // select the wire and insert into the scope of circuit
        window.Selected = wire;
      }
      if (this.connectCallback) {
        this.connectCallback(this);
      }
    });

  }

  isConnected(): boolean {
    return !!this.connectedTo;
  }

  isSoldered(): boolean {
    return this.soldered;
  }

  /**
   * Solders wire to the point
   * @param wire wire to solder (if existing wire, else pass empty to create a new wire at the node)
   */
  solderWire(wire?): Wire {
    if (!wire) {
      wire = this.startNewWire();
    }
    this.soldered = true;
    const newClass = `${this.body.node.getAttribute('class')} solder-highlight`;
    this.body.node.setAttribute('class', newClass);
    if (this.connectCallback) {
      this.connectCallback(this);
    }
    return wire;
  }

  /**
   * Unsolders wire to the point
   */
  unsolderWire() {
    const wire = this.connectedTo;
    if (wire) {
      this.setValue(-1, this);
      wire.delete();
    }
    this.soldered = false;
    const newClass = this.body.node.getAttribute('class').replace(' solder-highlight', '');
    this.body.node.setAttribute('class', newClass);
  }

  connectWire(wire, pushToUndo = true) {
    // if selected item is wire then connect the wire with the node
    // console.log([]);
    if (wire.start === this) { return; }
    this.connectedTo = wire;
    wire.connect(this, true, false, !pushToUndo, pushToUndo ? 'add' : 'breadDrag');
    wire.deselect();
    if (wire.start && wire.end) {
      window['scope']['wires'].push(wire);
    } else {
      window['showToast']('Wire was not connected properly !');
    }
  }

  /**
   * Creates and originates new wire at the point
   */
  startNewWire() {
    const wire = new Wire(this.canvas, this);
    this.connectedTo = wire;
    return wire;
  }

  /**
   * Returns the bounding box of the point
   */
  getBoundingBox(): BoundingBox {
    return BoundingBox.loadFromRaphaelBbox(this.body.getBBox());
  }

  /**
   * Set Hover and Hover close Callback
   * @param callback Hover Callback
   * @param closeCallback Hover Close Callback
   */
  setHoverCallback(callback = null, closeCallback = null) {
    this.hoverCallback = callback;
    this.hoverCloseCallback = closeCallback;
  }

  /**
   * Return the center position of the Node
   */
  position() {
    return [this.x + this.half, this.y + this.half];
  }

  highlight() {
    const newClass = `${this.body.node.getAttribute('class')} highlight`;
    this.body.node.setAttribute('class', newClass);
  }

  undoHighlight() {
    const newClass = this.body.node.getAttribute('class').replace(' highlight', '');
    this.body.node.setAttribute('class', newClass);
  }

  /**
   * Change the Position of Node with relative to current position
   * @param dx change in x axis
   * @param dy change in y axis
   */
  relativeMove(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    // update the position
    this.body.attr({
      x: this.x,
      y: this.y
    });
  }

  /**
   * Hide Node
   */
  hide() {
    this.body.attr(Point.defaultAttr);
  }
  /**
   * This will permanently hide the node
   */
  remainHidden() {
    this.body.hide();
  }
  /**
   * This will show node if its is permanently hidden
   */
  remainShow() {
    this.body.show();
  }

  /**
   * Show Node
   */
  show() {
    if (this.connectedTo) { return; }
    this.body.attr(Point.nodeAttr);
  }

  /**
   * Move Node to x,y
   * @param x new x position of Node
   * @param y new y position of Node
   */
  move(x: number, y: number) {
    this.x = x;
    this.y = y;
    // Update the positon
    this.body.attr({
      x: this.x,
      y: this.y
    });
  }

  /**
   * Disconnects the point to wire
   */
  disconnect() {
    this.connectedTo = null;
    if (this.isSoldered()) {
      this.unsolderWire();
    }
  }

  /**
   * Remove Node from canvas
   */
  remove() {
    this.body.remove();
    if (this.connectedTo) {
      this.connectedTo.remove();
      this.connectedTo = null;
      this.parent = null;
    }
  }
  /**
   * Adding a Value Change Listener.
   * @param listener Value Change Listener
   */
  addValueListener(listener: (val: number, calledby: Point, parent: Point) => void) {
    this.listener = listener;
  }
  /**
   * Set the value of a Circuit node.
   * @param value New Value
   * @param calledby The node which sets the value
   */
  setValue(value: number, calledby: Point) {
    this.value = value;

    if (calledby && this.listener) {
      this.listener(this.value, calledby, this);
    }

    if (isNull(calledby)) {
      calledby = this;
    }
    // Propogate the value further

    if (this.connectedTo && this.connectedTo.end) {
      if (this.connectedTo.end.gid !== calledby.gid && this.connectedTo.end.gid !== this.gid) {
        this.connectedTo.end.setValue(this.value, this);
      }
    }

    if (this.connectedTo && this.connectedTo.start) {
      if (this.connectedTo.start.gid !== calledby.gid && this.connectedTo.start.gid !== this.gid) {
        this.connectedTo.start.setValue(this.value, this);
      }
    }
  }
}
