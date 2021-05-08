/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable */
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

export default function ToolbarTools(grid, unredo) {
  graph = grid

  undoManager = new mxUndoManager()
  var listener = function (sender, evt) {
    undoManager.undoableEditHappened(evt.getProperty('edit'))
  }
  graph.getModel().addListener(mxEvent.UNDO, listener)
  graph.getView().addListener(mxEvent.UNDO, listener)
}

// SAVE
export function Save() {
  XMLWireConnections()
  var enc = new mxCodec(mxUtils.createXmlDocument())
  var node = enc.encode(graph.getModel())
  var value = mxUtils.getXml(node)
  return value
}

// UNDO
export function Undo() {
  undoManager.undo()
}

// REDO
export function Redo() {
  undoManager.redo()
}

// Zoom IN
export function ZoomIn() {
  graph.zoomIn()
}

// ZOOM OUT
export function ZoomOut() {
  graph.zoomOut()
}

// ZOOM ACTUAL
export function ZoomAct() {
  graph.zoomActual()
}

// DELETE COMPONENT
export function DeleteComp() {
  graph.removeCells()
}

// CLEAR WHOLE GRID
export function ClearGrid() {
  graph.removeCells(graph.getChildVertices(graph.getDefaultParent()))
}

// ROTATE COMPONENT
export function Rotate() {
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
  vHandler.destroy()
}

// PRINT PREVIEW OF SCHEMATIC
export function PrintPreview() {
  // Matches actual printer paper size and avoids blank pages
  var scale = 0.8
  var headerSize = 50
  var footerSize = 50

  // Applies scale to page
  var pageFormat = { x: 0, y: 0, width: 1169, height: 827 }
  var pf = mxRectangle.fromRectangle(pageFormat || mxConstants.PAGE_FORMAT_A4_LANDSCAPE)
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
    var title = store.getState().saveSchematicReducer.title
    mxUtils.write(header, title + ' - eSim on Cloud')
    header.style.borderBottom = '1px solid blue'
    header.style.top = '0px'

    mxUtils.write(footer, 'Made with Schematic Editor - ' + pageNumber + ' - eSim on Cloud')
    footer.style.borderTop = '1px solid blue'
    footer.style.bottom = '0px'

    div.firstChild.appendChild(footer)
    div.firstChild.appendChild(header)

    return div
  }

  preview.open()
}

// ERC CHECK FOR SCHEMATIC
export function ErcCheck() {
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
      for (var child in cell.children) {
        var childVertex = cell.children[child]
        if (childVertex.Pin === true && childVertex.edges === null) { // Checking if connections exist from a given pin
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
        }
      }
      ++vertexCount
    }
    if (cell.symbol === 'PWR') { // Checking for ground
      console.log('Ground is present')
      console.log(cell)
      ++ground
    }
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
// ERC Check for Netlist, It also returns a boolean value which is called in the Netlist Generator 
function ErcCheckNets() {
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
    if (cell.symbol === 'PWR') {
      ++ground
    }
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
      return true
    }
  }
}

// Function to generate Netlist
export function GenerateNetList() {

  var r = 1
  var v = 1
  var c = 1
  var n = 1
  var spiceModels = ''
  var netlist = {
    componentlist: [],
    nodelist: []
  }
  var erc = ErcCheckNets() // Checking for ERC Failures
  var k = ''
  if (erc === false) {
    alert('ERC check failed')
  } else {
    var list = annotate(graph) // Fetching all the Cells on the GRID
    for (var property in list) {
      if (list[property].Component === true && list[property].symbol !== 'PWR') {
        var compobj = {
          name: '',
          node1: '',
          node2: '',
          magnitude: ''
        }
        mxCell.prototype.ConnectedNode = null
        var component = list[property]
        if (component.symbol === 'R') {
          k = k + component.symbol + r.toString()
          component.value = component.symbol + r.toString()
          component.properties.PREFIX = component.value

          ++r
        } else if (component.symbol === 'V') {
          console.log(component)
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          ++v
        } else {
          k = k + component.symbol + c.toString()
          component.value = component.symbol + c.toString()
          component.properties.PREFIX = component.value
          ++c
        }

        if (component.children !== null) {
          for (var child in component.children) {
            var pin = component.children[child]
            if (pin.vertex === true) {
              if (pin.edges !== null || pin.edges.length !== 0) {
                for (var wire in pin.edges) {
                  if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                    // Wire to Pin Connection 
                    if (pin.edges[wire].source.edge === true) {
                      pin.edges[wire].node = pin.edges[wire].source.node
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                      // Pin to Wire Connection 
                    } else if (pin.edges[wire].target.edge === true) {
                      pin.edges[wire].node = pin.edges[wire].target.node
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                      pin.edges[wire].tarx = pin.edges[wire].geometry.targetPoint.x
                      pin.edges[wire].tary = pin.edges[wire].geometry.targetPoint.y
                      // Souce or Target is Ground 
                    } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                      pin.edges[wire].node = 0
                      pin.edges[wire].value = 0
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                      // Pin to Pin Connection, Setting the Source to be the Node Value 
                    } else {
                      pin.edges[wire].node = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      pin.ConnectedNode = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      console.log('comp')
                      pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                      pin.edges[wire].targetVertex = pin.edges[wire].target.id
                      pin.edges[wire].value = pin.edges[wire].node
                    }
                    pin.edges[wire].value = pin.edges[wire].node
                  }
                }
                k = k + ' ' + pin.edges[0].node
              }
            }
          }
          compobj.name = component.symbol
          compobj.node1 = component.children[0].edges[0].node
          compobj.node2 = component.children[1].edges[0].node
          compobj.magnitude = 10
          netlist.componentlist.push(component.properties.PREFIX)
          netlist.nodelist.push(compobj.node2, compobj.node1)
        }
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
        if (component.properties.MODEL.length > 0) {
          spiceModels += component.properties.MODEL + '\n'
        }

        k = k + ' \n'
      }
    }
  }
  store.dispatch({
    type: actions.SET_MODEL,
    payload: {
      model: spiceModels
    }
  })
  store.dispatch({
    type: actions.SET_NETLIST,
    payload: {
      netlist: k
    }
  })
  // Refresh the GRID to view the Node Values 
  graph.getModel().beginUpdate()
  try {
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
  var netobj = {
    models: spiceModels,
    main: k
  }
  return netobj
}
function annotate(graph) {

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
  return list
}

export function GenerateNodeList() {
  var list = annotate(graph)
  var a = []
  // var netlist = []
  var netlist = new Set()

  // console.log('Untitled netlist'
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      // k = ''
      // alert('Component is present')Component Name: ZMYxx
      var compobj = {
        name: '',
        node1: '',
        node2: '',
        magnitude: ''
      }
      var component = list[property]
      if (component.children !== null) {
        compobj.name = component.symbol
        compobj.node1 = component.children[0].edges[0].node
        compobj.node2 = component.children[1].edges[0].node
        netlist.add(compobj.node1, compobj.node2)
      }
    }
  }
  return netlist
}
export function GenerateCompList() {
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
      compobj.name = component.symbol
      compobj.node1 = component.children[0].edges[0].node
      compobj.node2 = component.children[1].edges[0].node
      netlist.push(component.properties.PREFIX)
    }
  }

  return netlist

}

export function renderXML() {
  graph.view.refresh()
  var xml = 'null'
  var xmlDoc = mxUtils.parseXml(xml)
  parseXmlToGraph(xmlDoc, graph)
}
function parseXmlToGraph(xmlDoc, graph) {
  console.log(xmlDoc)
  const cells = xmlDoc.documentElement.children[0].children
  const parent = graph.getDefaultParent()
  var v1
  var yPos
  var xPos
  var props
  var style = graph.getStylesheet().getDefaultVertexStyle()

  style[mxConstants.STYLE_SHAPE] = 'label'
  style[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom'
  // style[mxConstants.STYLE_INDICATOR_SHAPE] = 'ellipse'
  // style[mxConstants.STYLE_INDICATOR_WIDTH] = 34
  // style[mxConstants.STYLE_INDICATOR_HEIGHT] = 34
  style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = 'bottom' // indicator v-alignment
  style[mxConstants.STYLE_IMAGE_ALIGN] = 'bottom'
  style[mxConstants.STYLE_INDICATOR_COLOR] = 'green'
  style[mxConstants.STYLE_FONTCOLOR] = 'red'
  style[mxConstants.STYLE_FONTSIZE] = '10'
  delete style[mxConstants.STYLE_STROKECOLOR] // transparent
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
        try { props = Object.assign({}, ComponentParameters[v1.symbol][cells[i].children[2].attributes.NAME.value]) } catch (e) { props = Object.assign({}, ComponentParameters[v1.symbol][cells[i].children[1].attributes.NAME.value]) }
      } else {
        props = Object.assign({}, ComponentParameters[v1.symbol])
      }

      /* if (v1.symbol === 'V') {
        console.log('find name here')
        console.log(cells[i].children[2].attributes.NAME.value)
      } */
      try { props.NAME = cells[i].children[2].attributes.NAME.value } catch (e) { props.NAME = cells[i].children[1].attributes.NAME.value }
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
        try { v1.properties[check] = cells[i].children[2].attributes[check].value } catch (e) { try { v1.properties[check] = cells[i].children[1].attributes[check].value } catch (e) { console.log('parameter errors') } }
      }
      console.log('component added')
    } else if (cellAttrs.Pin.value === '1') {
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      console.log('Pin name')
      console.log(vertexName)
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
      vp.Pin = 1
    } else if (cellAttrs.edge) { // is edge
      // const edgeName = cellAttrs.value.value
      const edgeId = Number(cellAttrs.id.value)
      const source = Number(cellAttrs.sourceVertex.value)
      const target = Number(cellAttrs.targetVertex.value)
      console.log(edgeId)
      var plist = cells[i].children[1].children
      try {
        var e = graph.insertEdge(parent, edgeId, null,
          graph.getModel().getCell(source),
          graph.getModel().getCell(target)
        )
        e.geometry.points = []
        for (var a in cells[i].children[1].children) {
          try {
            console.log(plist[a].attributes.x.value)
            console.log(plist[a].attributes.y.value)
            e.geometry.points.push(new mxPoint(Number(plist[a].attributes.x.value), Number(plist[a].attributes.y.value)))
            console.log(e.geometry.points)
          } catch (e) { console.log('error') }
          graph.getModel().beginUpdate()
          try {
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
        if (graph.getModel().getCell(target).edge === true) {
          e.geometry.setTerminalPoint(new mxPoint(Number(cellAttrs.tarx.value), Number(cellAttrs.tary.value)), false)
          graph.getModel().beginUpdate()
          try {
            graph.view.refresh()
          } finally {
            // Arguments are number of steps, ease and delay
            morph = new mxMorphing(graph, 20, 1.2, 20)
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

export function renderGalleryXML(xml) {
  graph.removeCells(graph.getChildVertices(graph.getDefaultParent()))
  graph.view.refresh()
  var xmlDoc = mxUtils.parseXml(xml)
  parseXmlToGraph(xmlDoc, graph)
}
function XMLWireConnections() {

  var erc = true
  if (erc === false) {
    alert('ERC check failed')
  } else {
    var list = graph.getModel().cells
    for (var property in list) {
      if (list[property].Component === true && list[property].symbol !== 'PWR') {
        mxCell.prototype.ConnectedNode = null
        var component = list[property]

        if (component.children !== null) {
          for (var child in component.children) {
            var pin = component.children[child]
            if (pin.vertex === true) {
              // alert(pin.id)
              try {
                if (pin.edges !== null || pin.edges.length !== 0) {
                  for (var wire in pin.edges) {
                    if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                      if (pin.edges[wire].source.edge === true) {
                        pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                        pin.edges[wire].targetVertex = pin.edges[wire].target.id
                        pin.edges[wire].PointsArray = pin.edges[wire].geometry.points
                      } else if (pin.edges[wire].target.edge === true) {
                        pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                        pin.edges[wire].targetVertex = pin.edges[wire].target.id
                        pin.edges[wire].tarx = pin.edges[wire].geometry.targetPoint.x
                        pin.edges[wire].tary = pin.edges[wire].geometry.targetPoint.y
                        pin.edges[wire].PointsArray = pin.edges[wire].geometry.points
                      } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                        pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                        pin.edges[wire].targetVertex = pin.edges[wire].target.id
                        pin.edges[wire].PointsArray = pin.edges[wire].geometry.points
                      } else {
                        pin.edges[wire].node = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                        pin.ConnectedNode = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                        pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                        pin.edges[wire].targetVertex = pin.edges[wire].target.id
                        pin.edges[wire].PointsArray = pin.edges[wire].geometry.points
                      }
                    }
                    console.log('Check the wires here ')
                    console.log(pin.edges[wire].sourceVertex)
                    console.log(pin.edges[wire].targetVertex)
                  }

                }
              } catch (e) { console.log('error') }
            }
          }

        }

      }
    }
  }

}
