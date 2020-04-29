import { Utils } from './Utils';

export class Workspace {
  // TODO: Add Comments

  static minMax(min: number, max: number, value: number) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  static initalizeGlobalVariables() {
    // Stores all the Circuit Information
    window['scope'] = {
    };
    for (const key in Utils.components) {
      if (window['scope'][key] === null || window['scope'][key] === undefined) {
        window['scope'][key] = [];
      }
    }
    // True when simulation takes place
    window['isSimulating'] = false;
    // Stores the reference to the selected circuit component
    window['selected'] = null;
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
  }

  static initProperty(toggle) {
    // Global Function to Show Properties of Circuit Component
    window['showProperty'] = (callback: any) => {
      const data = callback();
      window['property_box'].title.innerText = data.title;
      window['property_box'].body.innerHTML = '';
      window['property_box'].body.appendChild(data.body);
      toggle(false);
    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {
      window['property_box'].title.innerText = 'Project Info';
      toggle(true);
    };
  }

  static initializeGlobalFunctions() {
    // Global Function to show Popup Bubble
    window['showBubble'] = (label: string, x: number, y: number) => {

    };
    // Global Function to hide Popub Bubble
    window['hideBubble'] = () => {

    };
    // Global Function to show Toast Message
    window['showToast'] = (message: string) => {

    };
  }
  /**
   * Event Listener for mousemove on html body
   * @param event Mouse Event
   */
  static bodyMouseMove(event: MouseEvent) {
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
    window['property_box'].start = false;
  }

  static mouseDown(event: MouseEvent) {

  }

  static click(event: MouseEvent) {
    window['hideProperties']();
  }

  static mouseMove(event: MouseEvent) {

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

  static mouseUp(event: MouseEvent) {

  }

  static contextMenu(event: MouseEvent) {
    event.preventDefault();
    return false;
  }

  static copy(event: ClipboardEvent) {

  }

  static cut(event: ClipboardEvent) {

  }

  static doubleClick(event: MouseEvent) {

  }

  static dragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  static dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  static drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const bbox = (event.target as HTMLElement).getBoundingClientRect();
    const className = event.dataTransfer.getData('text'); // get the event data
    Workspace.addComponent(className, event.clientX, event.clientY, bbox.left, bbox.top);
  }

  static keyDown(event: KeyboardEvent) {

  }
  static keyPress(event: KeyboardEvent) {

  }
  static keyUp(event: KeyboardEvent) {

  }
  static mouseWheel(event: WheelEvent) {

  }
  static paste(event: ClipboardEvent) {

  }

  static addComponent(classString: string, x: number, y: number, offsetX: number, offsetY: number) {
    const myClass = Utils.components[classString].className;
    const obj = new myClass(
      window['canvas'],
      x - offsetX,
      y - offsetY
    );
    window['scope'][classString].push(obj);
  }
}
