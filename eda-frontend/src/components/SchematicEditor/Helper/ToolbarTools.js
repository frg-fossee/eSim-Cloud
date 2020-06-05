/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'
import store from '../../../redux/store'
import * as actions from '../../../redux/actions/actions'
var graph
var undoManager

const {
  mxPrintPreview,
  mxConstants,
  mxRectangle,
  mxUtils,
  mxUndoManager,
  mxEvent,
  mxCodec,
  mxCell,
  mxMorphing,
  Graph
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

// SAVE
export function Save () {
  var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getPrettyXml(node)
  return value
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
  if (cell != null) {
    vHandler.rotateCell(cell, 90, cell.getParent())
  }
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
  var ground = 0
  var wirec = 0
  for (var property in list) {
    var cell = list[property]
    if (cell.Component === true) {
      console.log(cell)
      graph.getModel().beginUpdate()
      try {
        cell.value = 'Checked'
      } finally {
        // Updates the display
        graph.getModel().endUpdate()
      }
      // cell.value = 'Checked'
      for (var child in cell.children) {
        console.log(cell.children[child])
        var childVertex = cell.children[child]
        if (childVertex.Pin === true && childVertex.edges === null) {
          graph.getSelectionCell(childVertex)
          console.log('This pin is not connected')
          console.log(childVertex)
          ++PinNC
          ++errorCount
        } else {
          for (var w in childVertex.edges) {
            if (childVertex.edges[w].source === null || childVertex.edges[w].target === null) {
              ++PinNC
            } else {
              if (childVertex.edges[w].source.edge === true || childVertex.edges[w].target.edge === true) {
                ++wirec
              }
            }
          }
          console.log(childVertex)
        }
      }
      ++vertexCount
    }
    if (cell.symbol === 'PWR') {
      console.log('Ground is present')
      console.log(cell)
      ++ground
    }
    // Setting a rule check that only input and output ports can be connected
    /* if (cell.edge === true) {
      // eslint-disable-next-line no-constant-condition
      if ((cell.source.pinType === 'Input' && cell.target.pinType === 'Input') || (cell.source.pinType === 'Output' && cell.target.pinType === 'Output')) {
        ++stypes
      } else {
        cell.value = 'Node Number : ' + cell.id
        console.log('Wire Information')
        console.log('source : Pin' + cell.source.PinNumber + ' ' + cell.source.pinType + ' of ' + cell.source.ParentComponent.style)
        console.log('taget : Pin' + cell.target.PinNumber + ' ' + cell.target.pinType + ' of ' + cell.source.ParentComponent.style)
      }
    } */
  }

  if (vertexCount === 0) {
    alert('No Component added')
    ++errorCount
  } else if (PinNC !== 0) {
    alert('Pins not connected')
  } else if (ground === 0) {
    alert('Ground not connected')
  } else {
    if (errorCount === 0) {
      alert('ERC Check completed')
    }
  }
}
function ErcCheckNets () {
  var list = graph.getModel().cells // mapping the grid
  var vertexCount = 0
  var errorCount = 0
  var PinNC = 0
  var stypes = 0
  var ground = 0
  for (var property in list) {
    var cell = list[property]
    if (cell.Component === true) {
      console.log(cell)
      // cell.value = 'Checked'
      for (var child in cell.children) {
        console.log(cell.children[child])
        var childVertex = cell.children[child]
        if (childVertex.Pin === true && childVertex.edges === null) {
          graph.getSelectionCell(childVertex)
          console.log('This pin is not connected')
          console.log(childVertex)
          ++PinNC
          ++errorCount
        }
      }
      ++vertexCount
    }
    if (cell.symbol === 'PWR') {
      console.log('Ground is present')
      console.log(cell)
      ++ground
    }
    // Setting a rule check that only input and output ports can be connected
    /* if (cell.edge === true) {
      // eslint-disable-next-line no-constant-condition
      if ((cell.source.pinType === 'Input' && cell.target.pinType === 'Input') || (cell.source.pinType === 'Output' && cell.target.pinType === 'Output')) {
        ++stypes
      } else {
        cell.value = 'Node Number : ' + cell.id
        console.log('Wire Information')
        console.log('source : Pin' + cell.source.PinNumber + ' ' + cell.source.pinType + ' of ' + cell.source.ParentComponent.style)
        console.log('taget : Pin' + cell.target.PinNumber + ' ' + cell.target.pinType + ' of ' + cell.source.ParentComponent.style)
      }
    } */
  }
  if (vertexCount === 0) {
    alert('No Component added')
    ++errorCount
    return false
  } else if (PinNC !== 0) {
    alert('Pins not connected')
    return false
  } else if (ground === 0) {
    alert('Ground not connected')
    return false
  } else {
    if (errorCount === 0) {
      // alert('ERC Check completed')
      return true
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
  // var list = graph.getModel().cells
  var n = 1
  var netlist = {
    componentlist: [],
    nodelist: []
  }
  var erc = ErcCheckNets()
  var k = ''
  if (erc === false) {
    alert('ERC check failed')
  } else {
    var list = annotate(graph)
    for (var property in list) {
      if (list[property].Component === true && list[property].symbol !== 'PWR') {
        // k = ''
        // alert('Component is present')
        var compobj = {
          name: '',
          node1: '',
          node2: '',
          magnitude: ''
        }
        mxCell.prototype.ConnectedNode = null
        var component = list[property]
        // console.log(component)
        if (component.symbol === 'R') {
          // component.symbol = component.symbol + r.toString()
          k = k + component.symbol + r.toString()
          component.value = component.symbol + r.toString()
          // console.log(component)
          component.properties.PREFIX = component.value
          // component.symbol = component.value

          ++r
        } else if (component.symbol === 'V') {
          // component.symbol = component.symbol + v.toString()
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++v
        } else {
          // component.symbol = component.symbol + c.toString()
          k = k + component.symbol + c.toString()
          component.value = component.symbol + c.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++c
        }
        // compobj.name = component.symbol

        if (component.children !== null) {
          for (var child in component.children) {
            var pin = component.children[child]
            if (pin.vertex === true) {
              // alert(pin.id)
              if (pin.edges !== null || pin.edges.length !== 0) {
                for (var wire in pin.edges) {
                  if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                    if (pin.edges[wire].source.edge === true) {
                      console.log('wire')
                      console.log(pin.edges[wire].source)
                      console.log(pin.edges[wire].source.node)
                      pin.edges[wire].node = pin.edges[wire].source.node
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    } else if (pin.edges[wire].target.edge === true) {
                      console.log('wire')
                      console.log(pin.edges[wire].target)
                      console.log(pin.edges[wire].target.node)
                      pin.edges[wire].node = pin.edges[wire].target.node
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                      // console.log('Found ground')
                      // console.log('ground')
                      pin.edges[wire].node = 0
                      // pin.edges[wire].node = '0'
                      pin.edges[wire].value = 0
                      // k = k + ' ' + pin.edges[wire].node
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    } else {
                      // console.log(pin.edges[wire])
                      // if (pin.edges[wire].node === null) {
                      pin.edges[wire].node = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      pin.ConnectedNode = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      console.log('comp')
                      // ++n
                      // }
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id

                      pin.edges[wire].value = pin.edges[wire].node
                      // k = k + '  ' + pin.edges[wire].node
                    }
                    pin.edges[wire].value = pin.edges[wire].node
                  }
                  console.log('Check the wires here ')
                  console.log(pin.edges[wire].sourceVertex)
                  console.log(pin.edges[wire].targetVertex)
                }
                // console.log()
                // console.log(pin.value + 'is connected to this node' + pin.edges[0].node)
                k = k + ' ' + pin.edges[0].node

                // console.log(k)
              }
            }
          }
          compobj.name = component.symbol
          compobj.node1 = component.children[0].edges[0].node
          compobj.node2 = component.children[1].edges[0].node
          compobj.magnitude = 10
          netlist.componentlist.push(component.properties.PREFIX)
          netlist.nodelist.push(compobj.node2, compobj.node1)

          // console.log(compobj)
        }
        // console.log(component)
        if (component.properties.VALUE !== undefined) {
          k = k + ' ' + component.properties.VALUE
          component.value = component.value + '\n' + component.properties.VALUE
        }

        if (component.properties.EXTRA_EXPRESSION.length > 0) {
          k = k + ' ' + component.properties.EXTRA_EXPRESSION
          component.value = component.value + ' ' + component.properties.EXTRA_EXPRESSION
        }
        if (component.properties.MODEL.length > 0) {
          k = k + ' ' + component.properties.MODEL.split(' ')[1]
        }
        // k = k + ' 10'
        k = k + ' \n'
        // console.log(k)
      }
    }
  }
  // k = k + '.op \n'
  // k = k + '.end \n'

  // console.log(netlist)

  store.dispatch({
    type: actions.SET_NETLIST,
    payload: {
      netlist: k
    }
  })
  graph.getModel().beginUpdate()
  try {
    /* var list = graph.getModel().cells
    for (var property in list) {
      if (list[property].vertex == true) {
        list[property].value = 'checked'
      }
    } */
    graph.view.refresh()
  } finally {
    // Arguments are number of steps, ease and delay
    var morph = new mxMorphing(graph, 20, 1.2, 20)
    morph.addListener(mxEvent.DONE, function () {
      graph.getModel().endUpdate()
    })
    morph.startAnimation()
  }
  var a = new Set(netlist.nodelist)
  console.log(netlist.nodelist)
  console.log(a)
  return k
}
function annotate (graph) {
  /* var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getPrettyXml(node)
  return value */

  var r = 1
  var v = 1
  var c = 1
  var l = 1
  var d = 1
  var q = 1
  var w = 1
  var list = graph.getModel().cells
  var n = 1
  var netlist = {
    componentlist: [],
    nodelist: []
  }
  // var erc = ErcCheckNets()
  var erc = true
  var k = ''
  if (erc === false) {
    alert('ERC check failed')
  } else {
    for (var property in list) {
      if (list[property].Component === true && list[property].symbol !== 'PWR') {
        // k = ''
        // alert('Component is present')
        var compobj = {
          name: '',
          node1: '',
          node2: '',
          magnitude: ''
        }
        mxCell.prototype.ConnectedNode = null
        var component = list[property]
        // console.log(component)
        if (component.symbol === 'R') {
          // component.symbol = component.symbol + r.toString()
          k = k + component.symbol + r.toString()
          component.value = component.symbol + r.toString()
          // console.log(component)
          component.properties.PREFIX = component.value
          // component.symbol = component.value

          ++r
        } else if (component.symbol === 'V') {
          // component.symbol = component.symbol + v.toString()
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++v
        } else if (component.symbol === 'C') {
          // component.symbol = component.symbol + v.toString()
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++c
        } else if (component.symbol === 'D') {
          // component.symbol = component.symbol + v.toString()
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++d
        } else if (component.symbol === 'Q') {
          // component.symbol = component.symbol + v.toString()
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++q
        } else {
          // component.symbol = component.symbol + c.toString()
          k = k + component.symbol + c.toString()
          component.value = component.symbol + c.toString()
          component.properties.PREFIX = component.value
          // component.symbol = component.value
          ++w
        }
        // compobj.name = component.symbol

        if (component.children !== null) {
          for (var child in component.children) {
            var pin = component.children[child]
            if (pin.vertex === true) {
              // alert(pin.id)
              if (pin.edges !== null || pin.edges.length !== 0) {
                for (var wire in pin.edges) {
                  if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                    if (pin.edges[wire].source.edge === true) {

                    } else if (pin.edges[wire].target.edge === true) {

                    } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                      // console.log('Found ground')
                      // console.log('ground')
                      pin.edges[wire].node = 0
                      // pin.edges[wire].node = '0'
                      pin.edges[wire].value = 0
                      // k = k + ' ' + pin.edges[wire].node
                    } else {
                      // console.log(pin.edges[wire])
                      // if (pin.edges[wire].node === null) {
                      pin.edges[wire].node = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      pin.ConnectedNode = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      console.log('comp')
                      // ++n
                      // }

                      pin.edges[wire].value = pin.edges[wire].node
                      // k = k + '  ' + pin.edges[wire].node
                    }
                  }
                 
                  console.log(pin.edges[wire])
                }
                // console.log()
                // console.log(pin.value + 'is connected to this node' + pin.edges[0].node)
                k = k + ' ' + pin.edges[0].node

                // console.log(k)
              }
            }
          }
          compobj.name = component.symbol
          compobj.node1 = component.children[0].edges[0].node
          compobj.node2 = component.children[1].edges[0].node
          compobj.magnitude = 10
          netlist.componentlist.push(component.properties.PREFIX)
          netlist.nodelist.push(compobj.node2, compobj.node1)

          // console.log(compobj)
        }
        // console.log(component)
        if (component.properties.VALUE !== undefined) {
          k = k + ' ' + component.properties.VALUE
        }

        if (component.properties.EXTRA_EXPRESSION.length > 0) {
          k = k + ' ' + component.properties.EXTRA_EXPRESSION
        }
        if (component.properties.MODEL.length > 0) {
          k = k + ' ' + component.properties.MODEL.split(' ')[1]
        }
        // k = k + ' 10'
        k = k + ' \n'
        // console.log(k)
      }
    }
  }
  // k = k + '.op \n'
  // k = k + '.end \n'

  // console.log(netlist)
  return list
}

export function GenerateNodeList () {
  /* var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getPrettyXml(node)
  return value */
  /* var r = 1
  var v = 1
  var c = 1 */
  var list = annotate(graph)
  var a = []
  // var netlist = []
  var netlist = new Set()

  // console.log('Untitled netlist'
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      // k = ''
      // alert('Component is present')
      var compobj = {
        name: '',
        node1: '',
        node2: '',
        magnitude: ''
      }
      var component = list[property]
      // console.log(component)
      /* if (component.symbol === 'R') {
        // component.symbol = component.symbol + r.toString()
        k = k + component.symbol + r.toString()
        component.value = component.symbol + r.toString()
        component.symbol = component.value

        ++r
      } else if (component.symbol === 'V') {
        // component.symbol = component.symbol + v.toString()
        k = k + component.symbol + v.toString()
        component.value = component.symbol + v.toString()
        component.symbol = component.value
        ++v
      } else {
        // component.symbol = component.symbol + c.toString()
        k = k + component.symbol + c.toString()
        component.value = component.symbol + c.toString()
        component.symbol = component.value
        ++c
      } */
      // compobj.name = component.symbol

      if (component.children !== null) {
        /* for (var child in component.children) {
          var pin = component.children[child]
          if (pin.vertex === true) {
            // alert(pin.id)
            if (pin.edges !== null || pin.edges.length !== 0) {
              for (var wire in pin.edges) {
                if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                  // console.log('Found ground')
                  // pin.edges[wire].node = 0
                  pin.edges[wire].node = '0'
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
        } */
        compobj.name = component.symbol
        compobj.node1 = component.children[0].edges[0].node
        compobj.node2 = component.children[1].edges[0].node
        // compobj.magnitude = 10
        // netlist.componentlist.push(component.properties.PREFIX)
        // netlist.nodelist.add(compobj.node2)
        netlist.add(compobj.node1, compobj.node2)
        // console.log(compobj)
      }
      /* if (component.symbol.split('')[0] === 'R') {
        k = k + ' 1k'
      }
      else if( component.symbol === 'C') {
        k = k + ' 10u'
      }
      else {
        k = k + ' pwl(0m 0 0,5m 5 50m 5 50.5m 0 100m 0)'
      } */
      // k = k + ' 10'
      // k = k + ' \n'
      // console.log(k)
    }
  }
  // k = k + '.op \n'
  // k = k + '.end \n'
  // console.log(netlist)
  // netlist.nodelist = new Set(a)
  return netlist
}
export function GenerateCompList () {
  /* var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getPrettyXml(node)
  return value */
  /* var r = 1
  var v = 1
  var c = 1 */
  var list = annotate(graph)
  var a = []
  // var netlist = []
  var netlist = []

  // console.log('Untitled netlist'
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      // k = ''
      // alert('Component is present')
      var compobj = {
        name: '',
        node1: '',
        node2: '',
        magnitude: ''
      }
      var component = list[property]
      // console.log(component)
      /* if (component.symbol === 'R') {
        // component.symbol = component.symbol + r.toString()
        k = k + component.symbol + r.toString()
        component.value = component.symbol + r.toString()
        component.symbol = component.value

        ++r
      } else if (component.symbol === 'V') {
        // component.symbol = component.symbol + v.toString()
        k = k + component.symbol + v.toString()
        component.value = component.symbol + v.toString()
        component.symbol = component.value
        ++v
      } else {
        // component.symbol = component.symbol + c.toString()
        k = k + component.symbol + c.toString()
        component.value = component.symbol + c.toString()
        component.symbol = component.value
        ++c
      } */
      // compobj.name = component.symbol

      /* if (component.children !== null) {
        for (var child in component.children) {
          var pin = component.children[child]
          if (pin.vertex === true) {
            // alert(pin.id)
            if (pin.edges !== null || pin.edges.length !== 0) {
              for (var wire in pin.edges) {
                if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                  // console.log('Found ground')
                  // pin.edges[wire].node = 0
                  pin.edges[wire].node = '0'
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
        } */
      compobj.name = component.symbol
      compobj.node1 = component.children[0].edges[0].node
      compobj.node2 = component.children[1].edges[0].node
      // compobj.magnitude = 10
      // netlist.componentlist.push(component.properties.PREFIX)
      // netlist.nodelist.add(compobj.node2)
      netlist.push(component.properties.PREFIX)
      // console.log(compobj)

      /* if (component.symbol.split('')[0] === 'R') {
        k = k + ' 1k'
      }
      else if( component.symbol === 'C') {
        k = k + ' 10u'
      }
      else {
        k = k + ' pwl(0m 0 0,5m 5 50m 5 50.5m 0 100m 0)'
      } */
      // k = k + ' 10'
      // k = k + ' \n'
      // console.log(k)
    }
  }

  return netlist
  // k = k + '.op \n'
  // k = k + '.end \n'
  // console.log(netlist)
  // netlist.nodelist = new Set(a)
}

export function generateXML () {
  var enc = new mxCodec(mxUtils.createXmlDocument())
  console.log(enc)
  var node = enc.encode(graph.getModel())
  console.log(node)
  var xml = mxUtils.getXml(node)
  console.log(xml)
}

export function renderXML () {
  // var changes = evt.getProperty('edit').changes
  graph.view.refresh()
  var xml = '<mxGraphModel><root><mxCell id="0" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0"><Object as="properties"/></mxCell><mxCell id="1" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0"><Object as="properties"/></mxCell><mxCell value="V1&#xA;0" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="230" y="320" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="0" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="3" vertex="1" Pin="1" pinType="Input" PinNumber="1" ConnectedNode="V1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="60" width="0.5" height="0.5" as="geometry"/><mxCell value="V1&#xA;0" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" as="ParentComponent"><mxGeometry x="230" y="320" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="0" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="4" vertex="1" Pin="1" pinType="Input" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="60" y="119" width="0.5" height="0.5" as="geometry"/><mxCell value="V1&#xA;0" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" as="ParentComponent"><mxGeometry x="230" y="320" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="0" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="R1&#xA;1" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="570" y="320" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="1" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="6" vertex="1" Pin="1" pinType="Output" PinNumber="1" ConnectedNode="V1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="8" width="0.5" height="0.5" as="geometry"/><mxCell value="R1&#xA;1" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" as="ParentComponent"><mxGeometry x="570" y="320" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="1" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="7" vertex="1" Pin="1" pinType="Output" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="8" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="R1&#xA;1" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" as="ParentComponent"><mxGeometry x="570" y="320" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="1" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="V1.1" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="8" edge="1" node="V1.1" sourceVertex="3" targetVertex="6" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="GND2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GND2-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="390" y="440" width="40" height="80" as="geometry"/><Object id="54" name="GND2" svg_path="kicad-symbols/symbol_svgs/power/PWR-GND2-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GND2-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GND2&quot; , ground" data_link="" full_name="PWR-GND2-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GND2" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="10" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0"><mxGeometry x="20" y="39" width="0.5" height="0.5" as="geometry"/><mxCell value="GND2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GND2-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" as="ParentComponent"><mxGeometry x="390" y="440" width="40" height="80" as="geometry"/><Object id="54" name="GND2" svg_path="kicad-symbols/symbol_svgs/power/PWR-GND2-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GND2-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GND2&quot; , ground" data_link="" full_name="PWR-GND2-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GND2" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="0" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="11" edge="1" node="0" sourceVertex="4" targetVertex="10" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="290" y="470"/><mxPoint x="411" y="470"/></Array></mxGeometry><Object as="properties"/></mxCell><mxCell value="0" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="12" edge="1" node="0" sourceVertex="7" targetVertex="10" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="579" y="479"/></Array></mxGeometry><Object as="properties"/></mxCell></root></mxGraphModel>'
  var xmlDoc = mxUtils.parseXml(xml)
  /* var node = xmlDoc.documentElement
  var dec = new mxCodec(node)
  // dec.decode(node, graph.getModel())
  var change = dec.decode(node)
  console.log(change) */
  parseXmlToGraph(xmlDoc, graph)
  // console.log(dec)
  // change.execute()
  // changes.push(change)
}
function parseXmlToGraph (xmlDoc, graph) {
  const cells = xmlDoc.documentElement.children[0].children
  const parent = graph.getDefaultParent()
  var v1
  var yPos
  for (let i = 0; i < cells.length; i++) {
    const cellAttrs = cells[i].attributes
    if (cellAttrs.Component.value === '1') { // is component
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      console.log(cellAttrs.Component.value)
      const vertexId = Number(cellAttrs.id.value)
      const geom = cells[i].children[0].attributes
      const xPos = Number(geom.x.value)
      // var yPos
      if (geom.y === undefined) {
        yPos = 0
      } else {
        yPos = Number(geom.y.value)
      }
      const height = Number(geom.height.value)
      const width = Number(geom.width.value)
      v1 = graph.insertVertex(parent, vertexId, vertexName, xPos, yPos, width, height, style)
    } else if (cellAttrs.Pin.value === '1') {
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      console.log(cellAttrs.Component.value)
      const vertexId = Number(cellAttrs.id.value)
      const geom = cells[i].children[0].attributes
      const xPos = Number(geom.x.value)
      // var yPos
      if (geom.y === undefined) {
        yPos = 0
      } else {
        yPos = Number(geom.y.value)
      }
      const height = Number(geom.height.value)
      const width = Number(geom.width.value)
      graph.insertVertex(v1, vertexId, vertexName, xPos, yPos, 0.5, 0.5, style)
    } else if (cellAttrs.edge) { // is edge
      // const edgeName = cellAttrs.value.value
      const edgeId = Number(cellAttrs.id.value)
      const source = Number(cellAttrs.sourceVertex.value)
      const target = Number(cellAttrs.targetVertex.value)
      graph.insertEdge(parent, edgeId, null,
        graph.getModel().getCell(source),
        graph.getModel().getCell(target)
      )
    }
  }
}
