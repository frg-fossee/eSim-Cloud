/* eslint-disable no-inner-declarations */
/* eslint-disable no-new */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'
import * as actions from '../../../redux/actions/actions'
import store from '../../../redux/store'

import WireConfigFunct from './WireConfig.js'
import EdgeWireFunct from './EdgeWire.js'
import ClipBoardFunct from './ClipBoard.js'
import NetlistInfoFunct from './NetlistInfo.js'
import ToolbarTools from './ToolbarTools.js'
import KeyboardShorcuts from './KeyboardShorcuts.js'
import { SideBar } from './SideBar.js'

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
    mxCell.prototype.PinName = ''
    mxCell.prototype.CompObject = null
    mxCell.prototype.properties = {}

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

    graph.addListener(mxEvent.SINGLE_CLICK, function (sender, evt) {
      var cell = evt.getProperty('cell')
      // mxUtils.alert('Doubleclick: ' + ((cell != null) ? cell.symbol : 'Graph'))
      if (cell !== undefined && cell.CellType === 'Component') {
        store.dispatch({
          type: actions.GET_COMP_PROPERTIES,
          payload: {
            id: cell.id,
            compProperties: cell.properties
          }
        })
      } else if (cell !== undefined && cell.CellType === 'This is where you say what the vertex is') {
        store.dispatch({
          type: actions.CLOSE_COMP_PROPERTIES
        })
      }
      evt.consume()
    })

    SideBar(graph, sidebar)
    KeyboardShorcuts(graph)
    WireConfigFunct(graph)
    EdgeWireFunct()
    ClipBoardFunct(graph)
    NetlistInfoFunct(graph)
    ToolbarTools(graph)

    store.subscribe(() => {
      var id = store.getState().componentPropertiesReducer.id
      var props = store.getState().componentPropertiesReducer.compProperties
      var cellList = graph.getModel().cells
      var c = cellList[id]
      if (c !== undefined) {
        c.properties = props
      }
    })

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
