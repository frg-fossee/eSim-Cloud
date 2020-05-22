/* eslint-disable no-new */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'
import comp1 from '../../../static/CircuitComp/V-VSOURCE-1_A.svg'
import comp2 from '../../../static/CircuitComp/R-R-1_A.svg'
import comp3 from '../../../static/CircuitComp/C-CAP-1_A.svg'
import comp4 from '../../../static/CircuitComp/U-4001-1_A.svg'
import comp5 from '../../../static/CircuitComp/U-4011-1_B.svg'
import comp6 from '../../../static/CircuitComp/U-4051-1_A.svg'
import comp7 from '../../../static/CircuitComp/GND-0-1_A.svg'

import WireConfigFunct from './WireConfig.js'
import EdgeWireFunct from './EdgeWire.js'
import ClipBoardFunct from './ClipBoard.js'
import NetlistInfoFunct from './NetlistInfo.js'
import ToolbarTools from './ToolbarTools.js'
import KeyboardShorcuts from './KeyboardShorcuts.js'
import { SideBar, AddSidebarComponent } from './SideBar.js'
var paths = [comp1, comp2, comp3, comp4, comp5, comp6, comp7]
var graph

const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
  mxOutline,
  mxCell
} = new mxGraphFactory()

export default function LoadGrid (container, sidebar, outline) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false)
  } else {
    // Disables the built-in context men
    mxEvent.disableContextMenu(container)
    // Tells if the cell is a component or a pin or a wire
    mxCell.prototype.CellType = 'This is where you say what the vertex is'
    // Tells the magnitude of a resistor/capacitor
    mxCell.prototype.Magnitude = null
    // Tells whether the pin is input/output
    mxCell.prototype.pinType = ' '
    // Tells if the cell is component, Default is false
    mxCell.prototype.Component = false
    // Tells if the cell is pin, Default is false
    mxCell.prototype.Pin = false
    // Pin number of the component, default is 0
    mxCell.prototype.PinNumber = 0
    // Parent component of a pin, default is null
    mxCell.prototype.ParentComponent = null
    mxCell.prototype.symbol = null
    mxCell.prototype.node = mxCell.prototype.id

    // Creates the graph inside the given container
    graph = new mxGraph(container)

    // Enables rubberband selection
    new mxRubberband(graph)

    // Creates the outline (navigator, overview) for moving
    // around the graph in the top, right corner of the window.
    var outln = new mxOutline(graph, outline)
    // To show the images in the outline, uncomment the following code
    outln.outline.labelsVisible = true
    outln.outline.setHtmlLabels(true)

    graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
      var cell = evt.getProperty('cell')
      mxUtils.alert('Doubleclick: ' + ((cell != null) ? cell.symbol : 'Graph'))
      console.log(cell.CellType)
      evt.consume()
    })

    SideBar(graph, sidebar)
    KeyboardShorcuts(graph)
    WireConfigFunct(graph)
    EdgeWireFunct()
    ClipBoardFunct(graph)
    NetlistInfoFunct(graph)
    ToolbarTools(graph)
    for (var i = 0; i < paths.length; i++) {
      AddSidebarComponent(paths[i]) // Adds the component to the sidebar and makes it draggable
      if (((i + 1) % 3 === 0)) {
        sidebar.appendChild(document.createElement('br'))
      }
    }

    // var state = mxCellState
    // graph.autoSizeCellsOnAdd = true
    // var view = graph.getView()
    // var style = graph.getStylesheet()
    // console.log(view.currentRoot)
    graph.getModel().beginUpdate()
    try {
    } finally {
      // Updates the display
      graph.getModel().endUpdate()
    }
  }
}
