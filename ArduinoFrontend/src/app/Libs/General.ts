import { CircuitElement } from './CircuitElement';
import { Point } from './Point';
import { areBoundingBoxesIntersecting } from './RaphaelUtils';
import _ from 'lodash';
import { Wire } from './Wire';
import { UndoUtils } from './UndoUtils';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Node tuple class to store breadboard node and element node which are in proximity
 */
class BreadboardProximityNodeTuple {
  breadboardNode: Point;
  elementNode: Point;

  constructor(breadboardNode: Point, elementNode: Point) {
    this.breadboardNode = breadboardNode;
    this.elementNode = elementNode;
  }
}

/**
 * Resistor Class
 */
export class Resistor extends CircuitElement {
  /**
   * color table(hex values) of resistor
   */
  static colorTable: string[] = [];
  /**
   * tolerance color mapping values of resistor
   */
  static tolColorMap: number[] = [];
  /**
   * tolerance value of resistor
   */
  static toleranceValues: string[] = [];
  /**
   * unit labels of resistor
   */
  static unitLabels: string[] = [];
  /**
   * unit values of resistor
   */
  static unitValues: number[] = [];
  /**
   * Resistance value of the resistor.
   */
  value: number;
  /**
   * Tolerance index of the resistor.
   */
  toleranceIndex: number;
  /**
   * Resistor constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('Resistor', x, y, 'Resistor.json', canvas);
  }
  /** init is called when the component is completely drawn to the canvas */
  init() {
    if (Resistor.colorTable.length === 0) {
      Resistor.colorTable = this.data.colorTable;
      Resistor.toleranceValues = this.data.toleranceValues;
      Resistor.tolColorMap = this.data.tolColorMap;
      Resistor.unitLabels = this.data.unitLabels;
      Resistor.unitValues = this.data.unitValues;
    }
    this.value = this.data.initial;
    this.toleranceIndex = this.data.initialToleranceIndex;
    this.updateColors();
    delete this.data;
    this.data = null;

    this.nodes[0].addValueListener((v, cby, par) => {
      if (cby.parent.id !== this.id) {
        this.nodes[1].setValue(v, this.nodes[0]);
      }
    });
    this.nodes[1].addValueListener((v, cby, par) => {
      if (cby.parent.id !== this.id) {
        this.nodes[0].setValue(v, this.nodes[1]);
      }
    });
  }
  /** Saves data/values that are provided to resistor  */
  SaveData() {
    return {
      value: this.value,
      tolerance: this.toleranceIndex
    };
  }
  /**
   * function loads the SaveData()
   * @param data save object
   */
  LoadData(data: any) {
    this.value = data.data.value;
    this.toleranceIndex = data.data.tolerance;
  }
  /**
   * Updates Resistor Properties
   */
  updateColors() {
    const cur = this.getValue();
    this.elements[1].attr({
      fill: Resistor.colorTable[cur.third]
    }); // Third
    this.elements[2].attr({
      fill: Resistor.colorTable[cur.second]
    }); // Second
    this.elements[3].attr({
      fill: Resistor.colorTable[cur.first]
    }); // First
    this.elements[5].attr({
      fill: Resistor.colorTable[cur.multiplier]
    }); // multiplier
    this.elements[4].attr({
      fill: Resistor.colorTable[this.toleranceIndex]
    }); // Tolerance
  }
  /** Function gets Resistence value */
  getValue() {
    const l = `${this.value}`.length;
    const tmp = `${this.value}`;
    if (l < 2) {
      return {
        multiplier: 11,
        first: this.value,
        second: 0,
        third: 0
      };
    } else if (l < 3) {
      return {
        multiplier: 10,
        first: +tmp.charAt(0),
        second: +tmp.charAt(1),
        third: 0,
      };
    }
    return {
      multiplier: l - 3,
      first: +tmp.charAt(0),
      second: +tmp.charAt(1),
      third: +tmp.charAt(2),
    };
  }
  /** Power values for unitvalues 1K ohm => 10^3 */
  private getPower(index: number) {
    if (index >= 0 && index <= Resistor.unitValues.length) {
      return Resistor.unitValues[index];
    }
    return 0;
  }
  /**
   * Calculate the resistance based on the user input.
   * @param value The Input resistance
   * @param unitIndex The selected unit index
   */
  update(value: string, unitIndex: number) {
    const val = parseFloat(value);
    const p = this.getPower(unitIndex);
    const tmp = parseInt((val * p).toFixed(0), 10);
    if (value.length > 12 || isNaN(tmp) || tmp === Infinity || tmp < 1.0 || `${tmp}`.length > 12) {
      window['showToast']('Resistance Not possible');
      return;
    } else {
      this.value = tmp;
      this.updateColors();
    }
  }
  /** Function returns resistence values 10K ohm => 10 */
  getInputValues() {
    const val = this.value;
    let tmp = val;
    for (let i = 0; i < Resistor.unitValues.length; ++i) {
      tmp = Math.floor(val / Resistor.unitValues[i]);
      if (tmp > 0) {
        continue;
      } else {
        return {
          index: i - 1,
          val: val / Resistor.unitValues[i - 1]
        };
      }
    }
    return {
      index: Resistor.unitValues.length - 1,
      val: this.value / Resistor.unitValues[
        Resistor.unitLabels.length - 1
      ]
    };
  }
  /** Function returns the resistor with resistence */
  getName() {
    const cur = this.getInputValues();
    return `Resistor ${cur.val}${Resistor.unitLabels[cur.index]}`;
  }
  /**
   * Function provides component details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    let tmp;
    const cur = this.getInputValues();
    const body = document.createElement('div');
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = `${cur.val}`;
    inp.min = '1';
    inp.addEventListener('wheel', (event) => {
      event.preventDefault();
    });

    const unit = document.createElement('select');
    tmp = '';
    for (const ohm of Resistor.unitLabels) {
      tmp += `<option>${ohm} &#8486;</option>`;
    }
    unit.innerHTML = tmp;
    unit.selectedIndex = cur.index;

    const tole = document.createElement('select');
    tmp = '';
    for (const t of Resistor.toleranceValues) {
      tmp += `<option>&#177; ${t}%</option>`;
    }
    tole.innerHTML = tmp;

    unit.onchange = () => this.update(inp.value, unit.selectedIndex);
    inp.onkeyup = () => this.update(inp.value, unit.selectedIndex);
    inp.onchange = () => this.update(inp.value, unit.selectedIndex);
    tole.onchange = () => {
      this.toleranceIndex = Resistor.tolColorMap[tole.selectedIndex];
      this.updateColors();
    };

    const lab = document.createElement('label');
    lab.innerText = 'Resistance';
    body.append(lab);
    body.append(inp);
    body.append(unit);
    const lab2 = document.createElement('label');
    lab2.innerText = 'Tolerance';
    body.append(lab2);
    body.append(tole);

    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Resistor',
      body
    };
  }
  /**
   * Called by the start simulation.
   */
  initSimulation(): void {
  }
  /**
   * Called by the stop simulation.
   */
  closeSimulation(): void {
  }
}

/**
 * Breadboard Class
 */
export class BreadBoard extends CircuitElement {
  /**
   * Minimum distance of node to be classified as in proximity
   */
  static PROXIMITY_DISTANCE = 20;

  /**
   * Set to keep track of visited nodes
   */
  static visitedNodesv2 = new Set();

  /**
   * Nodes that are connected
   */
  public joined: Point[] = [];

  /**
   * List to store current nodes in the proximity of any of the breadboard' node
   */
  public highlightedPoints: BreadboardProximityNodeTuple[] = [];

  /**
   * Nodes sorted by 'x' and 'y' position
   */
  public sortedNodes: Point[] = [];

  /**
   * Cached list of nodes that are soldered
   */
  private solderedNodes: Point[] = null;

  /**
   * Map of x and nodes with x-coordinates as x
   */
  public sameXNodes: { [key: string]: Point[] } = {};

  /**
   * Map of y and nodes with y-coordinates as y
   */
  public sameYNodes: { [key: string]: Point[] } = {};

  /**
   * Breadboard constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('BreadBoard', x, y, 'Breadboard.json', canvas);
    this.subsribeToDrag({ id: this.id, fn: this.onOtherComponentDrag.bind(this) });
    this.subscribeToDragStop({ id: this.id, fn: this.onOtherComponentDragStop.bind(this) });
  }

  /**
   * Returns node connected to arduino
   * @param node node to start search on
   * @param startedOn label of node search started on
   * @returns Arduino connected Node
   */
  static getRecArduinov2(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to start node
        return node.connectedTo.start;
      } else if (node.connectedTo.end.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to end node
        return node.connectedTo.end;
      } else if (node.connectedTo.start.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.start.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecArduinoBreadv2(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.end.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecArduinoBreadv2(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'Battery9v' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to 9V Battery
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'CoinCell' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to Coin Cell
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'RelayModule') {
        // TODO: Handle RelayModule
        if (startedOn === 'POSITIVE') {
          // If search was started on Positive node then return connected node of VCC in Relay
          return this.getRecArduinov2(node.connectedTo.end.parent.nodes[3], startedOn);
        } else if (startedOn === 'NEGATIVE') {
          // If search was started on Negative node then return connected node of GND in Relay
          return this.getRecArduinov2(node.connectedTo.end.parent.nodes[5], startedOn);
        }
      } else {
        // TODO: If nothing matches
        // IF/ELSE: Determine if start is to be used OR end for further recursion
        if (node.connectedTo.end.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.end.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.end.parent.nodes[e].gid !== node.connectedTo.end.gid
              && !this.visitedNodesv2.has(node.connectedTo.end.parent.nodes[e].gid) && node.connectedTo.end.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.end.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecArduinov2(node.connectedTo.end.parent.nodes[e], startedOn);
            }
          }
        } else if (node.connectedTo.start.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.start.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.start.parent.nodes[e].gid !== node.connectedTo.start.gid
              && !this.visitedNodesv2.has(node.connectedTo.start.parent.nodes[e].gid)
              && node.connectedTo.start.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.start.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecArduinov2(node.connectedTo.start.parent.nodes[e], startedOn);
            }
          }
        }

      }
    } catch (e) {
      console.warn(e);
      return false;
    }

  }

  /**
   * Recursive Function to handle BreadBoard
   * @param node Node which is to be checked for BreadBoard
   */
  static getRecArduinoBreadv2(node: Point, startedOn: string) {
    // IF/ELSE: Determine if start is to be used OR end for further recursion
    if (node.connectedTo.end.gid !== node.gid) {
      const bb = (node.connectedTo.end.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.end.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.end.label.substring(1, node.connectedTo.end.label.length)) {
            const ascii = node.connectedTo.end.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    } else if (node.connectedTo.start.gid !== node.gid) {
      const bb = (node.connectedTo.start.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.start.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.start.label.substring(1, node.connectedTo.start.label.length)) {
            const ascii = node.connectedTo.start.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    }

  }

  /**
   * Subscribes to drag listener of the workspace
   * @param fn listener functino
   */
  subsribeToDrag(fn) {
    // copied the function from Workspace here to avoid circular dependency. TODO: resolve file dependencies
    window['DragListeners'].push(fn);
  }

  /**
   * Subscribes to drag stop listener of the workspace
   * @param fn listener function
   */
  subscribeToDragStop(fn) {
    window['DragStopListeners'].push(fn);
  }

  /**
   * Resets highlighted points
   */
  resetHighlightedPoints() {
    if (this.highlightedPoints.length > 0) {
      this.highlightedPoints.forEach(nodeTuple => nodeTuple.breadboardNode.undoHighlight());
      this.highlightedPoints = [];
    }
  }

  /**
   * Returns list of soldered elements on the breadboard
   */
  getSolderedElements() {
    return this.getSolderedNodes().map(node => node.connectedTo);
  }

  /**
   * Unsolders element from the breadboard if soldered
   * @param element element to find and unsolder
   */
  private maybeUnsolderElement(element) {
    const elementNodesWires = element.nodes.map(node => node.connectedTo);
    const solderedNodes = [...this.getSolderedNodes()];
    for (const breadboardNode of solderedNodes) {
      if (elementNodesWires.includes(breadboardNode.connectedTo)) {
        breadboardNode.unsolderWire();
        _.remove(this.solderedNodes, node => node === breadboardNode);
      }
    }
  }

  /**
   * Listens for drag of other circuit elements in the workspace
   */
  onOtherComponentDrag(element) {
    const bBox = this.elements.getBBox();
    const elementBBox = element.elements.getBBox();
    // Disable Node Bubble on hover
    Point.showBubbleBool = false;
    this.resetHighlightedPoints();

    if (!areBoundingBoxesIntersecting(bBox, elementBBox)) {
      return;
    }
    // unsolder element if it's soldered to either of the breadboard's node
    this.maybeUnsolderElement(element);

    // for all the nodes of the elements, find the nodes in proximity to the nodes of the breadboard
    // and add them to this.highlightedPoints
    for (const node of element.nodes) {
      if (node.isConnected()) {
        continue;
      }
      const nearestNode = this.getNearestNodes(node.x, node.y);
      if (nearestNode) {
        this.highlightedPoints.push(new BreadboardProximityNodeTuple(nearestNode, node));
      }
    }

    // highlight points stored in highlightedPoints
    for (const node of this.highlightedPoints) {
      node.breadboardNode.highlight();
    }
  }

  /**
   * Listener to handle when dragging of a component stops
   */
  onOtherComponentDragStop() {
    // Enable Node Bubble on hover
    Point.showBubbleBool = true;
    // if no highlighted points when the dragging stops, return
    if (this.highlightedPoints.length === 0) {
      return;
    }

    // connect highlightedPoints
    for (const nodeTuple of this.highlightedPoints) {
      const wire = nodeTuple.breadboardNode.solderWire();
      wire.addPoint(nodeTuple.elementNode.x, nodeTuple.elementNode.y);
      // wire.connect(nodeTuple.elementNode, true);
      nodeTuple.elementNode.connectWire(wire, false);
      this.addSolderedNode(nodeTuple.breadboardNode);
    }

    this.resetHighlightedPoints();
  }

  /** init is called when the component is complety drawn to the canvas */
  init() {
    this.sortedNodes = _.sortBy(this.nodes, ['x', 'y']);

    // initialise sameX and sameY node sets
    for (const node of this.nodes) {
      // create the set for x
      this.sameXNodes[node.x] = this.sameXNodes[node.x] || [];
      this.sameXNodes[node.x].push(node);

      // Create the set for y
      this.sameYNodes[node.y] = this.sameYNodes[node.y] || [];
      this.sameYNodes[node.y].push(node);
    }

    // add a connect callback listener
    for (const node of this.nodes) {
      node.connectCallback = (item) => {
        this.joined.push(item);
      };
    }
    this.elements.toBack();

    // Remove the drag event
    this.elements.undrag();
    let tmpx = 0;
    let tmpy = 0;
    let fdx = 0;
    let fdy = 0;
    let tmpar = [];
    let tmpar2 = [];
    // Create Custom Drag event
    this.elements.drag((dx, dy) => {
      this.elements.transform(`t${this.tx + dx},${this.ty + dy}`);
      tmpx = this.tx + dx;
      tmpy = this.ty + dy;
      fdx = dx;
      fdy = dy;
      for (let i = 0; i < this.joined.length; ++i) {
        this.joined[i].move(tmpar[i][0] + dx, tmpar[i][1] + dy);
      }
    }, () => {
      fdx = 0;
      fdy = 0;
      tmpar = [];
      tmpar2 = [];
      for (const node of this.nodes) {
        tmpar2.push(
          [node.x, node.y]
        );
        node.remainHidden();
      }
      for (const node of this.joined) {
        tmpar.push(
          [node.x, node.y]
        );
        node.remainShow();
      }

    }, () => {
      // Push dump to Undo stack & Reset
      UndoUtils.pushChangeToUndoAndReset({ keyName: this.keyName, element: this.save(), event: 'drag', dragJson: { dx: fdx, dy: fdy } });
      for (let i = 0; i < this.nodes.length; ++i) {
        this.nodes[i].move(tmpar2[i][0] + fdx, tmpar2[i][1] + fdy);
        this.nodes[i].remainShow();
      }
      tmpar2 = [];
      this.tx = tmpx;
      this.ty = tmpy;
      // reBuild SameNodeObject after drag stop
      this.reBuildSameNodes();
    });
  }

  /**
   * Function to move/transform breadboard
   * @param fdx relative x position to move
   * @param fdy relative y position to move
   */
  transformBoardPosition(fdx: number, fdy: number): void {
    let tmpar = [];
    let tmpar2 = [];
    let tmpx = 0;
    let tmpy = 0;
    let ffdx = 0;
    let ffdy = 0;

    ffdx = 0;
    ffdy = 0;
    tmpar = [];
    tmpar2 = [];
    for (const node of this.nodes) {
      tmpar2.push(
        [node.x, node.y]
      );
      node.remainHidden();
    }
    for (const node of this.joined) {
      tmpar.push(
        [node.x, node.y]
      );
      node.remainShow();
    }

    this.elements.transform(`t${this.tx + fdx},${this.ty + fdy}`);
    tmpx = this.tx + fdx;
    tmpy = this.ty + fdy;
    ffdx = fdx;
    ffdy = fdy;
    for (let i = 0; i < this.joined.length; ++i) {
      this.joined[i].move(tmpar[i][0] + fdx, tmpar[i][1] + fdy);
    }


    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i].move(tmpar2[i][0] + ffdx, tmpar2[i][1] + ffdy);
      this.nodes[i].remainShow();
    }
    this.tx = tmpx;
    this.ty = tmpy;

  }

  /**
   * Function provides component details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: this.title
    };
  }

  /**
   * Re-build sameNode variables
   */
  reBuildSameNodes() {
    this.sameXNodes = {};
    this.sameYNodes = {};
    // initialise sameX and sameY node sets
    for (const node of this.nodes) {
      // create the set for x
      this.sameXNodes[node.x] = this.sameXNodes[node.x] || [];
      this.sameXNodes[node.x].push(node);

      // Create the set for y
      this.sameYNodes[node.y] = this.sameYNodes[node.y] || [];
      this.sameYNodes[node.y].push(node);
    }
  }

  /**
   * Checks if the point is inside the passed bounding box
   * TODO: move the function to a utils
   * @param boundingBox: Raphael Bounding box object
   * @param x: x-coordinate of the point
   * @param y: y-coordinate of the point
   */
  isPointWithinBbox(boundingBox, x, y): boolean {
    return ((x < boundingBox.cx && x > boundingBox.cx - 1.2 * boundingBox.width) &&
      (y < boundingBox.cy && y > boundingBox.cy - 1.2 * boundingBox.height));
  }

  /**
   * Returns the shortlisted list of the nodes within the proximity of (x, y) coordinate
   * @param x: x-coordinate
   * @param y: y-coordinate
   */
  shortlistNodes(x, y) {
    const xIndexFrom = _.sortedIndexBy(this.sortedNodes, { x: x - BreadBoard.PROXIMITY_DISTANCE }, 'x');
    const xIndexTo = _.sortedLastIndexBy(this.sortedNodes, { x: x + BreadBoard.PROXIMITY_DISTANCE }, 'x');

    return this.sortedNodes.slice(xIndexFrom, xIndexTo);
  }

  /**
   * Returns the nearest node on the breadboard to the passed coordinate
   * @param x: x-coordinate
   * @param y: y-coordinate
   */
  getNearestNodes(x, y) {
    // this.elements.getElementByPoint()
    const nodesToSearch = this.shortlistNodes(x, y);
    for (const node of nodesToSearch) {
      if (this.isPointWithinBbox(node.body.getBBox(), x, y)) {
        return node;
      }
    }
  }

  /**
   * Returns the list of nodes that are soldered on the breadboard
   */
  getSolderedNodes() {
    if (this.solderedNodes == null) {
      this.solderedNodes = this.nodes.filter(node => node.isSoldered());
    }
    return this.solderedNodes;
  }

  /**
   * Adds soldered nodes to the cache
   * @param node node
   */
  addSolderedNode(node) {
    if (this.solderedNodes == null) {
      this.solderedNodes = [];
    }
    this.solderedNodes.push(node);
  }

  /**
   * Initialize Breadboard for simultion
   */
  initSimulation(): void {
    // Stores set of node which has same x values
    const xtemp = this.sameXNodes;
    // Stores set of node which has same y values
    const ytemp = this.sameYNodes;

    for (const node of this.nodes) {
      // Add a Node value change listener
      node.addValueListener((value, calledBy, parent) => {
        const labelCalledBy = calledBy.label;
        const labelParent = parent.label;
        if (calledBy.y === parent.y
          && (labelCalledBy.charCodeAt(0) !== labelParent.charCodeAt(0) || labelCalledBy === labelParent)) {
          return;
        }
        if (node.label === '+' || node.label === '-') {
          for (const neigh of ytemp[node.y]) {
            if (neigh.x !== node.x) {
              neigh.setValue(value, neigh);
            }
          }
        } else {
          const op = node.label.charCodeAt(0);
          if (op >= 102) {
            for (const neigh of xtemp[node.x]) {
              if (neigh.y !== node.y && neigh.label.charCodeAt(0) >= 102) {
                neigh.setValue(value, neigh);
              }
            }
          }
          if (op <= 101) {
            for (const neigh of xtemp[node.x]) {
              if (neigh.y !== node.y && neigh.label.charCodeAt(0) <= 101) {
                neigh.setValue(value, neigh);
              }
            }
          }
        }
      });
    }

  }
  /**
   * Called on Stop Simulation is pressed
   */
  closeSimulation(): void {
    BreadBoard.visitedNodesv2.clear();
  }

}
