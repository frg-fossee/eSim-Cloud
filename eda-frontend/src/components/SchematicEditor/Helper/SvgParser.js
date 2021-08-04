/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import mxGraphFactory from 'mxgraph'
import ComponentParameters from './ComponentParametersData'
import { rotateCell } from './ToolbarTools'
const {
  mxConstants
} = new mxGraphFactory()

let pinData, metadata, pinList, pinName, pinOrientation, pinLength, pinShape
let currentPin, x_pos, y_pos
let width, height, symbolName

// we need to divide the svg width and height by the same number in order to maintain the aspect ratio.
const default_scale = 5

function extractData (xml) {
  // extracting metadata from the svg file.

  pinData = []
  metadata = xml.getElementsByTagName('metadata')
  const width = metadata[0].attributes[0].nodeValue
  const height = metadata[0].attributes[1].nodeValue
  const symbolName = metadata[0].attributes[4].nodeValue
  pinList = metadata[0].childNodes
  // console.log(metadata)
  // console.log(xmlDoc)
  // console.log(width,height)
  pinList.forEach(function (pin) {
    const pinNumber = pin.tagName.split('-').pop()
    const pinX = pin.getElementsByTagName('x')[0].innerHTML
    const pinY = pin.getElementsByTagName('y')[0].innerHTML
    const pinType = pin.getElementsByTagName('type')[0].innerHTML.trim()
    const pinName = pin.getElementsByTagName('name')[0].innerHTML.trim()
    const pinOrientation = pin.getElementsByTagName('orientation')[0].innerHTML.trim()
    const pinLength = pin.getElementsByTagName('length')[0].innerHTML.trim()
    const pinShape = pin.getElementsByTagName('pinShape')[0].innerHTML.trim()

    pinData.push({
      pinNumber: pinNumber,
      pinX: pinX,
      pinY: pinY,
      type: pinType,
      pinName: pinName,
      pinOrientation: pinOrientation,
      pinLength: pinLength,
      pinShape: pinShape
    })
    // console.log(pinNumber, pinX, pinY, pinType)
  })
  return {
    width: width,
    height: height,
    symbolName: symbolName,
    pinData: pinData
  }
}

export function getSvgMetadata (graph, parent, evt, target, x, y, component, rotation = 0, centerCoords = false) {
  // calls extractData and other MXGRAPH functions
  // initialize information from the svg meta
  // plots pinnumbers and component labels.

  var path = '../' + component.svg_path

  return fetch(path)
    .then(function (response) {
      return response.text()
    })
    .then(function (data) {
      const parser = new DOMParser()
      const xml = parser.parseFromString(data, 'text/xml')
      // console.log(xmlDoc);
      data = extractData(xml)
      // console.log(data)
      return data
    }).then(function (data) {
      const pins = []
      width = data.width
      height = data.height
      pinData = data.pinData

      // console.log(pinData)

      // Disables moving of vertex labels
      graph.vertexLabelsMovable = false

      // Creates a style with an indicator
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
      // delete style[mxConstants.STYLE_FILLCOLOR] // transparent

      // make the component images larger by reducing the denominator and smaller by increasing the denominator
      width = width / default_scale
      height = height / default_scale

      if (centerCoords) {
        if (rotation !== 0 && (rotation / 90) % 2 !== 0) {
          x = x - height / 2
          y = y - width / 2
        } else {
          x = x - width / 2
          y = y - height / 2
        }
      }

      const v1 = graph.insertVertex(
        parent,
        null,
        component.name,
        x,
        y,
        width,
        height,
        'shape=image;fontColor=blue;image=' + path + ';imageVerticalAlign=bottom;verticalAlign=bottom;imageAlign=bottom;align=bottom;spacingLeft=25;'
      )
      v1.Component = true
      /* var newsource = path
      var prefix = newsource.split('/')
      var symboltype = prefix[3].split('') */
      v1.CellType = 'Component'
      v1.symbol = component.symbol_prefix.toUpperCase()
      v1.CompObject = component

      component.name = component.name.toUpperCase()
      var props = {}
      if (v1.symbol === 'V') {
        // console.log('voltage')

        if (ComponentParameters[v1.symbol][component.name] === undefined) {
          props = Object.assign({}, ComponentParameters[v1.symbol].VSOURCE)
        } else {
          props = Object.assign({}, ComponentParameters[v1.symbol][component.name])
        }
      } else if (v1.symbol === 'I') {
        // console.log('CURRENT')
        if (ComponentParameters[v1.symbol][component.name] === undefined) {
          props = Object.assign({}, ComponentParameters[v1.symbol].ISOURCE)
        } else {
          props = Object.assign({}, ComponentParameters[v1.symbol][component.name])
        }
      } else {
        // console.log('other')

        props = Object.assign({}, ComponentParameters[v1.symbol])
      }
      props.NAME = component.name
      v1.properties = props
      // console.log('component', component)
      // console.log('v1.properties', v1.properties)

      v1.setConnectable(false)
      let i = 0
      for (i = 0; i < pinData.length; i++) {
        currentPin = pinData[i]
        if (currentPin.pinName === 'NC') continue
        // move this to another file
        x_pos = (parseInt(width) / 2 + parseInt(currentPin.pinX) / default_scale)
        y_pos = (parseInt(height) / 2 - parseInt(currentPin.pinY) / default_scale) - 1

        // move this to another file
        // eslint-disable-next-line

        if (currentPin.pinOrientation === 'L') {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=bottom;rotation=0')
        } else if (currentPin.pinOrientation === 'R') {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=left;verticalAlign=bottom;rotation=0')
        } else if (currentPin.pinOrientation === 'U') {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=bottom;rotation=0')
        } else {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=up;rotation=0')
        }
        pins[i].geometry.relative = false
        pins[i].Pin = true
        if (currentPin.type === 'I') {
          pins[i].pinType = 'Input'
        } else {
          pins[i].pinType = 'Output'
        }
        // pins[i].pinType = currentPin['type']
        pins[i].ParentComponent = v1
        pins[i].PinNumber = currentPin.pinNumber
      }
      if (rotation !== 0) { rotateCell(v1, rotation) }

      return v1
    })
}
