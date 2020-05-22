import { Point } from './Point';
import { element } from '@angular/core/src/render3';
import { Workspace } from './Workspace';

/**
 * Abstract Class Circuit Elements
 * Inherited by Each Circuit Component
 */
export abstract class CircuitElement {
  public keyName: string; // Circuit Component Name
  public id: number; // Stores the id of the Component
  public nodes: Point[] = []; // Stores the Nodes of a Component
  public elements: any;
  public tx = 0;
  public ty = 0;
  public title: string;
  public simulationData: any = {}; // Store Values That are required during simulation
  public data: any = {}; // Store Values that are additionaly require by class
  public info: any;
  /**
   * Creates Circuit Component
   * @param keyName Circuit Component Name
   */
  constructor(keyName: string, public x: number, public y: number, filename: string = '', canvas: any = null) {
    this.id = Date.now(); // Generate New id
    this.keyName = keyName; // Set key name
    this.elements = window['canvas'].set();

    if (filename) {
      fetch(`/assets/jsons/${filename}`)
        .then(v => v.json())
        .then(obj => {
          this.title = obj.name;
          this.DrawElement(canvas, obj.draw);
          this.DrawNodes(canvas, obj.pins, obj.pointHalf);
          // console.log(obj);
          this.info = obj.info;
          this.data = obj.data;
          this.setDragListeners();
          this.setClickListener(null);
          this.setHoverListener();
          this.init();
        })
        .catch(err => {
          // TODO: Show Toast failed to load
          window['showToast']('Failed to load');
        });
    }
  }

  DrawNodes(canvas: any, pinData: any, pointHalf: number) {
    for (const pin of pinData) {
      this.nodes.push(
        new Point(
          canvas,
          this.x + pin.x,
          this.y + pin.y,
          pin.name,
          pointHalf,
          this
        )
      );
    }
  }

  DrawElement(canvas: any, drawData: any) {
    for (const item of drawData) {
      if (item.type === 'image') {
        this.elements.push(
          canvas.image(
            item.url,
            this.x + item.x,
            this.y + item.y,
            item.width,
            item.height
          )
        );
      } else if (item.type === 'path') {
        this.elements.push(
          this.DrawPath(canvas, item)
        );
      } else if (item.type === 'rectangle') {
        this.elements.push(
          canvas.rect(
            this.x + item.x,
            this.y + item.y,
            item.width,
            item.height,
            item.radius || 0
          ).attr({
            fill: item.fill || 'none',
            stroke: item.stroke || 'none'
          })
        );
      } else if (item.type === 'circle') {
        this.elements.push(
          canvas.circle(
            this.x + item.x,
            this.y + item.y,
            item.radius,
          ).attr({
            fill: item.fill || 'none',
            stroke: item.stroke || 'none'
          })
        );
      } else if (item.type === 'polygon') {
        this.DrawPolygon(canvas, item);
      }
    }
  }

  DrawPolygon(canvas: any, item: any) {
    if (item.points.length <= 1) {
      return;
    }
    const points = item.points;
    let tmp = 'M';
    for (const point of points) {
      tmp += `${this.x + point[0]},${this.y + point[1]}L`;
    }
    tmp = tmp.substr(0, tmp.length - 1) + 'z';
    this.elements.push(
      canvas.path(tmp)
        .attr({
          fill: item.fill || 'none',
          stroke: item.stroke || 'none'
        })
    );
  }

  DrawPath(canvas: any, item: any) {
    const lines = /L[\-]?\d+(\.\d*)?\,[\-]?\d+(\.\d*)?/g;
    const start = /M[\-]?\d+(\.\d*)?\,[\-]?\d+(\.\d*)?/g;
    const curves = /C([\-]?\d+(\.\d*)?\,){5}[\-]?\d+(\.\d*)?/g;
    const horizontal = /H[\-]?\d+(\.\d*)?/g;
    const vertical = /V[\-]?\d+(\.\d*)?/g;
    const sCurve = /S([\-]?\d+(\.\d*)?\,){3}[\-]?\d+(\.\d*)?/g;
    let str: string = item.value;
    // console.log(str);

    str = this.calcRelative(str, start, canvas);
    str = this.calcRelative(str, lines, canvas);
    str = this.calcRelative(str, curves, canvas);
    str = this.calcRelative(str, horizontal, canvas);
    str = this.calcRelative(str, vertical, canvas);
    str = this.calcRelative(str, sCurve, canvas);
    this.elements.push(
      canvas.path(str)
        .attr({
          fill: item.fill || 'none',
          stroke: item.stroke || 'none'
        })
    );
  }

  calcRelative(input: string, pattern: RegExp, canvas: any) {
    const founds = input.match(pattern);
    if (founds) {
      for (const found of founds) {
        let output = '';
        const start = found.charAt(0);
        let tmp: any = found.substring(1).split(',');
        tmp = tmp.map(v => parseFloat(v));
        if (start === 'M' || start === 'L') {
          output += `${start}${this.x + tmp[0]},${this.y + tmp[1]}`;
        } else if (start === 'V') {
          output += `${start}${this.y + tmp[0]}`;
        } else if (start === 'H') {
          output += `${start}${this.x + tmp[0]}`;
        } else if (start === 'C') {
          output += `${start}${this.x + tmp[0]},`;
          output += `${this.y + tmp[1]},`;
          output += `${this.x + tmp[2]},`;
          output += `${this.y + tmp[3]},`;
          output += `${this.x + tmp[4]},`;
          output += `${this.y + tmp[5]}`;
        } else if (start === 'S') {
          output += `${start}${this.x + tmp[0]},`;
          output += `${this.y + tmp[1]},`;
          output += `${this.x + tmp[2]},`;
          output += `${this.y + tmp[3]},`;
        }
        input = input.replace(found, output);
      }
    }
    return input;
  }

  setDragListeners() {
    let tmpx = 0;
    let tmpy = 0;
    let fdx = 0;
    let fdy = 0;
    let tmpar = [];
    this.elements.drag((dx, dy) => {
      this.elements.transform(`t${this.tx + dx},${this.ty + dy}`);
      tmpx = this.tx + dx;
      tmpy = this.ty + dy;
      fdx = dx;
      fdy = dy;
      for (let i = 0; i < this.nodes.length; ++i) {
        this.nodes[i].move(tmpar[i][0] + dx, tmpar[i][1] + dy);
      }
    }, () => {
      fdx = 0;
      fdy = 0;
      tmpar = [];
      for (const node of this.nodes) {
        // node.remainHidden();
        tmpar.push(
          [node.x, node.y]
        );
      }
    }, () => {
      // for (const node of this.nodes) {
      //   node.relativeMove(fdx, fdy);
      //   node.remainShow();
      // }
      this.tx = tmpx;
      this.ty = tmpy;
      this.x += this.tx;
      this.y += this.ty;
    });
  }

  setHoverListener() {
    // this.elements.mouseover(() => {
    //   for (const node of this.nodes) {
    //     // node.show();
    //   }
    // });
    // this.elements.mouseout(() => {
    //   for (const node of this.nodes) {
    //     // node.hide();
    //   }
    // });
  }

  setClickListener(callback: () => void) {
    this.elements.mousedown(() => {
      window['isSelected'] = true;
      window['Selected'] = this;
      window['showProperty'](() => this.properties());
      if (callback) {
        callback();
      }
    });
  }
  init() { }

  /**
   * Save Circuit Component
   */
  abstract save(): any;
  /**
   * Load Circuit Component
   */
  abstract load(data: any): void;
  /**
   * Returns the Circuit Node based on the x,y Position
   */
  abstract getNode(x: number, y: number): Point;
  /**
   * Removes Component from Canvas and memory
   */
  remove(): void {
    this.elements.remove();
    for (const n of this.nodes) {
      n.remove();
    }
    this.delete();
  }
  delete() { }
  /**
   * Return the Property of the Circuit Component
   * @returns Object containing component name,id and the html required to be shown on property box
   */
  abstract properties(): { keyName: string, id: number, body: HTMLElement, title: string };
  /**
   * Initialize variable required for simulation
   * Called before simulation
   */
  abstract initSimulation(): void;
  /**
   * Called when Stop Simulation
   */
  abstract closeSimulation(): void;
  /**
   * Called During Simulation
   */
  abstract simulate(): void;
}
