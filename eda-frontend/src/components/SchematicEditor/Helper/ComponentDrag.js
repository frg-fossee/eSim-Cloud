import mxGraphFactory from "mxgraph";
import comp1 from "../../../static/CircuitComp/U-4001-1:A.svg";
import comp2 from "../../../static/CircuitComp/U-4011-1:B.svg";
import comp3 from "../../../static/CircuitComp/U-4051-1:A.svg";
import AddSideBarComponent from "./SideBar.js"
import WireConfigFunct from "./WireConfig.js"
import EdgeWireFunct from "./EdgeWire.js"
var paths=[comp1,comp2,comp3];


const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
} = new mxGraphFactory();

export default function LoadGrid(container, sidebar) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error("Browser is not supported!", 200, false);
  } else {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);

    // Creates the graph inside the given container
    var graph = new mxGraph(container);

    // Enables rubberband selection
    new mxRubberband(graph);
    WireConfigFunct(graph);
    EdgeWireFunct();

  }
  for(var i=0;i<paths.length;i++){
    AddSideBarComponent(graph,sidebar,paths[i]); //Adds the component to the sidebar and makes it draggable
  }
  
}
