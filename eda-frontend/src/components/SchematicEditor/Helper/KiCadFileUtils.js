/* eslint-disable */
import store from '../../../redux/store'
import api from '../../../utils/Api'
import { getSvgMetadata } from './SvgParser'
import mxGraphFactory from 'mxgraph'
const {
  mxPoint
} = new mxGraphFactory()

// var edgeHandler
// orientation matrix [x1, y1, x2, y2] (KiCad defined)
// used for defining rotation and x mirrored states
// Actually 12 values but 8 required others are represented as combinations of these 8
const orientations = [
  [1, 0, 0, -1], [0, 1, 1, 0], [-1, 0, 0, 1], [0, -1, -1, 0],
  [1, 0, 0, 1], [0, -1, 1, 0], [1, 0, 0, -1], [0, 1, -1, 0],
  [-1, 0, 0, -1], [0, 1, -1, 0], [1, 0, 0, 1], [0, -1, 1, 0]
]

var graph
var defaultParent

// Scale for the graph
const defScale = 5

// Graph config
export default function KiCadFileUtils (grid) {
  graph = grid
  defaultParent = graph.getDefaultParent()
}

// Reads Kicad .sch files and returns the schematic as instructions
const readKicadSchematic = (text) => {
  const textSplit = text.split('\n')
  let i = 0
  const instructions = {}

  // Metadata and description of the schematic
  for (i = 0; i < textSplit.length; i++) {
    var brk = false
    var splt = textSplit[i].split(' ')
    switch (splt[0]) {
      case '$Descr':
        instructions.pageSize = splt[1]
        instructions.oreientation = parseInt(splt[1]) > parseInt(splt[2]) ? 'L' : 'P'
        break
      case 'Title':
        instructions.title = splt[1].substr(1, splt[1].length - 2)
        break
      case '$EndDescr':
        brk = true
        break
      default:
        break
    }
    if (brk) break
  }

  instructions.components = []
  instructions.wires = []
  instructions.connections = []
  let component = {}
  let wire = {}
  let connection = {}
  for (;i < textSplit.length; i++) {
    let splt = textSplit[i].split(' ')
    switch (splt[0]) {
      case '$Comp':
        i += 1
        component = {}
        splt = textSplit[i].split(' ')
        component.library = splt[1].split(':')[0].trim()
        component.componentName = splt[1].split(':')[1].trim()
        i += 2 // skips identifier line
        splt = textSplit[i].split(' ')
        component.x = parseInt(splt[1])
        component.y = parseInt(splt[2])
        i++
        // skips F command lines
        do {
          i++
        } while (textSplit[i].split(' ')[0] === 'F')
        i += 1 // skips redundanmt x y position line
        var compOrient = textSplit[i].split(' ')
        compOrient[0] = compOrient[0].split('\t')[1]
        compOrient = compOrient.filter(e => e !== '').map(e => parseInt(e))
        var rotation = 0
        var mirrorX = false
        var mirrorY = false
        // checks which orientation matches
        for (let index = 0; index < orientations.length; index++) {
          if (compOrient[0] === orientations[index][0] && compOrient[1] === orientations[index][1] &&
            compOrient[2] === orientations[index][2] && compOrient[3] === orientations[index][3]) {
            rotation = (index % 4) * 90
            if (index > 7) { mirrorY = true } else if (index > 3) { mirrorX = true }
            break
          }
        }
        component.rotation = rotation
        component.mirrorX = mirrorX
        component.mirrorY = mirrorY
        while (textSplit[i].split(' ')[0] !== '$EndComp') {
          i++
        }
        instructions.components.push(component)
        break
      case 'Wire':
        if (splt[1] == 'Wire') {
          i += 1
          wire = {}
          var pos = textSplit[i].split(' ')
          pos = pos.filter(e => e.length !== 0)
          wire.startx = parseInt(pos[0].split('\t')[1])
          wire.starty = parseInt(pos[1])
          wire.endx = parseInt(pos[2])
          wire.endy = parseInt(pos[3])
          instructions.wires.push(wire)
        }
        break
      case 'Connection':
        connection = {}
        var pos = splt
        pos = pos.filter(e => e.length !== 0)
        connection.x = pos[1]
        connection.y = pos[2]
        instructions.connections.push(connection)
        break
      default:
        break
    }
  }
  instructions.wireSegments = [...instructions.wires]
  instructions.wires = reduceWires([...instructions.wires], [...instructions.connections])
  return instructions
}

const loadComponents = async (components, wires) => {
  // API config
  const token = store.getState().authReducer.token
  var config = { headers: { 'Content-Type': 'application/json' } }
  if (token) { config.headers.Authorization = `Token ${token}` }

  // Graph config
  var parent = graph.getDefaultParent()
  var model = graph.getModel()

  const insertComponent = async (comp, compData) => {
    model.beginUpdate()
    try {
      var compCell = await getSvgMetadata(graph, parent, null, null, comp.x / defScale,
      comp.y / defScale, compData, comp.rotation)
      graph.refresh();
    } catch (e) { console.log(e) }
    model.endUpdate()
    return compCell
  }

  // Load all components
  for (let i = 0; i < components.length; i++) {
    // Get component data
    var url = `components/?component_library__library_name__icontains=${components[i].library}&name__icontains=${components[i].componentName}`
    var compCell = await api.get(url, config)
      .then((res) => {
        return insertComponent(components[i], res.data[0])
      })
      components[i].mxCell = compCell
  }
  joinComponents(components, wires)
}

const joinComponents = (components, wires) => {
  const componentCells = []
  var model = graph.getModel()

  components.forEach(comp => {
    graph.getCells(comp.x / defScale, comp.y / defScale, 100, 100, defaultParent, componentCells)
  })

  const checkInBound = (x, y, compMxCell) => {
    let height = compMxCell.geometry.height
    let width = compMxCell.geometry.width
    let angle = compMxCell.getStyle().split('rotation=')
    if (angle[1]) {
      console.log(angle, '\n', angle[1].split(';'))
      angle = parseInt(angle[1].split(';')[0])
      if ((angle / 90) % 2 !== 0) {
        let t = height
        height = width
        width = t
      }
      console.log(angle)
    }

    if (compMxCell.geometry.x + width / 2 >= x &&
      compMxCell.geometry.x - width / 2 <= x &&
      compMxCell.geometry.y + height / 2 >= y &&
      compMxCell.geometry.y - height / 2 <= y) {
      return true
    } else {
      return false
    }
  }

  const findClosestTerminal = (x, y, compCell) => {
    let minDist = Number.MAX_SAFE_INTEGER
    let closestTerm = null
    const compx = compCell.geometry.x - compCell.geometry.width / 2
    const compy = compCell.geometry.y - compCell.geometry.height / 2
    for (let i = 0, child = compCell.getChildAt(i); i < compCell.getChildCount(); i++, child = compCell.getChildAt(i)) {
      if (child.connectable) {
        let distFrmPnt = Math.pow(x - (compx + child.geometry.x), 2) + Math.pow(y - (compy + child.geometry.y), 2)
        if (distFrmPnt < minDist) {
          closestTerm = child
          minDist = distFrmPnt
        }
      }
    }
    return closestTerm
  }

  for (const c in componentCells) {
    for (const w in wires) {
      if (!wires[w].startTerminal || !wires[w].endTerminal) {
        const cbStart = checkInBound(wires[w].startx / defScale, wires[w].starty / defScale, componentCells[c])
        const cbEnd = checkInBound(wires[w].endx / defScale, wires[w].endy / defScale, componentCells[c])
        let terminal
        if (cbStart && !wires[w].startTerminal) {
          // console.log('S', wires[w].startx, wires[w].starty)
          terminal = findClosestTerminal(wires[w].startx / defScale, wires[w].starty / defScale, componentCells[c])
          wires[w].startTerminal = terminal
        } if (cbEnd && !wires[w].endTerminal) {
          // console.log('E', wires[w].endx, wires[w].endy)
          terminal = findClosestTerminal(wires[w].endx / defScale, wires[w].endy / defScale, componentCells[c])
          wires[w].endTerminal = terminal
        }
      }
    }
  }
  // console.log(wires)
  model.beginUpdate()
  wires.forEach(wire => {
    if (wire.startTerminal && wire.endTerminal) {
      var v = graph.insertEdge(defaultParent, null, null, wire.startTerminal, wire.endTerminal)
      console.log(v)
      if (wire.points) {
        v.geometry.points = wire.points.map(p => {return new mxPoint(p.x / defScale, p.y / defScale)})
      }
    }
  })
  model.endUpdate()
}

// Reduces the wires and connections
// TODO Connections
const reduceWires = (wires, connections) => {
  for (let i = 0; i < wires.length; i++) {
    if (wires[i] !== undefined) {
      for (let j = 0; j < wires.length; j++) {
        if (wires[j] !== undefined) {
          if (wires[i].endx === wires[j].startx && wires[i].endy === wires[j].starty) {
            if (wires[i].points) {
              wires[i].points.push({'x': wires[i].endx, 'y': wires[i].endy})
            } else {
              wires[i].points = [{'x': wires[i].endx, 'y': wires[i].endy}]
            }
            wires[i].endx = wires[j].endx
            wires[i].endy = wires[j].endy
            if (i !== j) {
              delete wires[j]
              j = 0
            }
          }
        }
      }
    }
  }
  wires = wires.filter(e => e !== null || e !== undefined)
  return wires
}

export function importSCHFile (fileContents) {
  const rawInstr = readKicadSchematic(fileContents)
  console.log(rawInstr)
  loadComponents([...rawInstr.components], [...rawInstr.wires])
}
