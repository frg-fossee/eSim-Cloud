/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
import mxGraphFactory from 'mxgraph'
import store from '../../../redux/store'
import * as actions from '../../../redux/actions/actions'
import ComponentParameters from './ComponentParametersData'
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
  mxPoint
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
  var value = mxUtils.getXml(node)
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
          console.log(component)
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
                      pin.edges[wire].tarx = pin.edges[wire].geometry.targetPoint.x
                      pin.edges[wire].tary = pin.edges[wire].geometry.targetPoint.y
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
        console.log('component properties', component.properties)

        if (component.properties.PREFIX.charAt(0) === 'V' || component.properties.PREFIX.charAt(0) === 'v' || component.properties.PREFIX.charAt(0) === 'I' || component.properties.PREFIX.charAt(0) === 'i') {
          const comp = component.properties
          if (comp.NAME === 'SINE') {
            k = k + ` SIN(${comp.OFFSET} ${comp.AMPLITUDE} ${comp.FREQUENCY} ${comp.DELAY} ${comp.DAMPING_FACTOR} ${comp.PHASE} )`
          } else if (comp.NAME === 'EXP') {
            k = k + ` EXP(${comp.INITIAL_VALUE} ${comp.PULSED_VALUE} ${comp.FREQUENCY} ${comp.RISE_DELAY_TIME} ${comp.RISE_TIME_CONSTANT} ${comp.FALL_DELAY_TIME} ${comp.FALL_TIME_CONSTANT} )`
          } else if (comp.NAME === 'DC') {
            if (component.properties.VALUE !== undefined) {
              k = k + ' DC ' + component.properties.VALUE
              component.value = component.value + '\n' + component.properties.VALUE
            }
          } else if (comp.NAME === 'PULSE') {
            k = k + ` PULSE(${comp.INITIAL_VALUE} ${comp.PULSED_VALUE} ${comp.DELAY_TIME} ${comp.RISE_TIME} ${comp.FALL_TIME} ${comp.PULSE_WIDTH} ${comp.PERIOD} ${comp.PHASE} )`
          } else {
            if (component.properties.VALUE !== undefined) {
              k = k + ' ' + component.properties.VALUE
              component.value = component.value + '\n' + component.properties.VALUE
            }
          }
        } else {
          if (component.properties.VALUE !== undefined) {
            k = k + ' ' + component.properties.VALUE
            component.value = component.value + '\n' + component.properties.VALUE
          }
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

// export function generateXML () {
//   var enc = new mxCodec(mxUtils.createXmlDocument())
//   console.log(enc)
//   var node = enc.encode(graph.getModel())
//   console.log(node)
//   var xml = mxUtils.getXml(node)
//   console.log(xml)
// }

export function renderXML () {
  // var changes = evt.getProperty('edit').changes
  graph.view.refresh()
  var xml = '<mxGraphModel><root><mxCell id="0" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><Object as="properties"/></mxCell><mxCell id="1" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><Object as="properties"/></mxCell><mxCell value="V1&#xA;dc 0 ac 1 sin(0 1m 500)" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="70" y="440" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="dc 0 ac 1 sin(0 1m 500)" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="3" vertex="1" Pin="1" pinType="Input" PinNumber="1" ConnectedNode="V1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" width="0.5" height="0.5" as="geometry"/><mxCell value="V1&#xA;dc 0 ac 1 sin(0 1m 500)" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="70" y="440" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="dc 0 ac 1 sin(0 1m 500)" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="4" vertex="1" Pin="1" pinType="Input" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" y="119" width="0.5" height="0.5" as="geometry"/><mxCell value="V1&#xA;dc 0 ac 1 sin(0 1m 500)" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="2" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="70" y="440" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V1" NAME="VSOURCE" N1="" N2="" VALUE="dc 0 ac 1 sin(0 1m 500)" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="C1&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="250" y="340" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C1" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="6" vertex="1" Pin="1" pinType="Output" PinNumber="1" ConnectedNode="C1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="30" width="0.5" height="0.5" as="geometry"/><mxCell value="C1&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="250" y="340" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C1" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="7" vertex="1" Pin="1" pinType="Output" PinNumber="2" ConnectedNode="V1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="30" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="C1&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="5" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="250" y="340" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C1" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="V1.1" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="8" edge="1" node="V1.1" sourceVertex="3" targetVertex="7" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="Q2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="Q" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="620" y="300" width="80" height="80" as="geometry"/><Object id="610" name="BC307" svg_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A_thumbnail.svg" symbol_prefix="Q" component_library="http://localhost/api/libraries/12/" description="100mA Ic, 45V Vce, Epitaxial Silicon PNP Transistor, TO-92" data_link="http://www.onsemi.com/pub_link/Collateral/BC307-D.PDF" full_name="Q-BC307-1-A" keyword="Epitaxial Silicon PNP Transistor" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="Q2" NAME="BC307" N1="" N2="" N3="" EXTRA_EXPRESSION="" MODEL=".model BC546B npn ( IS=7.59E-15 VAF=73.4 BF=480 IKF=0.0962 NE=1.2665&#xA;+ ISE=3.278E-15 IKR=0.03 ISC=2.00E-13 NC=1.2 NR=1 BR=5 RC=0.25 CJC=6.33E-12&#xA;+ FC=0.5 MJC=0.33 VJC=0.65 CJE=1.25E-11 MJE=0.55 VJE=0.65 TF=4.26E-10&#xA;+ ITF=0.6 VTF=3 XTF=20 RB=100 IRB=0.0001 RBM=10 RE=0.5 TR=1.50E-07)" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="10" vertex="1" Pin="1" pinType="Output" PinNumber="1" ConnectedNode="R2.2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" width="0.5" height="0.5" as="geometry"/><mxCell value="Q2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="Q" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="620" y="300" width="80" height="80" as="geometry"/><Object id="610" name="BC307" svg_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A_thumbnail.svg" symbol_prefix="Q" component_library="http://localhost/api/libraries/12/" description="100mA Ic, 45V Vce, Epitaxial Silicon PNP Transistor, TO-92" data_link="http://www.onsemi.com/pub_link/Collateral/BC307-D.PDF" full_name="Q-BC307-1-A" keyword="Epitaxial Silicon PNP Transistor" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="Q2" NAME="BC307" N1="" N2="" N3="" EXTRA_EXPRESSION="" MODEL=".model BC546B npn ( IS=7.59E-15 VAF=73.4 BF=480 IKF=0.0962 NE=1.2665&#xA;+ ISE=3.278E-15 IKR=0.03 ISC=2.00E-13 NC=1.2 NR=1 BR=5 RC=0.25 CJC=6.33E-12&#xA;+ FC=0.5 MJC=0.33 VJC=0.65 CJE=1.25E-11 MJE=0.55 VJE=0.65 TF=4.26E-10&#xA;+ ITF=0.6 VTF=3 XTF=20 RB=100 IRB=0.0001 RBM=10 RE=0.5 TR=1.50E-07)" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=left;verticalAlign=bottom;rotation=0" id="11" vertex="1" Pin="1" pinType="Input" PinNumber="2" ConnectedNode="C1.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry y="39" width="0.5" height="0.5" as="geometry"/><mxCell value="Q2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="Q" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="620" y="300" width="80" height="80" as="geometry"/><Object id="610" name="BC307" svg_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A_thumbnail.svg" symbol_prefix="Q" component_library="http://localhost/api/libraries/12/" description="100mA Ic, 45V Vce, Epitaxial Silicon PNP Transistor, TO-92" data_link="http://www.onsemi.com/pub_link/Collateral/BC307-D.PDF" full_name="Q-BC307-1-A" keyword="Epitaxial Silicon PNP Transistor" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="Q2" NAME="BC307" N1="" N2="" N3="" EXTRA_EXPRESSION="" MODEL=".model BC546B npn ( IS=7.59E-15 VAF=73.4 BF=480 IKF=0.0962 NE=1.2665&#xA;+ ISE=3.278E-15 IKR=0.03 ISC=2.00E-13 NC=1.2 NR=1 BR=5 RC=0.25 CJC=6.33E-12&#xA;+ FC=0.5 MJC=0.33 VJC=0.65 CJE=1.25E-11 MJE=0.55 VJE=0.65 TF=4.26E-10&#xA;+ ITF=0.6 VTF=3 XTF=20 RB=100 IRB=0.0001 RBM=10 RE=0.5 TR=1.50E-07)" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="3" style="align=right;verticalAlign=bottom;rotation=0" id="12" vertex="1" Pin="1" pinType="Output" PinNumber="3" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" y="79" width="0.5" height="0.5" as="geometry"/><mxCell value="Q2" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="9" vertex="1" connectable="0" Component="1" CellType="Component" symbol="Q" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="620" y="300" width="80" height="80" as="geometry"/><Object id="610" name="BC307" svg_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/Transistor_BJT/Q-BC307-1-A_thumbnail.svg" symbol_prefix="Q" component_library="http://localhost/api/libraries/12/" description="100mA Ic, 45V Vce, Epitaxial Silicon PNP Transistor, TO-92" data_link="http://www.onsemi.com/pub_link/Collateral/BC307-D.PDF" full_name="Q-BC307-1-A" keyword="Epitaxial Silicon PNP Transistor" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="Q2" NAME="BC307" N1="" N2="" N3="" EXTRA_EXPRESSION="" MODEL=".model BC546B npn ( IS=7.59E-15 VAF=73.4 BF=480 IKF=0.0962 NE=1.2665&#xA;+ ISE=3.278E-15 IKR=0.03 ISC=2.00E-13 NC=1.2 NR=1 BR=5 RC=0.25 CJC=6.33E-12&#xA;+ FC=0.5 MJC=0.33 VJC=0.65 CJE=1.25E-11 MJE=0.55 VJE=0.65 TF=4.26E-10&#xA;+ ITF=0.6 VTF=3 XTF=20 RB=100 IRB=0.0001 RBM=10 RE=0.5 TR=1.50E-07)" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="C1.1" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="13" edge="1" node="C1.1" sourceVertex="6" targetVertex="11" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="14" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="110" y="610" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="15" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="20" y="39" width="0.5" height="0.5" as="geometry"/><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="14" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="110" y="610" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="0" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="16" edge="1" node="0" sourceVertex="4" targetVertex="15" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="17" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="660" y="610" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="18" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="20" y="39" width="0.5" height="0.5" as="geometry"/><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="17" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="660" y="610" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="0" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="19" edge="1" node="0" sourceVertex="12" targetVertex="18" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="R1&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="20" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="380" y="460" width="16" height="100" as="geometry"><mxPoint x="-2" y="-1" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="21" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" width="0.5" height="0.5" as="geometry"/><mxCell value="R1&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="20" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="380" y="460" width="16" height="100" as="geometry"><mxPoint x="-2" y="-1" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="22" vertex="1" Pin="1" pinType="Output" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="R1&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="20" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="380" y="460" width="16" height="100" as="geometry"><mxPoint x="-2" y="-1" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R1" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="0" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="24" edge="1" node="0" sourceVertex="22" targetVertex="19" tarx="680" tary="620" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="680" y="620" as="targetPoint"/><Array as="points"><mxPoint x="388" y="620"/></Array></mxGeometry><Object as="properties"/></mxCell><mxCell value="R2&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="25" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="672" y="110" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R2" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="26" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" width="0.5" height="0.5" as="geometry"/><mxCell value="R2&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="25" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="672" y="110" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R2" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="27" vertex="1" Pin="1" pinType="Output" PinNumber="2" ConnectedNode="R2.2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="R2&#xA;10k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="25" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="672" y="110" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R2" NAME="R" N1="" N2="" VALUE="10k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="R2.2" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="28" edge="1" node="R2.2" sourceVertex="27" targetVertex="10" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="R3&#xA;68k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="29" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="430" y="110" width="16" height="100" as="geometry"><mxPoint x="-11" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R3" NAME="R" N1="" N2="" VALUE="68k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="30" vertex="1" Pin="1" pinType="Output" PinNumber="1" ConnectedNode="V2.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" width="0.5" height="0.5" as="geometry"/><mxCell value="R3&#xA;68k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="29" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="430" y="110" width="16" height="100" as="geometry"><mxPoint x="-11" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R3" NAME="R" N1="" N2="" VALUE="68k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="31" vertex="1" Pin="1" pinType="Output" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="R3&#xA;68k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="29" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="430" y="110" width="16" height="100" as="geometry"><mxPoint x="-11" as="offset"/></mxGeometry><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R3" NAME="R" N1="" N2="" VALUE="68k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="V2&#xA;5" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="33" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="70" y="90" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V2" NAME="VSOURCE" N1="" N2="" VALUE="5" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="34" vertex="1" Pin="1" pinType="Input" PinNumber="1" ConnectedNode="V2.1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" width="0.5" height="0.5" as="geometry"/><mxCell value="V2&#xA;5" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="33" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="70" y="90" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V2" NAME="VSOURCE" N1="" N2="" VALUE="5" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="35" vertex="1" Pin="1" pinType="Input" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="60" y="119" width="0.5" height="0.5" as="geometry"/><mxCell value="V2&#xA;5" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="33" vertex="1" connectable="0" Component="1" CellType="Component" symbol="V" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="70" y="90" width="120" height="120" as="geometry"/><Object id="317" name="VSOURCE" svg_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/V-VSOURCE-1-A_thumbnail.svg" symbol_prefix="V" component_library="http://localhost/api/libraries/8/" description="Voltage source symbol for simulation only" data_link="~" full_name="V-VSOURCE-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="V2" NAME="VSOURCE" N1="" N2="" VALUE="5" EXTRA_EXPRESSION="" MODEL="" UNIT="V" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="V2.1" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="36" edge="1" node="V2.1" sourceVertex="34" targetVertex="30" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="V2.1" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="37" edge="1" node="V2.1" sourceVertex="26" targetVertex="36" tarx="440" tary="90" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="440" y="90" as="targetPoint"/><Array as="points"><mxPoint x="680" y="90"/></Array></mxGeometry><Object as="properties"/></mxCell><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="38" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="110" y="230" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="39" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="20" y="39" width="0.5" height="0.5" as="geometry"/><mxCell value="GNDS" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="38" vertex="1" connectable="0" Component="1" CellType="Component" symbol="PWR" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="110" y="230" width="40" height="80" as="geometry"/><Object id="51" name="GNDS" svg_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/power/PWR-GNDS-1-A_thumbnail.svg" symbol_prefix="PWR" component_library="http://localhost/api/libraries/2/" description="Power symbol creates a global label with name &quot;GNDS&quot; , signal ground" data_link="" full_name="PWR-GNDS-1-A" keyword="power-flag" as="CompObject"><Array as="alternate_component"/></Object><Object NAME="GNDS" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="0" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="40" edge="1" node="0" sourceVertex="35" targetVertex="39" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"/><Object as="properties"/></mxCell><mxCell value="C1.1" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="41" edge="1" node="C1.1" sourceVertex="21" targetVertex="13" tarx="560" tary="350" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="560" y="350" as="targetPoint"/></mxGeometry><Object as="properties"/></mxCell><mxCell value="C1.1" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="42" edge="1" node="C1.1" sourceVertex="31" targetVertex="13" tarx="570" tary="340" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="570" y="340" as="targetPoint"/><Array as="points"><mxPoint x="570" y="270"/></Array></mxGeometry><Object as="properties"/></mxCell><mxCell value="C3&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="43" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="850" y="270" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C3" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="44" vertex="1" Pin="1" pinType="Output" PinNumber="1" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="30" width="0.5" height="0.5" as="geometry"/><mxCell value="C3&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="43" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="850" y="270" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C3" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="45" vertex="1" Pin="1" pinType="Output" PinNumber="2" ConnectedNode="C3.2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="30" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="C3&#xA;10u" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="43" vertex="1" connectable="0" Component="1" CellType="Component" symbol="C" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="850" y="270" width="60" height="100" as="geometry"/><Object id="319" name="CAP" svg_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/C-CAP-1-A_thumbnail.svg" symbol_prefix="C" component_library="http://localhost/api/libraries/8/" description="Capacitor symbol for simulation only" data_link="~" full_name="C-CAP-1-A" keyword="simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="C3" NAME="CAP" N1="" N2="" VALUE="10u" EXTRA_EXPRESSION="" MODEL="" UNIT="F" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="R2.2" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="46" edge="1" node="R2.2" sourceVertex="44" targetVertex="28" tarx="680" tary="270" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="680" y="270" as="targetPoint"/></mxGeometry><Object as="properties"/></mxCell><mxCell value="R4&#xA;100k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="47" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="872" y="460" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R4" NAME="R" N1="" N2="" VALUE="100k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><mxCell value="1" style="align=right;verticalAlign=up;rotation=0" id="48" vertex="1" Pin="1" pinType="Output" PinNumber="1" ConnectedNode="C3.2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" width="0.5" height="0.5" as="geometry"/><mxCell value="R4&#xA;100k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="47" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="872" y="460" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R4" NAME="R" N1="" N2="" VALUE="100k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="2" style="align=right;verticalAlign=bottom;rotation=0" id="49" vertex="1" Pin="1" pinType="Output" PinNumber="2" CellType="This is where you say what the vertex is" Component="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0"><mxGeometry x="8" y="99" width="0.5" height="0.5" as="geometry"/><mxCell value="R4&#xA;100k" style="shape=image;fontColor=blue;image=../kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg;imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25" id="47" vertex="1" connectable="0" Component="1" CellType="Component" symbol="R" pinType=" " Pin="0" PinNumber="0" PinName="" sourceVertex="0" targetVertex="0" tarx="0" tary="0" as="ParentComponent"><mxGeometry x="872" y="460" width="16" height="100" as="geometry"/><Object id="321" name="R" svg_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A.svg" thumbnail_path="kicad-symbols/symbol_svgs/pspice/R-R-1-A_thumbnail.svg" symbol_prefix="R" component_library="http://localhost/api/libraries/8/" description="Resistor symbol for simulation only" data_link="~" full_name="R-R-1-A" keyword="resistor simulation" as="CompObject"><Array as="alternate_component"/></Object><Object PREFIX="R4" NAME="R" N1="" N2="" VALUE="100k" EXTRA_EXPRESSION="" MODEL="" UNIT="K" as="properties"/></mxCell><Object as="properties"/></mxCell><mxCell value="C3.2" style="exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" id="50" edge="1" node="C3.2" sourceVertex="45" targetVertex="48" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName="" tarx="0" tary="0"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="880" y="410"/><mxPoint x="889" y="410"/></Array></mxGeometry><Object as="properties"/></mxCell><mxCell value="0" style="exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" id="51" edge="1" node="0" sourceVertex="49" targetVertex="19" tarx="680" tary="640" CellType="This is where you say what the vertex is" pinType=" " Component="0" Pin="0" PinNumber="0" PinName=""><mxGeometry relative="1" as="geometry"><mxPoint x="680" y="640" as="targetPoint"/><Array as="points"><mxPoint x="880" y="660"/></Array></mxGeometry><Object as="properties"/></mxCell></root></mxGraphModel>'
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
  var xPos
  var props
  for (let i = 0; i < cells.length; i++) {
    const cellAttrs = cells[i].attributes
    if (cellAttrs.Component.value === '1') { // is component
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      // console.log(cellAttrs.Component.value)
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
      v1.symbol = cellAttrs.symbol.value
      if (v1.symbol === 'V') {
        props = Object.assign({}, ComponentParameters[v1.symbol][cells[i].children[2].attributes.NAME.value])
      } else {
        props = Object.assign({}, ComponentParameters[v1.symbol])
      }

      /* if (v1.symbol === 'V') {
        console.log('find name here')
        console.log(cells[i].children[2].attributes.NAME.value)
      } */
      try { props.NAME = cells[i].children[2].attributes.NAME.value } catch (e) { console.log('error') }
      v1.properties = props
      v1.Component = true
      v1.CellType = 'Component'
      console.log(props)
      // console.log(v1.properties)
      if (v1.properties.name === 'VSOURCE') {
        console.log('here it is')
        console.log(v1.properties)
      }
      for (var check in props) {
        try { v1.properties[check] = cells[i].children[2].attributes[check].value } catch (e) { }
      }
    } else if (cellAttrs.Pin.value === '1') {
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      // console.log(cellAttrs.Component.value)
      const vertexId = Number(cellAttrs.id.value)
      const geom = cells[i].children[0].attributes
      try { xPos = Number(geom.x.value) } catch (e) { xPos = 0 }
      // var yPos
      if (geom.y === undefined) {
        yPos = 0
      } else {
        yPos = Number(geom.y.value)
      }
      const height = Number(geom.height.value)
      const width = Number(geom.width.value)
      var vp = graph.insertVertex(v1, vertexId, vertexName, xPos, yPos, 0.5, 0.5, style)
      vp.ParentComponent = v1
    } else if (cellAttrs.edge) { // is edge
      // const edgeName = cellAttrs.value.value
      const edgeId = Number(cellAttrs.id.value)
      const source = Number(cellAttrs.sourceVertex.value)
      const target = Number(cellAttrs.targetVertex.value)
      try {
        var e = graph.insertEdge(parent, edgeId, null,
          graph.getModel().getCell(source),
          graph.getModel().getCell(target)
        )
        if (graph.getModel().getCell(target).edge === true) {
          e.geometry.setTerminalPoint(new mxPoint(Number(cellAttrs.tarx.value), Number(cellAttrs.tary.value)), false)
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
        }
      } catch (e) {
        console.log(graph.getModel().getCell(source))
        console.log(graph.getModel().getCell(target))
        console.log('error')
      }
    }
  }
}

export function renderGalleryXML (xml) {
  // var changes = evt.getProperty('edit').changes
  graph.view.refresh()
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
