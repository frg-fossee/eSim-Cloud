import { Utils } from './Utils';
import { Wire } from './Wire';
import { ArduinoUno } from './outputs/Arduino';
import { ApiService } from '../api.service';
import { Download, ImageType } from './Download';
import { isNull, isUndefined } from 'util';
import { SaveOffline } from './SaveOffiline';
import { Point } from './Point';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

// Enum function for Colour values to print in console
export enum ConsoleType { INFO, WARN, ERROR, OUTPUT }
/**
 * This class contains all Workspace related functions.
 */
export class Workspace {
  /**
   * The Worspace Translation x value
   */
  static translateX = 0.0;
  /**
   * The Worspace Translation y value
   */
  static translateY = 0.0;
  /**
   * Stores scaling factor value for zoom in/out
   */
  static scale = 1.0;
  /**
   * zoomin/out increments by 0.01
   */
  static readonly zooomIncrement = 0.01;
  /**
   * Translation Rate while holding and moving canvas
   */
  static readonly translateRate = 0.25;
  /**
   * tores initial position values for x and y
   */
  static moveCanvas = {
    x: 0,
    y: 0,
    start: false
  };
  /**
   * Stores value of copied component
   */
  static copiedItem: any;
  /**
   * If simulation is on progress or not
   */
  static simulating = false;

  /** function to zoom in workspace */
  static zoomIn() {
    Workspace.scale = Math.min(10, Workspace.scale + Workspace.zooomIncrement);
    Workspace.scale = Math.min(10, Workspace.scale + Workspace.zooomIncrement);
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);
    Workspace.updateWires();
  }

  /** function to zoom out workspace */
  static zoomOut() {
    Workspace.scale = Math.max(0.1, Workspace.scale - Workspace.zooomIncrement);
    Workspace.scale = Math.max(0.1, Workspace.scale - Workspace.zooomIncrement);
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);
    Workspace.updateWires();
  }

  /** Function deals with min and max value of zoom, hold and move  */
  static minMax(min: number, max: number, value: number) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
  /**
   * Initialize Global Variables
   * @param canvas Raphael Paper (Canvas)
   */
  static initalizeGlobalVariables(canvas: any) {
    Workspace.simulating = false;
    Workspace.copiedItem = null;
    Workspace.moveCanvas = {
      x: 0, y: 0, start: false
    };
    Workspace.scale = 1.0;
    Workspace.translateY = 0.0;
    Workspace.translateX = 0.0;
    window['canvas'] = canvas;
    window['holder'] = document.getElementById('holder').getBoundingClientRect();
    window['holder_svg'] = document.querySelector('#holder > svg');
    window['ArduinoUno_name'] = {};
    window.scope = null;
    // Stores all the Circuit Information
    window['scope'] = {
      wires: []
    };
    for (const key in Utils.components) {
      if (window['scope'][key] === null || window['scope'][key] === undefined) {
        window['scope'][key] = [];
      }
    }
    // True when simulation takes place
    window['isSimulating'] = false;
    // Stores the reference to the selected circuit component
    window['Selected'] = null;
    // True when a component is selected
    window['isSelected'] = false;
    // Intialize a variable for Property Box
    window['property_box'] = {
      x: 0,
      y: 0,
      element: document.getElementById('propertybox'),
      title: document.querySelector('#propertybox .title'),
      body: document.querySelector('#propertybox .body'),
      mousedown: false
    };
    window['DragListeners'] = [];
    window['DragStopListeners'] = [];

    window['onDragEvent'] = Workspace.onDragEvent;
    window['onDragStopEvent'] = Workspace.onDragStopEvent;
  }

  /**
   * Handler for drag stop event
   */
  static onDragStopEvent(element) {
    for (const fn of window.DragStopListeners) {
      fn(element);
    }
  }

  /**
   * Handler for drag event
   */
  static onDragEvent(element) {
    for (const fn of window.DragListeners) {
      fn(element);
    }
  }

  /**
   * Subscribes to drag event of element in the workspace
   * @param fn listener function
   */
  static subsribeToDrag(fn) {
    window['DragListeners'].push(fn);
  }

  /**
   * Subscribes to drag stop event of element in the workspace
   * @param fn listener function
   */
  static subsribeToDragStop(fn) {
    window['DragStopListeners'].push(fn);
  }

  /**
   * Initialize Property Box
   * @param toggle Callback For Property Box
   */
  static initProperty(toggle: (state: boolean) => void) {
    // Global Function to Show Properties of Circuit Component
    window['showProperty'] = (callback: any) => {
      const data = callback();
      window['property_box'].element.setAttribute('key', data.keyName);
      window['property_box'].title.innerText = data.title;
      window['property_box'].body.innerHTML = '';
      window['property_box'].body.appendChild(data.body);
      toggle(false);
    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {
      if (window.Selected && window.Selected.deselect) {
        window.Selected.deselect();
      }
      window['Selected'] = null;
      window['isSelected'] = false;
      window['property_box'].body.innerHTML = '';
      window['property_box'].title.innerText = 'Project Info';
      toggle(true);
    };
  }
  /**
   * Initialize Global Functions
   */
  static initializeGlobalFunctions() {
    // Global Function to show Popup Bubble
    window['showBubble'] = (label: string, x: number, y: number) => {
      // id label is empty don't show anything
      if (label === '') { return; }
      const ele = document.getElementById('bubblebox');
      ele.innerText = label;
      ele.style.display = 'block';
      ele.style.top = `${y + 25}px`;
      ele.style.left = `${(x - ele.clientWidth / 2)}px`;
    };
    // Global Function to hide Popub Bubble
    window['hideBubble'] = () => {
      const ele = document.getElementById('bubblebox');
      ele.style.display = 'none';
    };
    // Global Function to show Toast Message
    window['showToast'] = (message: string) => {
      const ele = document.getElementById('ToastMessage');

      ele.style.display = 'block';
      ele.innerText = message;
      ele.style.padding = '15px 25px 15px 25px';
      setTimeout(() => {
        ele.style.display = 'none';
      }, 10000);

    };
    // Global Function to print output in Console
    window['printConsole'] = (textmsg: string, type: ConsoleType) => {
      const msg = document.getElementById('msg');
      const container = document.createElement('label');
      container.innerText = textmsg;
      //  checks which type of output needs to be printed
      //  depending on which the colour is assigned
      if (type === ConsoleType.ERROR) {
        container.style.color = 'red';
      } else if (type === ConsoleType.WARN) {
        container.style.color = 'yellow';
      } else if (type === ConsoleType.INFO) {
        container.style.color = 'white';
      } else if (type === ConsoleType.OUTPUT) {
        container.style.color = '#03fc6b';
      }
      msg.appendChild(container);
    };
  }
  /**
   * Before Unload Event Handler
   * @param event Before Unload Event
   */
  static BeforeUnload(event) {
    event.preventDefault();
    event.returnValue = 'did you save the stuff?';
  }
  /**
   * Event Listener for mousemove on html body
   * @param event Mouse Event
   */
  static bodyMouseMove(event: MouseEvent) {
    if (Workspace.moveCanvas.start) {
      const dx = (event.clientX - Workspace.moveCanvas.x) * Workspace.translateRate;
      const dy = (event.clientY - Workspace.moveCanvas.y) * Workspace.translateRate;
      const ele = (window['canvas'].canvas as HTMLElement);
      ele.setAttribute('transform', `scale(
        ${Workspace.scale},
        ${Workspace.scale})
        translate(${Workspace.translateX + dx},
        ${Workspace.translateY + dy})`);
    }
    if (window['property_box'].start) {
      const el = window['property_box'].element;
      el.style.left = `${Workspace.minMax(0, window.innerWidth - 220, event.clientX - window['property_box'].x)}px`;
      el.style.top = `${Workspace.minMax(0, window.innerHeight - 50, event.clientY - window['property_box'].y)}px`;
    }
  }
  /**
   * Event Listener for mouseup on html body
   * @param event Mouse Event
   */
  static bodyMouseUp(event: MouseEvent) {
    if (Workspace.moveCanvas.start) {
      const dx = (event.clientX - Workspace.moveCanvas.x) * Workspace.translateRate;
      const dy = (event.clientY - Workspace.moveCanvas.y) * Workspace.translateRate;
      Workspace.translateX += dx;
      Workspace.translateY += dy;
      Workspace.moveCanvas.start = false;
      document.getElementById('holder').classList.remove('grabbing');
    }
    window['property_box'].start = false;
  }
  /**
   * Event Listener for mousedown on html body
   * @param event MouseDown
   */
  static mouseDown(event: MouseEvent) {
    Workspace.hideContextMenu();
    if (window['isSelected'] && (window['Selected'] instanceof Wire)) {
      // if selected item is wire and it is not connected then add the point
      if (window.Selected.end == null) {
        const pt = Workspace.svgPoint(event.clientX, event.clientY);
        window.Selected.addPoint(pt.x, pt.y, event.shiftKey);
        return;
      }
    }
    if ((event.target as HTMLElement).tagName === 'svg') {
      Workspace.moveCanvas = {
        x: event.clientX,
        y: event.clientY,
        start: true
      };
      document.getElementById('holder').classList.add('grabbing');
    }
  }
  /**
   * Event Handler On clicking on workspace
   * @param event Mouse Click event
   */
  static click(event: MouseEvent) {
  }
  /**
   * Returns true if current selected item is wire
   */
  private static isWireSelected(): boolean {
    return window['isSelected'] && (window['Selected'] instanceof Wire);
  }

  /**
   * Event Listener for mouseMove on html body
   * @param event MouseMove
   */
  static mouseMove(event: MouseEvent) {
    event.preventDefault();
    // if wire is selected then draw temporary lines
    if (Workspace.isWireSelected()) {
      const pt = Workspace.svgPoint(event.clientX - 2, event.clientY - 2);
      if (event.shiftKey) {
        window.Selected.drawPerpendicular(pt.x, pt.y);
      } else {
        window.Selected.draw(pt.x, pt.y);
      }
    } else {
      // deselect item
      if (window.Selected && window.Selected.deselect) {
        window.Selected.deselect();
      }
    }
    Workspace.updateWires();
  }

  /*
  TODO: Remove if not Required
  static mouseEnter(event: MouseEvent) {

  }
  static mouseLeave(event: MouseEvent) {

  }

  static mouseOver(event: MouseEvent) {

  }

  static mouseOut(event: MouseEvent) {

  }*/
  /**
   * Event handler for mouse up on workspace.
   * @param event Mouse Event
   */
  static mouseUp(event: MouseEvent) {

  }

  /**
   * Event Listener to display Context menu (for performing copy, paste, delete operation)
   * @param event Mouse Event
   */
  static contextMenu(event: MouseEvent) {
    event.preventDefault();
    const element = document.getElementById('contextMenu');
    element.style.display = 'block';
    element.style.left = `${event.clientX}px`;
    element.style.top = `${event.clientY}px`;
    return true;
  }

  /** Function called to hide ContextMenu */
  static hideContextMenu() {
    const element = document.getElementById('contextMenu');
    element.style.display = 'none';

  }
  /**
   * Event handler for copy on workspace.
   * @param event Clipboard Event
   */
  static copy(event: ClipboardEvent) {
  }
  /**
   * Event handler for CUT on workspace.
   * @param event Clipboard Event
   */
  static cut(event: ClipboardEvent) {
  }

  /**
   * function deselects the item on Canvas
   * @param event DoubleClick
   */
  static doubleClick(event: MouseEvent) {
    if (window['isSelected'] && (window['Selected'] instanceof Wire) && !window.Selected.isConnected()) {
      return;
    }
    if ((event.target as HTMLElement).tagName !== 'svg') {
      return;
    }
    // deselect item
    window.hideProperties();
  }
  /**
   * function drags element to valid drop target
   * @param event DragEvent
   */
  static dragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  /**
   * function drags element over a valid drop target
   * @param event DragEvent
   */
  static dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  /**
   * function drop element at drop target
   * @param event DragEvent
   */
  static drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const className = event.dataTransfer.getData('text'); // get the event data
    const pt = Workspace.svgPoint(event.clientX, event.clientY);
    Workspace.addComponent(className, pt.x, pt.y, 0, 0);
  }

  /**
   * Key down event on workspace.
   * @param event Keyboard Event
   */
  static keyDown(event: KeyboardEvent) {
    if (event.shiftKey) {
      if (Workspace.isWireSelected()) {
        window.Selected.togglePerpendicularLine(true);
      }
    }
  }

  /**
   * Key Press event on workspace.
   * @param event Keyboard Event
   */
  static keyPress(event: KeyboardEvent) {
  }
  /**
   * event Listener to perform Keyboard Shortcut operations
   * @param event keyup Event
   */
  static keyUp(event: KeyboardEvent) {
    if (window.isCodeEditorOpened) {
      return;
    }
    // console.log([event.ctrlKey, event.key]);
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Backspace or Delete
      Workspace.DeleteComponent();
    }
    if (event.key === 'Escape') {
      // terminate current wire connection if in progress
      if (window.Selected instanceof Wire && !window.Selected.isConnected()) {
        Workspace.DeleteComponent();
      }
    }
    if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
      // Copy
      Workspace.copyComponent();
    }
    if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
      // paste
      Workspace.pasteComponent();
    }
    if (event.ctrlKey && (event.key === '+')) {
      // CTRL + +
      Workspace.zoomIn();
    }
    if (event.ctrlKey && (event.key === '-')) {
      // CTRL + -
      Workspace.zoomIn();
    }
    if (event.ctrlKey && (event.key === 'k' || event.key === 'K')) {
      // TODO: Open Code Editor
    }
    if (event.key === 'F5') {
      // TODO: Start Simulation
    }
    if (event.key === 'Shift') {
      if (Workspace.isWireSelected()) {
        window.Selected.togglePerpendicularLine(false);
      }
    }
  }
  /**
   * Event Listener for zoom in/zoom out on workspace
   * @param event MouseWheel Event
   */
  static mouseWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      Workspace.zoomIn();
    } else {
      Workspace.zoomOut();
    }
  }
  /**
   * Event handler for paste.
   * @param event Clipboard Event
   */
  static paste(event: ClipboardEvent) {
  }
  /**
   * Function adds components by providing their keynames
   * @param classString string
   * @param x number
   * @param y number
   * @param offsetX  number
   * @param offsetY number
   */
  static addComponent(classString: string, x: number, y: number, offsetX: number, offsetY: number) {
    const myClass = Utils.components[classString].className;
    const obj = new myClass(
      window['canvas'],
      x - offsetX,
      y - offsetY
    );
    window['scope'][classString].push(obj);
  }
  /** Function updates the position of wires */
  static updateWires() {
    for (const z of window['scope']['wires']) {
      z.update();
    }
  }
  /**
   * Function returns point translated according to the svg
   * @param x number
   * @param y number
   */
  static svgPoint(x, y) {
    const pt = window['holder_svg'].createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(window.canvas.canvas.getScreenCTM().inverse());
  }
  /**
   * This function is required by deleteComponent() to recursively remove item
   * @param obj any
   */
  static removeMeta(obj) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'object') {
        obj[prop] = null;
      } else {
        delete obj[prop];
      }
    }
  }
  /**
   * Function saves the circuit Offline
   * @param name string
   * @param description string
   * @param callback any
   * @param id number
   */
  static SaveCircuit(name: string = '', description: string = '', callback: any = null, id: number = null) {
    let toUpdate = false;
    // Check if id is already present then enable Update
    if (isNull(id)) {
      id = Date.now();
    } else {
      toUpdate = true;
    }
    // Default Save object
    const saveObj = {
      id,
      canvas: {
        x: Workspace.translateX,
        y: Workspace.translateY,
        scale: Workspace.scale
      },
      project: {
        name,
        description,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    };
    // For each item in the scope
    for (const key in window.scope) {
      // if atleast one component is present
      if (window.scope[key] && window.scope[key].length > 0) {
        saveObj[key] = [];
        // Add the component to the save object
        for (const item of window.scope[key]) {
          if (item.save) {
            saveObj[key].push(item.save());
          }
        }
      }
    }
    // Save the Thumbnail for the circuit
    Download.ExportImage(ImageType.PNG).then(v => {
      saveObj.project['image'] = v; // Add the base64 image
      // console.log(saveObj);
      // Save or Update Circuit Ofline
      if (toUpdate) {
        SaveOffline.Update(saveObj);
      } else {
        SaveOffline.Save(saveObj, callback);
      }
    });

  }

  /**
   * Function called to Load data from saved object
   * @param data Saved Object
   */
  static Load(data) {
    // Clear Project
    this.ClearWorkspace();
    // Show loading animation
    window.showLoading();
    // Load The translation and scaling values
    Workspace.translateX = data.canvas.x;
    Workspace.translateY = data.canvas.y;
    Workspace.scale = data.canvas.scale;

    // Update the translation and scaling
    window.queue = 0;
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);

    // For each component key in the data
    for (const key in data) {
      // Check if key is valid
      if (!(key in data)) {
        continue;
      }
      // if key is not related to circuit then continue
      if (key !== 'id' && key !== 'canvas' && key !== 'project' && key !== 'wires') {
        // Initialize an array
        window['scope'][key] = [];

        // Get the data for respective component
        const components = data[key];

        for (const comp of components) {
          // Get class from keyname using the map
          const myClass = Utils.components[key].className;
          // Create Component Object from class
          const obj = new myClass(
            window['canvas'],
            comp.x,
            comp.y
          );

          window.queue += 1;
          // Add to scope
          window['scope'][key].push(obj);
          // Load data for each object
          if (obj.load) {
            obj.load(comp);
          }
        }

      }
    }
    // Wait until all components are drawn
    const interval = setInterval(() => {
      if (window.queue === 0) {
        clearInterval(interval);
        // start drawing wires
        Workspace.LoadWires(data.wires);
        // Hide loading animation
        window.hideLoading();
      }
    }, 100);

  }
  /** This function recreates the wire object */
  static LoadWires(wires: any[]) {
    if (isNull(wires) || isUndefined(wires)) {
      return;
    }

    for (const w of wires) {
      const points = w.points;
      let start: Point = null;
      let end: Point = null;

      // Use Linear search to find the start circuit node
      for (const st of window.scope[w.start.keyName]) {
        // console.log(st.id,w.start.id);
        if (st.id === w.start.id) {
          start = st.getNode(points[0][0], points[0][1], w.start.pid);
          break;
        }
      }

      // Use Linear Search to find the end circuit node
      for (const en of window.scope[w.end.keyName]) {
        if (en.id === w.end.id) {
          const p = points[points.length - 1];
          end = en.getNode(p[0], p[1], w.end.pid);
          break;
        }
      }

      // console.log([start, end]);
      // if both nodes are present then connect those nodes
      if (start && end) {
        const tmp = new Wire(window.canvas, start);
        tmp.load(w);
        start.connectedTo = tmp;
        end.connectedTo = tmp;
        tmp.connect(end, true, true);
        window['scope']['wires'].push(tmp);
        tmp.update();
        if (start.connectCallback) {
          start.connectCallback(start);
        }
        if (end.connectCallback) {
          end.connectCallback(end);
        }
      } else {
        console.log('Not able to recreate Wires');
        // alert('something went wrong');
      }
    }

  }

  /** Function to delete component fro Workspace */
  static DeleteComponent() {

    // Check if component is selected
    if (window['Selected']) {
      // is selected component is an arduini uno then show confirm message
      if (window['Selected'] instanceof ArduinoUno) {
        const ans = confirm('The Respective code will also be lost!');
        if (!ans) {
          return;
        }
      }

      // get the component id
      const uid = window.Selected.id;
      const key = window.Selected.keyName;

      // If Current Selected item is a Wire which is not Connected from both end
      if (key === 'wires') {
        if (isNull(window.Selected.end)) {
          // Remove and deselect
          window.Selected.remove();
          window.Selected = null;
          window.isSelected = false;
        }
      }

      // get the component keyname
      const items = window.scope[key];
      // Use linear search find the element
      for (let i = 0; i < items.length; ++i) {
        if (items[i].id === uid) {
          // remove from DOM
          window.Selected.remove();
          window.Selected = null;
          window.isSelected = false;
          // Remove from scope
          const k = items.splice(i, 1);
          // Remove data from it recursively
          Workspace.removeMeta(k[0]);

          if (key !== 'wires') {
            let index = 0;
            while (index < window.scope.wires.length) {
              const wire = window.scope.wires[index];
              if (isNull(wire.start) && isNull(wire.end)) {
                window.scope.wires.splice(index, 1);
                continue;
              }
              ++index;
            }
          }

          break;
        }
      }
      // Hide Property box
      window.hideProperties();
    } else {
      window['showToast']('No Element Selected');
    }
  }

  /** Function to copy component fro Workspace */
  static copyComponent() {
    if (window['Selected']) {
      if (window['Selected'] instanceof Wire) {
        window['showToast']('You Can\'t Copy Wire');
        return;
      }
      Workspace.copiedItem = window.Selected;
    } else {
      Workspace.copiedItem = null;
    }
  }

  /** Function to paste component fro Workspace */
  static pasteComponent() {
    // console.log(Workspace.copiedItem);
    if (Workspace.copiedItem) {
      const ele = document.getElementById('contextMenu');
      let x = +ele.style.left.replace('px', '');
      let y = +ele.style.top.replace('px', '');
      // console.log([x, y]);
      const key = Workspace.copiedItem.keyName;
      if (x === 0 && y === 0) {
        x = Workspace.copiedItem.x + 100;
        y = Workspace.copiedItem.y + 100;
      }
      const pt = Workspace.svgPoint(x, y);
      // Workspace.addComponent(Workspace.copiedItem, pt.x, pt.y, 0, 0);
      const myClass = Utils.components[key].className;
      const obj = new myClass(window['canvas'], pt.x, pt.y);
      window['scope'][key].push(obj);
      // obj.copy(Workspace.copiedItem)
    }
  }

  /** Function called to clear output in console */
  static ClearConsole() {
    const clear = document.getElementById('msg');
    let inside: any = clear.firstChild;
    while (inside != null) {
      if (inside.tagName === 'PRE') {
        inside.innerText = '';
        inside = inside.nextSibling;
        continue;
      }
      const tmp = inside;
      inside = inside.nextSibling;
      clear.removeChild(tmp);
    }
  }

  /** Function called to compile code in console */
  static CompileCode(api: ApiService, callback: () => void) {
    const toSend = {}; // Json Which needs to be Send for compilation
    const nameMap = {}; // Create a Mapping id => Arduino

    // Check if there is any Programmable Device
    const isProgrammable = window.scope.ArduinoUno.length > 0;

    if (!isProgrammable) {
      window.printConsole('No Programmable Device Found', ConsoleType.INFO);
      Workspace.startArduino();
      callback();
      return;
    }

    for (const arduino of window.scope.ArduinoUno) {
      toSend[arduino.id] = arduino.code;
      nameMap[arduino.id] = arduino;
    }

    window.printConsole('Compiling Source Code', ConsoleType.INFO);

    api.compileCode(toSend).subscribe(v => {
      const taskid = v.uuid; // Get Compilation id

      const temp = setInterval(() => {
        api.getHex(taskid).subscribe(hex => {
          if (hex.state === 'SUCCESS' && !hex.details.error) {
            clearInterval(temp);
            let SUCCESS = true;
            for (const k in hex.details) {
              if (hex.details[k]) {
                const d = hex.details[k];
                window.printConsole('For Arduino ' + nameMap[k].name, ConsoleType.INFO);
                if (d.output && d.data) {
                  window.printConsole(d.output, ConsoleType.OUTPUT);
                  nameMap[k].hex = d.data;
                }
                if (d.error) {
                  SUCCESS = false;
                  window.printConsole(d.error, ConsoleType.ERROR);
                }
              }
            }
            if (SUCCESS) {
              Workspace.startArduino();
            }
            callback();
          } else if (hex.state === 'FAILED' || hex.details.error) {
            clearInterval(temp);
            window.printConsole('Failed To Compile: Server Error', ConsoleType.ERROR);
            callback();
          }
        });
      }, 2000);
    }, error => {
      window.printConsole('Error While Compiling the Source Code.', ConsoleType.ERROR);
      console.log(error);
      callback();
    });

  }
  /**
   * Start Simulation
   */
  static startArduino() {
    // Assign id
    let gid = 0;
    for (const wire of window.scope.wires) {
      if (wire.start) {
        wire.start.gid = gid++;
      }
      if (wire.end) {
        wire.end.gid = gid++;
      }
    }
    // Sequence to be followed while calling initSimulation
    const seqn = ['output', 'general', 'controllers', 'drivers', 'power', 'input', 'misc'];
    // For each component call initsimulation function
    for (const key of seqn) {
      for (const items of Utils.componentBox[key]) {
        for (const item of items) {
          if (window.scope[item]) {
            for (const ele of window.scope[item]) {
              if (ele.initSimulation) {
                ele.initSimulation();
              }
            }
          }
        }
      }
    }

    // // Call init simulation
    // for (const key in window.scope) {
    //   if (window.scope[key] && key !== 'ArduinoUno') {
    //     for (const ele of window.scope[key]) {
    //       if (ele.initSimulation) {
    //         ele.initSimulation();
    //       }
    //     }
    //   }
    // }

    // for (const comp of window.scope.ArduinoUno) {
    //   // comp.runner.execute();
    //   // console.log('s')
    //   comp.initSimulation();
    // }

    // Update the simulation status
    Workspace.simulating = true;
  }
  /**
   * Function called when StopSimulation button is triggered
   * @param callback Callback when simulation is stopped
   */
  static stopSimulation(callback: () => void) {
    if (!Workspace.simulating) {
      callback();
      return;
    }
    // Remove id
    for (const wire of window.scope.wires) {
      if (wire.start) {
        wire.start.value = -1;
      }
      if (wire.end) {
        wire.end.value = -1;
      }
    }
    // Call stop simulation
    for (const key in window.scope) {
      if (window.scope[key]) {
        for (const ele of window.scope[key]) {
          if (ele.closeSimulation) {
            ele.closeSimulation();
          }
        }
      }
    }
    // Update state and call callback
    Workspace.simulating = false;
    callback();
  }
  /**
   * Function to clear the workspace
   */
  static ClearWorkspace() {
    // Show Loading animation
    window.showLoading();

    // Remove each component fron the DOM
    for (const key in window.scope) {
      if (key in window.scope && window.scope[key].length > 0) {
        for (const item of window.scope[key]) {
          // window.Selected = item;
          // this.DeleteComponent();
          item.remove();
          Workspace.removeMeta(item);
        }
        // Clear the scope
        window.scope[key] = [];
      }
    }

    window.Selected = null;
    window.isSelected = false;
    // Reinitialize variables
    Workspace.initalizeGlobalVariables(window['canvas']);
    // Hide Property box
    window.hideProperties();
    // Hide Loading animation
    window.hideLoading();
  }


  /**
 * Function generates a JSON object containing all details of the workspace and downloads it
 * @param name string
 * @param description string
 */
  static SaveJson(name: string = '', description: string = '') {

    let id = Date.now();

    // Default Save object
    const saveObj = {
      id,
      canvas: {
        x: Workspace.translateX,
        y: Workspace.translateY,
        scale: Workspace.scale
      },
      project: {
        name,
        description,
        created_at: Date.now(),
      }
    };

    // For each item in the scope
    for (const key in window.scope) {
      // if atleast one component is present
      if (window.scope[key] && window.scope[key].length > 0) {
        saveObj[key] = [];
        // Add the component to the save object
        for (const item of window.scope[key]) {
          if (item.save) {
            saveObj[key].push(item.save());
          }
        }
      }
    }

    // Export JSON File & Download it
    const filename = `${name}.json`;
    const jsonStr = JSON.stringify(saveObj);

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    return true;

  }

  /**
   * Function to return if workspace is empty or not
   * @returns 'False' if workspace is not empty & 'True' if workspace is empty
   */
  static checkIfWorkspaceEmpty() {
    for (const key in window.scope) {
      if (window.scope[key].length > 0)
        return false;
    }
    return true;
  }

}
