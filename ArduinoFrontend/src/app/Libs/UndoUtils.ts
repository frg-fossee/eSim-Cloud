import { Utils } from "./Utils";
import { Workspace } from "./Workspace";

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
     * Function for Undo Feature
     */
    static workspaceUndo() {
        // If dump is already present in undoStack
        if (this.undoStack.length > 0) {
            // Push the current dump of workspace in RedoStack
            this.redoStack.push(this.getWorkspaceSaveChange())
            // Pop from undoStack & Load Dump
            this.LoadDump(this.undoStack.pop())
        }
    }

    /**
     * Function for Redo Feature
     */
    static workspaceRedo() {
        // If dump is already present in redoStack
        if (this.redoStack.length > 0) {
            // Push into Undo Stack
            this.undoStack.push(UndoUtils.getWorkspaceSaveChange())
            // Pop from redoStack & Load Dump
            this.LoadDump(this.redoStack.pop())
        }
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

}