/* eslint-disable no-inner-declarations */
/* eslint-disable no-new */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'

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
  mxCell,
  mxConstants,
  mxGraphModel
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

    graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
      var cell = evt.getProperty('cell')
      mxUtils.alert('Doubleclick: ' + ((cell != null) ? cell.symbol : 'Graph'))
      console.log(cell.properties)
      evt.consume()
    })

    SideBar(graph, sidebar)
    KeyboardShorcuts(graph)
    WireConfigFunct(graph)
    EdgeWireFunct()
    ClipBoardFunct(graph)
    NetlistInfoFunct(graph)
    ToolbarTools(graph)

    function updateStyle (state, hover) {
      if (hover) {
        state.style[mxConstants.STYLE_FILLCOLOR] = '#ff0000'
      }

      // Sets rounded style for both cases since the rounded style
      // is not set in the default style and is therefore inherited
      // once it is set, whereas the above overrides the default value
      state.style[mxConstants.STYLE_ROUNDED] = (hover) ? '1' : '0'
      state.style[mxConstants.STYLE_STROKEWIDTH] = (hover) ? '4' : '1'
      state.style[mxConstants.STYLE_FONTSTYLE] = (hover) ? mxConstants.FONT_BOLD : '0'
    };

    // Changes fill color to red on mouseover
    graph.addMouseListener(
      {
        currentState: null,
        previousStyle: null,
        mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState)
            this.currentState = null
          }
        },
        mouseMove: function (sender, me) {
          if (this.currentState != null && me.getState() === this.currentState) {
            return
          }

          var tmp = graph.view.getState(me.getCell())

          // Ignores everything but vertices
          if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
            tmp = null
          }

          if (tmp !== this.currentState) {
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState)
            }

            this.currentState = tmp

            if (this.currentState !== null) {
              this.dragEnter(me.getEvent(), this.currentState)
            }
          }
        },
        mouseUp: function (sender, me) { },
        dragEnter: function (evt, state) {
          if (state != null) {
            this.previousStyle = state.style
            state.style = mxUtils.clone(state.style)
            updateStyle(state, true)
            state.shape.apply(state)
            state.shape.redraw()

            if (state.text != null) {
              state.text.apply(state)
              state.text.redraw()
            }
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            state.style = this.previousStyle
            updateStyle(state, false)
            state.shape.apply(state)
            state.shape.redraw()

            if (state.text != null) {
              state.text.apply(state)
              state.text.redraw()
            }
          }
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
