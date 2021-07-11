import { Utils } from './Utils';
import { Workspace } from './Workspace';
import { isNull } from 'util';

declare var window;

/**
 * Abstract Class UndoUtils
 * Inherited to implement Undo & Redo Functionality
 */
export abstract class UndoUtils {

    /**
     * Boolean to disable undo/redo buttons for some time until circuit is loading
     */
    static enableButtonsBool = true;
    /**
     * Undo Stack
     */
    static undo = [];
    /**
     * Redo Stack
     */
    static redo = [];

    /**
     * Call this function to Undo
     */
    static workspaceUndo() {
        if (this.undo.length > 0) {
            const cng = this.undo.pop();
            this.loadChange(cng, 'undo');
        }
    }

    /**
     * Call this function to Redo
     */
    static workspaceRedo() {
        if (this.redo.length > 0) {
            const cng = this.redo.pop();
            this.loadChange(cng, 'redo');
        }
    }

    /**
     * Function to reset redo stack & push into undo stack
     * @param ele event snapshot
     */
    static pushChangeToUndoAndReset(ele) {

        // Empty Redo Stack
        this.redo = [];

        // This is used to save wires connected to element in case of delete event only
        if (ele.event === 'delete') {
            let step = 0;
            const grup = window.scope[ele.keyName];
            const temp = this.getExistingWindowElement(grup, ele);
            for (const e in temp.nodes) {
                if (temp.nodes[e].connectedTo) {
                    const wire = temp.nodes[e].connectedTo;
                    UndoUtils.pushChangeToUndo({ keyName: wire.keyName, element: wire.save(), event: 'delete' });
                    step += 1;
                }
            }
            ele.step = step;
            this.undo.push(ele);
            return;
        }
        // If not delete continue to normal Undo Process
        this.pushChangeToUndo(ele);
    }

    /**
     * Function to push into redo stack
     * @param ele event snapshot
     */
    static pushChangeToRedo(ele) {
        this.redo.push(ele);
    }

    /**
     * Function to push into undo stack
     * @param ele event snapshot
     */
    static pushChangeToUndo(ele) {
        // This is used to save wires connected to element in case of delete event only
        if (ele.event === 'delete') {
            let step = 0;
            const grup = window.scope[ele.keyName];
            const temp = this.getExistingWindowElement(grup, ele);
            for (const e in temp.nodes) {
                if (temp.nodes[e].connectedTo) {
                    const wire = temp.nodes[e].connectedTo;
                    UndoUtils.pushChangeToUndo({ keyName: wire.keyName, element: wire.save(), event: 'delete' });
                    step += 1;
                }
            }
            ele.step = step;
        }
        // Push to Undo stack
        this.undo.push(ele);
    }

    /**
     * Load The Changes, Called after Undo and redo operation to process the event snapshot
     * @param ele event snapshot
     * @param operation undo/redo
     */
    static async loadChange(ele, operation) {
        // All elements in window.scope with similar
        const grup = window.scope[ele.keyName];

        // Check if dragJson is present, & jump to next operation if both dx & dy are 0
        if (ele.dragJson) {
            if (ele.dragJson.dx === 0 && ele.dragJson.dy === 0) {
                if (operation === 'undo') {
                    this.workspaceUndo();
                } else if (operation === 'redo') {
                    this.workspaceRedo();
                }
                return;
            }
        }

        // handle Delete events
        if (operation === 'undo' && ele.event === 'delete') {
            UndoUtils.createElement(ele).then(res => {
                // if (ele.keyName === 'BreadBoard') {
                //     window['DragListeners'] = [];
                //     window['DragStopListeners'] = [];
                // }
                for (let i = 0; i < ele.step; i++) {
                    const chg = this.undo.pop();
                    UndoUtils.createElement(chg);
                }
                UndoUtils.pushChangeToRedo({ keyName: ele.keyName, element: ele.element, event: ele.event, step: ele.step });
            });
            return;
        } else if (operation === 'redo' && ele.event === 'delete') {
            const temp = this.getExistingWindowElement(grup, ele);
            window['Selected'] = temp;
            Workspace.DeleteComponent(false);
            return;
        }

        // handle auto-layout of wires
        if (ele.event === 'layout' && operation === 'undo') {
            const existing = this.getExistingWindowElement(grup, ele);
            UndoUtils.pushChangeToRedo({ keyName: existing.keyName, element: existing.save(), event: ele.event, step: ele.step });
            UndoUtils.removeElement(ele).then(res => {
                UndoUtils.createElement(ele).then(result => {
                    for (let i = 0; i < ele.step - 1; i++) {
                        const chg = this.undo.pop();
                        const innerExisting = this.getExistingWindowElement(grup, chg);
                        const obj = { keyName: innerExisting.keyName, element: innerExisting.save(), event: chg.event, step: chg.step };
                        UndoUtils.pushChangeToRedo(obj);
                        UndoUtils.removeElement(chg).then(ress => {
                            UndoUtils.createElement(chg);
                        });
                    }
                });
            });
            return;
        } else if (ele.event === 'layout' && operation === 'redo') {
            const existing = this.getExistingWindowElement(grup, ele);
            UndoUtils.pushChangeToUndo({ keyName: existing.keyName, element: existing.save(), event: ele.event, step: ele.step });
            UndoUtils.removeElement(ele).then(res => {
                UndoUtils.createElement(ele).then(result => {
                    for (let i = 0; i < ele.step - 1; i++) {
                        const chg = this.redo.pop();
                        const innerExisting = this.getExistingWindowElement(grup, chg);
                        const obj = { keyName: innerExisting.keyName, element: innerExisting.save(), event: chg.event, step: chg.step };
                        UndoUtils.pushChangeToUndo(obj);
                        UndoUtils.removeElement(chg).then(ress => {
                            UndoUtils.createElement(chg);
                        });
                    }
                });
            });
        }

        if (ele.event === 'breadDrag' && operation === 'undo') {
            UndoUtils.removeElement(ele).then(res => {
                UndoUtils.workspaceUndo();
            });
            return;
        }

        // handle Wire change events like add & color change
        if (ele.event === 'add' && operation === 'redo' && ele.keyName === 'wires') {
            UndoUtils.pushChangeToUndo(ele);
            UndoUtils.createElement(ele);
            return;
        } else if (ele.event === 'add' && operation === 'undo' && ele.keyName === 'wires') {
            UndoUtils.pushChangeToRedo(ele);
            UndoUtils.removeElement(ele);
            return;
        } else if (ele.event === 'wire_color' && operation === 'undo' && ele.keyName === 'wires') {
            const temp = this.getExistingWindowElement(grup, ele);
            UndoUtils.pushChangeToRedo({ keyName: ele.keyName, element: temp.save(), event: ele.event });
            temp.setColor(ele.element.color);
            return;
        } else if (ele.event === 'wire_color' && operation === 'redo' && ele.keyName === 'wires') {
            const temp = this.getExistingWindowElement(grup, ele);
            UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: temp.save(), event: ele.event });
            temp.setColor(ele.element.color);
            return;
        }

        // Only trigger if there is nothing in scope | is empty
        if (grup.length <= 0) {
            window['scope'][ele.keyName] = [];
            if (ele.event === 'add' && operation === 'redo') {
                UndoUtils.createElement(ele).then(done => {
                    if (ele.keyName === 'BreadBoard') {
                        // window['DragListeners'].splice(0, 1)
                        // window['DragStopListeners'].splice(0, 1)
                    }
                });
                UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: window.scope[ele.keyName][0].save(), event: ele.event });
            }
        }

        // Trigger if window.scope is not empty
        for (const e in grup) {
            if (grup[e].id === ele.element.id) {
                if (window.scope[ele.keyName][e].load) {
                    // Push to Undo/Redo stack
                    if (operation === 'undo') {
                        const obj = {
                            keyName: ele.keyName,
                            element: window.scope[ele.keyName][e].save(),
                            event: ele.event,
                            dragJson: ele.dragJson
                        };
                        UndoUtils.pushChangeToRedo(obj);
                    } else if (operation === 'redo') {
                        const obj = {
                            keyName: ele.keyName,
                            element: window.scope[ele.keyName][e].save(),
                            event: ele.event,
                            dragJson: ele.dragJson
                        };
                        UndoUtils.pushChangeToUndo(obj);
                    }
                    // handle Add events
                    if (ele.event === 'add' && operation === 'undo') {
                        UndoUtils.removeElement(ele);
                        return;
                    } else if (ele.event === 'add' && operation === 'redo') {
                        UndoUtils.createElement(ele);
                        UndoUtils.removeElement(ele);
                    } else if (ele.event === 'drag') {
                        // TODO: handle element Drag events
                        const existing = this.getExistingWindowElement(grup, ele);
                        if (operation === 'undo') {
                            if (ele.keyName === 'BreadBoard') {
                                existing.transformBoardPosition(-ele.dragJson.dx, -ele.dragJson.dy);
                            } else {
                                existing.transformPosition(-ele.dragJson.dx, -ele.dragJson.dy);
                            }
                        } else {
                            existing.transformPosition(ele.dragJson.dx, ele.dragJson.dy);
                            if (ele.keyName !== 'BreadBoard') {
                                Workspace.onDragEvent(existing);
                                Workspace.onDragStopEvent(existing);
                            }
                        }
                        for (const ec in window.scope['wires']) {
                            if (window.scope['wires'].hasOwnProperty(ec)) {
                                window.scope['wires'][ec].update();
                            }
                        }
                    } else {
                        // TODO: Handle all other events which weren't handled before
                        // Create Element with dump of ele
                        UndoUtils.createElement(ele).then(createdEle => {
                            // Remove existing Element
                            UndoUtils.removeElement(ele).then(done => {
                                // Remove drag listeners if element is a breadboard
                                if (ele.keyName === 'BreadBoard') {
                                    // window['DragListeners'].splice(0, 1)
                                    // window['DragStopListeners'].splice(0, 1)
                                }
                            });
                        });
                    }

                }
            }
        }
    }

    /**
     * Used to get the existing element in window.scope
     * @param grup window.scope['element_name']
     * @param ele event snapshot
     * @returns already present element in window.scope
     */
    static getExistingWindowElement(grup, ele) {
        for (const e in grup) {
            if (grup[e].id === ele.element.id) {
                if (window.scope[ele.keyName][e].load) {
                    return window.scope[ele.keyName][e];
                }
            }
        }
    }

    /**
     * create element again using its snapshot
     * @param ele element snapshot
     * @returns Promise
     */
    static createElement(ele) {
        return new Promise((resolve, reject) => {
            window.queue = 0;

            const comp = ele.element;
            const key = ele.keyName;

            if (key === 'wires') {
                Workspace.LoadWires([ele.element], true, true);
                // resolve
                resolve(true);
            }

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
            // Wait until all components are drawn
            const interval = setInterval(() => {
                if (window.queue === 0) {
                    clearInterval(interval);
                    // resolve when done
                    resolve(obj);
                    // Hide loading animation
                } else {
                    // resolve anyways
                    // resolve(obj)
                }
            }, 100);

        });
    }

    /**
     * Remove and element from workspace using linear search
     * @param key Key of elements to delete
     * @param uid Id of element to delete
     * @returns Promise
     */
    static removeElement(ele) {
        return new Promise((resolve, reject) => {
            const key = ele.keyName;
            const uid = ele.element.id;
            // get existing element that is to be removed
            const toRem = this.getExistingWindowElement(window.scope[key], ele);

            // If Current Selected item is a Wire which is not Connected from both end
            if (key === 'wires') {
                if (isNull(ele.element.end)) {
                    // Remove and deselect
                    toRem.remove();
                }
                // make selected variables null
                window.Selected = null;
                window.isSelected = false;
            }
            // If BreadBoard remove draglistners too
            if (key === 'BreadBoard') {
                for (const i in window['DragListeners']) {
                    if (window['DragListeners'].hasOwnProperty(i)) {
                        const itrFn = window['DragListeners'][i];
                        if (itrFn.id === toRem.id) {
                            window['DragListeners'].splice(i, 1);
                        }
                    }
                }
                for (const i in window['DragStopListeners']) {
                    if (window['DragStopListeners'].hasOwnProperty(i)) {
                        const itrFn = window['DragStopListeners'][i];
                        if (itrFn.id === toRem.id) {
                            window['DragStopListeners'].splice(i, 1);
                        }
                    }
                }
            }

            // get the component keyname
            const items = window.scope[key];

            // Use linear search find the element
            for (let i = 0; i < items.length; ++i) {
                if (items[i].id === uid) {
                    // remove from DOM
                    items[i].remove();
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
            window.hideProperties();
            resolve(true);
        });
    }

}
