/* eslint-disable camelcase */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'

var graph
var undoManager

const {
  mxPrintPreview,
  mxConstants,
  mxRectangle,
  mxUtils,
  mxUndoManager,
  mxEvent
} = new mxGraphFactory()

export default function ToolbarTools (grid, unredo) {
  graph = grid

  undoManager = new mxUndoManager()
  var listener = function (sender, evt) {
    undoManager.undoableEditHappened(evt.getProperty('edit'))
  }
  graph.getModel().addListener(mxEvent.UNDO, listener)
  graph.getView().addListener(mxEvent.UNDO, listener)
}

// UNDO
export function Undo () {
  undoManager.undo()
}

// REDO
export function Redo () {
  undoManager.redo()
}

// Zoom IN
export function ZoomIn () {
  graph.zoomIn()
}

// ZOOM OUT
export function ZoomOut () {
  graph.zoomOut()
}

// ZOOM ACTUAL
export function ZoomAct () {
  graph.zoomActual()
}

// DELETE COMPONENT
export function DeleteComp () {
  graph.removeCells()
}

// ROTATE COMPONENT
export function Rotate () {
  var view = graph.getView()
  var cell = graph.getSelectionCell()
  var state = view.getState(cell, true)
  // console.log(state)
  var vHandler = graph.createVertexHandler(state)
  // console.log('Handler')
  // console.log(vHandler)
  vHandler.rotateCell(cell, 90, cell.getParent())
}

// PRINT PREVIEW OF SCHEMATIC
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

// ERC CHECK FOR SCHEMATIC
export function ErcCheck () {
  var list = graph.getModel().cells // mapping the grid
  var vertexCount = 0
  var errorCount = 0
  var PinNC = 0
  var stypes = 0
  for (var property in list) {
    var cell = list[property]
    if (cell.Component === true) {
      console.log(cell)
      cell.value = 'Checked'
      for (var child in cell.children) {
        console.log(cell.children[child])
        var childVertex = cell.children[child]
        if (childVertex.Pin === true && childVertex.edges === null) {
          graph.getSelectionCell(childVertex)
          ++PinNC
          ++errorCount
        }
      }
      ++vertexCount
    }
    // Setting a rule check that only input and output ports can be connected
    if (cell.edge === true) {
      // eslint-disable-next-line no-constant-condition
      if ((cell.source.pinType === 'Input' && cell.target.pinType === 'Input') || (cell.source.pinType === 'Output' && cell.target.pinType === 'Output')) {
        ++stypes
      } else {
        cell.value = 'Node Number : ' + cell.id
        console.log('Wire Information')
        console.log('source : Pin' + cell.source.PinNumber + ' ' + cell.source.pinType + ' of ' + cell.source.ParentComponent.style)
        console.log('taget : Pin' + cell.target.PinNumber + ' ' + cell.target.pinType + ' of ' + cell.source.ParentComponent.style)
      }
    }
  }
  if (vertexCount === 0) {
    alert('No Component added')
    ++errorCount
  } else if (PinNC !== 0) {
    alert('Pins not connected')
  } else if (stypes !== 0) {
    alert('Same pintypes connected')
  } else {
    if (errorCount === 0) {
      alert('ERC Check completed')
    }
  }
}

// GENERATE NETLIST
export function GenerateNetList () {
  /* var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getPrettyXml(node)
  return value */
  var r = 1
  var v = 1
  var c = 1
  var list = graph.getModel().cells
  // console.log('Untitled netlist'
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'G') {
      // k = ''
      // alert('Component is present')
      var component = list[property]
      // console.log(component)
      if (component.symbol === 'R') {
        k = k + component.symbol + r.toString()
        ++r
      } else if (component.symbol === 'V') {
        k = k + component.symbol + v.toString()
        ++v
      } else {
        c = c + component.symbol + c.toString()
        ++c
      }

      if (component.children !== null) {
        for (var child in component.children) {
          var pin = component.children[child]
          if (pin.vertex === true) {
            // alert(pin.id)
            if (pin.edges !== null || pin.edges.length !== 0) {
              for (var wire in pin.edges) {
                if (pin.edges[wire].source.ParentComponent.symbol === 'G' || pin.edges[wire].target.ParentComponent.symbol === 'G') {
                  // console.log('Found ground')
                  pin.edges[wire].node = 0
                  pin.edges[wire].value = 0
                  k = k + ' ' + pin.edges[wire].node
                } else {
                  // console.log(pin.edges[wire])
                  pin.edges[wire].node = pin.edges[wire].id
                  pin.edges[wire].value = pin.edges[wire].node
                  k = k + '  ' + pin.edges[wire].node
                }
              }
            }
          }
        }
      }
      if (component.symbol === 'R') {
        k = k + ' 1k'
      } else {
        k = k + ' 10'
      }
      // k = k + ' 10'
      k = k + ' \n'
      // console.log(k)
    }
  }
  k = k + '.op \n'
  k = k + '.end \n'
  return k
}
