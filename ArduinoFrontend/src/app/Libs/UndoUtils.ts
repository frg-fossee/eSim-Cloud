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
     * Stack for Undo functionality
     */
    static undoStack = [];

    /**
     * Stack for Redo functionality
     */
    static redoStack = [];

    /**
     * Boolean to disable undo/redo buttons for some time until circuit is loading
     */
    static enableButtonsBool = true;

    /**
     * Process and return workspace dump
     * @returns Object consiting of Workspace items Dump
     */
    static getWorkspaceSaveChange() {

        // Default Save object
        const saveObj = {
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
        return saveObj;
    }

    /**
     * Empty RedoStack & push dump into undoStack
     */
    static pushWorkSpaceChange() {
        this.redoStack = []
        this.undoStack.push(this.getWorkspaceSaveChange())
    }

    /**
     * Import and Load Workspace state from a valid Dump
     * @param data Dump of WorkSpace to load from
     */
    static LoadDump(data) {
        // Disable undo & redo Buttons
        this.enableButtonsBool = false;

        Workspace.ClearWorkspace()

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

                // Renable undo & redo Buttons
                this.enableButtonsBool = true;

            }
        }, 100);
    }

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
        // // If dump is already present in undoStack
        // if (this.undoStack.length > 0) {
        //     // Push the current dump of workspace in RedoStack
        //     this.redoStack.push(this.getWorkspaceSaveChange())
        //     // Pop from undoStack & Load Dump
        //     this.LoadDump(this.undoStack.pop())
        // }
        if (this.undo.length > 0) {
            var cng = this.undo.pop()
            // this.redo.push(cng)
            this.loadChange(cng, 'undo')
        }
    }

    /**
     * Function for Redo Feature
     */
    static workspaceRedo() {
        // If dump is already present in redoStack
        // if (this.redoStack.length > 0) {
        //     // Push into Undo Stack
        //     this.undoStack.push(UndoUtils.getWorkspaceSaveChange())
        //     // Pop from redoStack & Load Dump
        //     this.LoadDump(this.redoStack.pop())
        // }
        if (this.redo.length > 0) {
            var cng = this.redo.pop()
            // this.undo.push(cng)
            this.loadChange(cng, 'redo')
        }
    }

    static pushChangeToUndoAndReset(ele) {
        this.redo = []
        this.pushChangeToUndo(ele)
    }

    static pushChangeToRedo(ele) {
        this.redo.push(ele)
        console.log('redo stack after -> ', this.redo)
    }

    static pushChangeToUndo(ele) {
        this.undo.push(ele);
        console.log('undo stack after -> ', this.undo)
    }

    /**
     * Load The Changes, Called after Undo and redo operation to add,delete new component
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
                UndoUtils.createElement(ele);
                UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: window.scope[ele.keyName][0].save(), event: ele.event })
            }
        }
        // Trigger if window.scope is empty
        for (const e in grup) {
            if (grup[e].id == ele.element.id) {
                if (window.scope[ele.keyName][e].load) {

                    if (operation == 'undo')
                        UndoUtils.pushChangeToRedo({ keyName: ele.keyName, element: window.scope[ele.keyName][e].save(), event: ele.event })

                    else if (operation == 'redo')
                        UndoUtils.pushChangeToUndo({ keyName: ele.keyName, element: window.scope[ele.keyName][e].save(), event: ele.event })

                    console.log(window.scope)
                    // UndoUtils.removeElement(ele)

                    if (ele.event == 'add' && operation == 'undo') {
                        UndoUtils.removeElement(ele)
                        return
                    }
                    else if (ele.event == 'add' && operation == 'redo') {
                        await UndoUtils.createElement(ele);
                        UndoUtils.removeElement(ele)
                    }
                    else {
                        console.log('works')
                        UndoUtils.createElement(ele).then(createdEle => {
                            // var existing = this.getExistingWindowElement(grup, ele);
                            // for (const e in existing.nodes) {
                            //     if (existing.nodes[e].connectedTo) {
                            //         console.log(' - ', createdEle)
                            //         let n1 = createdEle['nodes'][e]
                            //         // existing.nodes[e].connectedTo.connect(n1, true, true)
                            //         const wire = n1.startNewWire()
                            //         const ct = existing.nodes[e].connectedTo
                            //         if (ct.start.parent.id === ele.element.id) {
                            //             ct.end.connectWire(wire)
                            //         } else {
                            //             ct.start.connectWire(wire)
                            //         }

                            //     }
                            // }
                            UndoUtils.removeElement(ele)
                        })
                    }

                }
            }
        }
    }

    static getExistingWindowElement(grup, ele) {
        for (const e in grup) {
            if (grup[e].id == ele.element.id) {
                if (window.scope[ele.keyName][e].load) {
                    return window.scope[ele.keyName][e]
                }
            }
        }
    }

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
     */
    static removeElement(ele) {

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
    }

}