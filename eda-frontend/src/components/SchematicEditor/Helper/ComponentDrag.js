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
var graph

const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
  mxOutline
} = new mxGraphFactory()

export default function LoadGrid (container, sidebar, outline) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false)
  } else {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container)

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
      var vertexCount = 0
      for (var property in list) {
        // eslint-disable-next-line no-undef
        
        var cell = list[property]
        if(cell.vertex === true && cell.parent.value === undefined){
            ++vertexCount
            console.log(cell)
            for(var child in cell.children){
              console.log(cell.children[child])
              var childcurrent = cell.children[child]
              if(childcurrent.vertex === true){
                if(childcurrent.edges === null){
                  alert("Wires not connected")
                  break
                }
              }
            }
          }
        if(cell.edge === true){
          if(cell.target != null && cell.source != null){
          console.log("Wire Information")
          console.log("Source:"+cell.source.id)
          console.log("Target:"+cell.target.id)
          }
        }
        
         
      }
      if (vertexCount === 0) {
        alert('No componenet added')
      }
    })
    NetlistInfoFunct(graph)
  }
}

export function ZoomIn () {
  graph.zoomIn()
}

export function ZoomOut () {
  graph.zoomOut()
}

export function DeleteComp () {
  graph.removeCells()
}