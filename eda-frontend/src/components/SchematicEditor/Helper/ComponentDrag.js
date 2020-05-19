/* eslint-disable no-new */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'
import comp1 from '../../../static/CircuitComp/U-4001-1_A.svg'
import comp2 from '../../../static/CircuitComp/U-4011-1_B.svg'
import comp3 from '../../../static/CircuitComp/U-4051-1_A.svg'

import AddSideBarComponent from './SideBar.js'
import WireConfigFunct from './WireConfig.js'
import EdgeWireFunct from './EdgeWire.js'
import ClipBoardFunct from './ClipBoard.js'
import NetlistInfoFunct from './NetlistInfo.js'
var paths = [comp1, comp2, comp3]

const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent
} = new mxGraphFactory()

export default function LoadGrid (container, sidebar) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false)
  } else {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container)

    // Creates the graph inside the given container
    var graph = new mxGraph(container)

    // Enables rubberband selection


    new mxRubberband(graph)
    WireConfigFunct(graph)
    EdgeWireFunct()
    ClipBoardFunct(graph)
    var button = document.createElement('button')
    mxUtils.write(button, 'GridInfo')


    // graph.autoSizeCellsOnAdd = true
    var view = graph.getView()
    console.log(view.currentRoot)
    graph.getModel().beginUpdate()
    try {

    } finally {
    // Updates the display
      graph.getModel().endUpdate()
    }
    for (var i = 0; i < paths.length; i++) {
      AddSideBarComponent(graph, sidebar, paths[i]) // Adds the component to the sidebar and makes it draggable
    }
    sidebar.appendChild(button)
    mxEvent.addListener(button, 'click', function (evt) {
      var list = graph.getModel().cells
      // console.log(list)
      // eslint-disable-next-line no-undef
      for (var property in list) {
        // eslint-disable-next-line no-undef
        var vertexCount = 0
        var cell = list[property]
        if(cell.vertex === true)
          ++vertexCount
      }
      if(vertexCount === 0)
        alert('No componenet added')
    })
    NetlistInfoFunct(graph)
  }
}

