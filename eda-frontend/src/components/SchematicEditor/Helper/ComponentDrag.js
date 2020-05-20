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
  mxOutline,
  mxPrintPreview,
  mxConstants,
  mxRectangle
} = new mxGraphFactory()

export default function LoadGrid (container, sidebar, outline) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false)
  } else {
    // Disables the built-in context menu
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
    // Creates the graph inside the given container

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
    mxUtils.write(button, 'ERC')

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
      var list = graph.getModel().cells // mapping the grid
      var vertexCount = 0
      var errorCount = 0
      for (var property in list) {
        var cell = list[property]
        if (cell.Component === true) {
          // console.log(cell.CellType)
          for (var child in cell.children) {
            console.log(cell.children[child])
            var childVertex = cell.children[child]
            if (childVertex.Pin === true && childVertex.edges === null) {
              // console.log('Wires not Connected')
              alert('Wires not connected')
              ++errorCount
            }
          }
          ++vertexCount
        }
        // Setting a rule check that only input and output ports can be connected
        if (cell.edge === true) {
          if ((cell.source.pinType === 'Input' && cell.source.pinType === 'Output') || (cell.source.pinType === 'Output' && cell.target.pinType === 'Input' )) {
            console.log('Wire Information')
            console.log('source : Pin' + cell.source.PinNumber + ' ' + cell.source.pinType + ' of ' + cell.source.ParentComponent.style)
            console.log('taget : Pin' + cell.target.PinNumber + ' ' + cell.target.pinType + ' of ' + cell.source.ParentComponent.style)
          } else {
            // Automatically remove wire if same pintype are connected
            /* cell.source.removeFromTerminal(true)
            cell.target.removeFromTerminal(false) */
            graph.setSelectionCell(cell)
            alert('Same pintypes are connected together')
            ++errorCount
          }
        }
      }
      if (vertexCount === 0) {
        alert('No Component added')
        ++errorCount
      }
      if (errorCount === 0) {
        alert('ERC Check completed')
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

export function ZoomAct () {
  graph.zoomActual()
}

export function DeleteComp () {
  graph.removeCells()
}

export function PrintPreview () {
  // Matches actual printer paper size and avoids blank pages
  var scale = 0.8
  var headerSize = 50
  var footerSize = 50

  // Applies scale to page
  var pf = mxRectangle.fromRectangle(graph.pageFormat || mxConstants.PAGE_FORMAT_A4_PORTRAIT)
  pf.width = Math.round(pf.width * scale * graph.pageScale)
  pf.height = Math.round(pf.height * scale * graph.pageScale)

  // Finds top left corner of top left page
  var bounds = mxRectangle.fromRectangle(graph.getGraphBounds())
  bounds.x -= graph.view.translate.x * graph.view.scale
  bounds.y -= graph.view.translate.y * graph.view.scale

  var x0 = Math.floor(bounds.x / pf.width) * pf.width
  var y0 = Math.floor(bounds.y / pf.height) * pf.height

  var preview = new mxPrintPreview(graph, scale, pf, 0, -x0, -y0)
  preview.marginTop = headerSize * scale * graph.pageScale
  preview.marginBottom = footerSize * scale * graph.pageScale
  preview.autoOrigin = false

  var oldRenderPage = preview.renderPage
  preview.renderPage = function (w, h, x, y, content, pageNumber) {
    var div = oldRenderPage.apply(this, arguments)

    var header = document.createElement('div')
    header.style.position = 'absolute'
    header.style.boxSizing = 'border-box'
    header.style.fontFamily = 'Arial,Helvetica'
    header.style.height = (this.marginTop - 10) + 'px'
    header.style.textAlign = 'center'
    header.style.verticalAlign = 'middle'
    header.style.marginTop = 'auto'
    header.style.fontSize = '12px'
    header.style.width = '100%'
    header.style.fontWeight = '100'

    // Vertical centering for text in header/footer
    header.style.lineHeight = (this.marginTop - 10) + 'px'

    var footer = header.cloneNode(true)

    mxUtils.write(header, 'Untitled_Schematic ' + pageNumber + ' - EDA Cloud')
    header.style.borderBottom = '1px solid gray'
    header.style.top = '0px'

    mxUtils.write(footer, 'Made with Schematic Editor - EDA Cloud')
    footer.style.borderTop = '1px solid gray'
    footer.style.bottom = '0px'

    div.firstChild.appendChild(footer)
    div.firstChild.appendChild(header)

    return div
  }

  preview.open()
}
