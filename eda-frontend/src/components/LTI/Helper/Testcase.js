/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable */
import mxGraphFactory from 'mxgraph'
import store from '../../../redux/store'
import * as actions from '../../../redux/actions/actions'
import ComponentParameters from '../../SchematicEditor/Helper/ComponentParametersData'
var graph

const {
  mxConstants,
  mxUtils,
  mxEvent,
  mxCell,
  mxMorphing,
  mxPoint
} = new mxGraphFactory()


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
function ErcCheckNets(graph) {
  var list = graph.getModel().cells // mapping the grid
  var vertexCount = 0
  var errorCount = 0
  var PinNC = 0
  var stypes = 0
  var ground = 0
  for (var property in list) {
    var cell = list[property]
    if (cell.Component === true) {
      for (var child in cell.children) {
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
export function GenerateNetList(graph=graph) {

  var r = 1
  var v = 1
  var c = 1
  var n = 1
  var spiceModels = ''
  var netlist = {
    componentlist: [],
    nodelist: []
  }
  var erc = ErcCheckNets(graph) // Checking for ERC Failures
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
        console.log('component properties', component.properties)
        if (component.properties.MODEL.length > 0) {
            k = k + ' ' + component.properties.MODEL.split(' ')[1]
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
        }else if(component.properties.PREFIX.charAt(0) === 'C' || component.properties.PREFIX.charAt(0) === 'c'){
            k = k + ' ' + component.properties.VALUE
            if(component.properties.IC != 0){
                k = k + ' IC=' + component.properties.IC
            }
            component.value = component.value + '\n' + component.properties.VALUE
        }else if(component.properties.PREFIX.charAt(0) === 'L' || component.properties.PREFIX.charAt(0) === 'l'){
            k = k + ' ' + component.properties.VALUE
            if(component.properties.IC != 0){
                k = k + ' IC=' + component.properties.IC
            }
            if(component.properties.DTEMP != 27){
                k = k + ' dtemp=' + component.properties.DTEMP
            }            
            component.value = component.value + '\n' + component.properties.VALUE
        }else if(component.properties.PREFIX.charAt(0) === 'M' || component.properties.PREFIX.charAt(0) === 'm'){
            // k = k + ' ' + component.properties.VALUE   
            if(component.properties.MULTIPLICITY_PARAMETER != 1){
                k = k + ' m=' + component.properties.MULTIPLICITY_PARAMETER
            }
            if(component.properties.DTEMP != 27){
                k = k + ' dtemp=' + component.properties.DTEMP
            }            
            // component.value = component.value + '\n' + component.properties.VALUE
        }else if(component.properties.PREFIX.charAt(0) === 'Q' || component.properties.PREFIX.charAt(0) === 'q'){
            // k = k + ' ' + component.properties.VALUE
            if(component.properties.MULTIPLICITY_PARAMETER != 1){
                k = k + ' m=' + component.properties.MULTIPLICITY_PARAMETER
            }
            if(component.properties.DTEMP != 27){
                k = k + ' dtemp=' + component.properties.DTEMP
            }            
            // component.value = component.value + '\n' + component.properties.VALUE
        }else if(component.properties.PREFIX.charAt(0) === 'R' || component.properties.PREFIX.charAt(0) === 'r'){
            k = k + ' ' + component.properties.VALUE
            if(component.properties.SHEET_RESISTANCE != 0){
                k = k + ' RSH=' + component.properties.SHEET_RESISTANCE
            }
            if(component.properties.FIRST_ORDER_TEMPERATURE_COEFF != 0){
                k = k + ' tc1=' + component.properties.FIRST_ORDER_TEMPERATURE_COEFF
            }
            if(component.properties.SECOND_ORDER_TEMPERATURE_COEFF != 0){
                k = k + ' tc2=' + component.properties.SECOND_ORDER_TEMPERATURE_COEFF
            }
            if(component.properties.PARAMETER_MEASUREMENT_TEMPERATURE != 27){
                k = k + ' TNOM=' + component.properties.PARAMETER_MEASUREMENT_TEMPERATURE
            }
            component.value = component.value + '\n' + component.properties.VALUE
        }else {
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
// Function to Annotate, TODO! It needs some polishing 
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
        if (component.symbol === 'R') {
          k = k + component.symbol + r.toString()
          component.value = component.symbol + r.toString()
          component.properties.PREFIX = component.value

          ++r
        } else if (component.symbol === 'V') {
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          ++v
        } else if (component.symbol === 'C') {
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          ++c
        } else if (component.symbol === 'D') {
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          ++d
        } else if (component.symbol === 'Q') {
          k = k + component.symbol + v.toString()
          component.value = component.symbol + v.toString()
          component.properties.PREFIX = component.value
          ++q
        } else {
          k = k + component.symbol + c.toString()
          component.value = component.symbol + c.toString()
          component.properties.PREFIX = component.value
          ++w
        }

        if (component.children !== null) {
          for (var child in component.children) {
            var pin = component.children[child]
            if (pin.vertex === true) {
              if (pin.edges !== null || pin.edges.length !== 0) {
                for (var wire in pin.edges) {
                  if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                    if (pin.edges[wire].source.edge === true) {
                      // Not Performing any Action for Pin to Wire Connections 
                    } else if (pin.edges[wire].target.edge === true) {
                      // Not Performing any Action for Pin to Wire Connections 
                    } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR' || pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                      pin.edges[wire].node = 0
                      pin.edges[wire].value = 0
                    } else {
                      pin.edges[wire].node = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      pin.ConnectedNode = pin.edges[wire].source.ParentComponent.properties.PREFIX + '.' + pin.edges[wire].source.value
                      pin.edges[wire].value = pin.edges[wire].node
                    }
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
        if (component.properties.VALUE !== undefined) {
          k = k + ' ' + component.properties.VALUE
        }

        if (component.properties.EXTRA_EXPRESSION.length > 0) {
          k = k + ' ' + component.properties.EXTRA_EXPRESSION
        }
        if (component.properties.MODEL.length > 0) {
          k = k + ' ' + component.properties.MODEL.split(' ')[1]
        }
        k = k + ' \n'
      }
    }
  }
  return list
}
// Returns all the Nodes present in the Schematic, Used for Simulation 
export function GenerateNodeList(graph=graph) {
  var list = annotate(graph)
  var a = []
  // Using a Set to avoid duplicate Nodes 
  var netlist = new Set()
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      var compobj = {
        name: '',
        node1: '',
        node2: '',
        magnitude: ''
      }
      // Fetching all the nodes 
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
// Sends a list of components present in the netlist 
export function GenerateCompList(graph=graph) {
  var list = annotate(graph)
  var a = []
  var netlist = [] // This will contain the list of Component Prefix
  var k = 'Unitled netlist \n'
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
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
// Function to Render Circuit XML
export function renderXML() {
  graph.view.refresh()
  var xml = 'null'
  var xmlDoc = mxUtils.parseXml(xml)
  parseXmlToGraph(xmlDoc, graph)
}
// Function to Parse XML and Redraw on Grid
export function parseXmlToGraph(xmlDoc, graph) {
  const cells = xmlDoc.documentElement.children[0].children
  const parent = graph.getDefaultParent()
  var v1
  var yPos
  var xPos
  var props
  var style = graph.getStylesheet().getDefaultVertexStyle()

  style[mxConstants.STYLE_SHAPE] = 'label'
  style[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom'
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
      const vertexId = Number(cellAttrs.id.value)
      const geom = cells[i].children[0].attributes
      const xPos = Number(geom.x.value)
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
      try { props.NAME = cells[i].children[2].attributes.NAME.value } catch (e) { props.NAME = cells[i].children[1].attributes.NAME.value }
      v1.properties = props
      v1.Component = true
      v1.CellType = 'Component'
      if (v1.properties.name === 'VSOURCE') {
      }
      for (var check in props) {
        try { v1.properties[check] = cells[i].children[2].attributes[check].value } catch (e) { try { v1.properties[check] = cells[i].children[1].attributes[check].value } catch (e) { } }
      }
    } else if (cellAttrs.Pin.value === '1') {
      const vertexName = cellAttrs.value.value
      const style = cellAttrs.style.value
      const vertexId = Number(cellAttrs.id.value)
      const geom = cells[i].children[0].attributes
      try { xPos = Number(geom.x.value) } catch (e) { xPos = 0 }
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
      const edgeId = Number(cellAttrs.id.value)
      const source = Number(cellAttrs.sourceVertex.value)
      const target = Number(cellAttrs.targetVertex.value)
      var plist = cells[i].children[1].children
      try {
        var e = graph.insertEdge(parent, edgeId, null,
          graph.getModel().getCell(source),
          graph.getModel().getCell(target)
        )
        e.geometry.points = []
        for (var a in cells[i].children[1].children) {
          try {
            e.geometry.points.push(new mxPoint(Number(plist[a].attributes.x.value), Number(plist[a].attributes.y.value)))
          } catch (e) { }
          graph.getModel().beginUpdate()
          try {
            graph.view.refresh()
          } finally {
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
      }
    }
  }
}

