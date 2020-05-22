/* eslint-disable camelcase */
let pinData, metadata, pinList
let currentPin, x_pos, y_pos
let width, height

// we need to divide the svg width and height by the same number in order to maintain the aspect ratio.
const fixed_number = 5

function extractData (xml) {
  pinData = []
  metadata = xml.getElementsByTagName('metadata')
  const width = metadata[0].attributes[0].nodeValue
  const height = metadata[0].attributes[1].nodeValue

  pinList = metadata[0].childNodes
  // console.log(metadata)
  // console.log(xmlDoc)
  // console.log(width,height)
  pinList.forEach(function (pin) {
    const pinNumber = pin.tagName.split('-').pop()
    const pinX = pin.getElementsByTagName('x')[0].innerHTML
    const pinY = pin.getElementsByTagName('y')[0].innerHTML
    const pinType = pin.getElementsByTagName('type')[0].innerHTML.trim()
    pinData.push({ pinNumber: pinNumber, pinX: pinX, pinY: pinY, type: pinType })
    // console.log(pinNumber, pinX, pinY, pinType)
  })
  return {
    width: width,
    height: height,
    pinData: pinData
  }
}

function getMetadataXML (path, graph, parent, evt, target, x, y) {
  fetch(path)
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
      // MX GRAPHS TRY BLOCK HAS BEEN SHIFTED HERE.
      const pins = []
      width = data.width
      height = data.height
      pinData = data.pinData

      width = width / fixed_number
      height = height / fixed_number

      const v1 = graph.insertVertex(
        parent,
        null,
        '',
        x,
        y,
        width,
        height,
        'shape=image;image=' + path + ';'
      )
      v1.Component = true
      var newsource = path
      var prefix = newsource.split('/')
      v1.CellType = prefix[0]
      v1.setConnectable(false)
      for (let i = 0; i < pinData.length; i++) {
        currentPin = pinData[i]

        // move this to another file

        x_pos = (parseInt(width) / 2 + parseInt(currentPin.pinX) / fixed_number) - 2
        y_pos = (parseInt(height) / 2 - parseInt(currentPin.pinY) / fixed_number) - 2

        // move this to another file
        // eslint-disable-next-line
        pins[i] = graph.insertVertex(v1, null, '', x_pos, y_pos, 3, 3, 'align=top;verticalAlign=top;' + 'fontColor=' + 'black' + ';strokeColor=' + 'black');
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
    })
}

export default getMetadataXML
