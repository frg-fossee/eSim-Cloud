import { Utils } from "./Utils";
import { Workspace } from "./Workspace";
import { isNull } from 'util';
import { Point } from "./Point";
import { Wire } from "./Wire";

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

    /** --------------------------------------------------------- */

    /**
     * Undo Stack
     */
    static undo = []

    /**
     * Redo Stack
    */
    static redo = []


    /**
     * Function for Undo Feature
     */
    static workspaceUndo() {
        if (this.undo.length > 0) {
            var cng = this.undo.pop();
            this.loadChange(cng, 'undo');
        }
    }

    /**
     * Function for Redo Feature
     */
    static workspaceRedo() {
        if (this.redo.length > 0) {
            var cng = this.redo.pop();
            this.loadChange(cng, 'redo');
        }
    }

    /**
     * Function to reset redo stack & push into undo stack
     * @param ele event snapshot
     */
    static pushChangeToUndoAndReset(ele) {
        this.redo = []
        this.pushChangeToUndo(ele)
    }

    /**
     * Function to push into redo stack
     * @param ele event snapshot
     */
    static pushChangeToRedo(ele) {
        this.redo.push(ele)
        console.log('redo stack after -> ', this.redo)
    }

    /**
     * Function to push into undo stack
     * @param ele event snapshot
     */
    static pushChangeToUndo(ele) {
        this.undo.push(ele);
        console.log('undo stack after -> ', this.undo)
    }

    /**
     * Load The Changes, Called after Undo and redo operation to process the event snapshot
     * @param ele event snapshot
     * @param operation undo/redo
     * @returns
     */
    static async loadChange(ele, operation) {

        var grup = window.scope[ele.keyName]
        let createdEle = null

        // Only trigger if wire
        if (ele.event == 'add' && operation == 'redo' && ele.keyName == 'wires') {
            UndoUtils.createElement(ele);
            return
        } else if (ele.event == 'wire_color' && operation == 'undo' && ele.keyName == 'wires') {
            const temp = this.getExistingWindowElement(grup, ele)
            UndoUtils.pushChangeToRedo({ keyName: ele.keyName, element: temp.save(), event: ele.event })
            temp.setColor(ele.element.color);
            return
        } else if (ele.event == 'wire_color' && operation == 'redo' && ele.keyName == 'wires') {
            const temp = this.getExistingWindowElement(grup, ele)
            UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: temp.save(), event: ele.event })
            temp.setColor(ele.element.color);
            return
        }

        // Only trigger if there is nothing in scope
        if (grup.length <= 0) {
            window['scope'][ele.keyName] = [];
            if (ele.event == 'add' && operation == 'redo') {
                UndoUtils.createElement(ele).then(done => {
                    if (ele.keyName === 'BreadBoard') {
                        window['DragListeners'] = [];
                        window['DragStopListeners'] = [];
                    }
                })
                UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: window.scope[ele.keyName][0].save(), event: ele.event })
            }
        }

        // Trigger if window.scope is empty
        for (const e in grup) {
            if (grup[e].id == ele.element.id) {
                if (window.scope[ele.keyName][e].load) {
                    if (operation == 'undo')
                        UndoUtils.pushChangeToRedo({ keyName: ele.keyName, element: window.scope[ele.keyName][e].save(), event: ele.event, dragJson: ele!.dragJson })

                    else if (operation == 'redo')
                        UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: window.scope[ele.keyName][e].save(), event: ele.event, dragJson: ele!.dragJson })

                    if (ele.event == 'add' && operation == 'undo') {
                        UndoUtils.removeElement(ele)
                        return
                    }
                    else if (ele.event == 'add' && operation == 'redo') {
                        UndoUtils.createElement(ele)
                        UndoUtils.removeElement(ele)
                    }
                    else if (ele.event == 'drag') {
                        var existing = this.getExistingWindowElement(grup, ele);
                        if (operation == 'undo') {
                            if (ele.keyName == 'BreadBoard')
                                existing.transformBoardPosition(-ele.dragJson.dx, -ele.dragJson.dy)
                            else
                                existing.transformPosition(-ele.dragJson.dx, -ele.dragJson.dy)
                        } else {
                            existing.transformPosition(ele.dragJson.dx, ele.dragJson.dy)
                        }
                        for (const e in window.scope['wires']) {
                            window.scope['wires'][e].update();
                        }
                    }
                    else {
                        UndoUtils.createElement(ele).then(createdEle => {
                            // var existing = this.getExistingWindowElement(grup, ele);
                            // for (const e in existing.nodes) {
                            //     if (existing.nodes[e].connectedTo) {
                            //         let n1 = createdEle['nodes'][e]
                            //         // existing.nodes[e].connectedTo.connect(n1, true, true)
                            //         const wire = n1.startNewWire()
                            //         const ct = existing.nodes[e].connectedTo
                            //         console.log(ct.start.parent.id === ele.element.id)
                            //         if (ct.start.parent.id === ele.element.id) {
                            //             console.log('if')
                            //             ct.end.connectWire(wire)
                            //         } else {
                            //             console.log('else')
                            //             ct.start.connectWire(wire)
                            //         }

                            //     }
                            // }
                            UndoUtils.removeElement(ele).then(done => {
                                if (ele.keyName === 'BreadBoard') {
                                    window['DragListeners'] = [];
                                    window['DragStopListeners'] = [];
                                }
                            })
                        })
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
            if (grup[e].id == ele.element.id) {
                if (window.scope[ele.keyName][e].load) {
                    return window.scope[ele.keyName][e]
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

            var comp = ele.element;
            var key = ele.keyName

            if (key == 'wires') {
                Workspace.LoadWires([ele.element])
                return
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
                    // start drawing wires
                    resolve(obj);
                    // Workspace.LoadWires(data.wires);
                    // Hide loading animation
                }
            }, 100);

        })
    }

    /**
     * Remove and element from workspace using linear search 
     * @param key Key of elements to delete
     * @param uid Id of element to delete
     * @returns Promise
     */
    static removeElement(ele) {
        return new Promise((resolve, reject) => {

            var key = ele.keyName
            var uid = ele.element.id
            var toRem = this.getExistingWindowElement(window.scope['key'], ele);

            // If Current Selected item is a Wire which is not Connected from both end
            if (key === 'wires') {
                if (isNull(ele.element.end)) {
                    // Remove and deselect
                    toRem.remove();
                }
                window.Selected = null;
                window.isSelected = false;
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
            resolve(true)
        })
    }

}