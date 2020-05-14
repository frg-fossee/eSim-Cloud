import mxGraphFactory from "mxgraph";
import comp1 from "../../../static/CircuitComp/4002_1_A.svg";

const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
  mxPoint,
  mxDragSource,
} = new mxGraphFactory();

export default function AddSideBarComponent(graph,sidebar,img) {
  sidebar.appendChild(img)
  var graphF = function (evt) {
    var x = mxEvent.getClientX(evt);
    var y = mxEvent.getClientY(evt);
    var elt = document.elementFromPoint(x, y);
    if (mxUtils.isAncestorNode(graph.container, elt)) {
      return graph;
    }
    return null;
  };
  var funct = function (graph, evt, target, x, y) {
    var parent = graph.getDefaultParent();
    var model = graph.getModel();

    var v1 = null;

    model.beginUpdate();
    try {
      // NOTE: For non-HTML labels the image must be displayed via the style
      // rather than the label markup, so use 'image=' + image for the style.
      // as follows: v1 = graph.insertVertex(parent, null, label,
      // pt.x, pt.y, 120, 120, 'image=' + image);
      v1 = graph.insertVertex(
        parent,
        null,
        "",
        x,
        y,
        100,
        100,
        "shape=image;image=" + comp1 + ";"
      );
      v1.setConnectable(false);

    
    } finally {
      model.endUpdate();
    }

    graph.setSelectionCell(v1);
  };

  // Creates a DOM node that acts as the drag source
 

  // Disables built-in DnD in IE (this is needed for cross-frame DnD, see below)
  if (mxClient.IS_IE) {
    mxEvent.addListener(img, "dragstart", function (evt) {
      evt.returnValue = false;
    });
  }

  // Creates the element that is being for the actual preview.
  var dragElt = document.createElement("div");
  dragElt.style.border = "dashed black 1px";
  dragElt.style.width = "120px";
  dragElt.style.height = "40px";

  // Drag source is configured to use dragElt for preview and as drag icon
  // if scalePreview (last) argument is true. Dx and dy are null to force
  // the use of the defaults. Note that dx and dy are only used for the
  // drag icon but not for the preview.
  var ds = mxUtils.makeDraggable(
    img,
    graphF,
    funct,
    dragElt,
    null,
    null,
    graph.autoscroll,
    true
  );

  // Redirects feature to global switch. Note that this feature should only be used
  // if the the x and y arguments are used in funct to insert the cell.
  ds.isGuidesEnabled = function () {
    return graph.graphHandler.guidesEnabled;
  };

  ds.createDragElement = mxDragSource.prototype.createDragElement;


}