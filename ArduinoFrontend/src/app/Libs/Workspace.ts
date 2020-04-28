
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
      mousedown: false
    };
  }

  static initProperty(toggle) {
    // Global Function to Show Properties of Circuit Component
    window['showProperty'] = (callback: any) => {
      // TODO: Buisness Logic
      toggle();
    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {
      toggle();
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

  }

  static dragOver(event: DragEvent) {

  }

  static drop(event: DragEvent) {

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
}
