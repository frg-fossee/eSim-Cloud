import store from '../../../redux/store'
import api from '../../../utils/Api'
import { getSvgMetadata } from './SvgParser'

// orientation matrix [x1, y1, x2, y2] (KiCad defined)
// used for defining rotation and x mirrored states
// Actually 12 values but 8 required others are represented as combinations of these 8
const orientations = [
  [1, 0, 0, -1], [0, 1, 1, 0], [-1, 0, 0, 1], [0, -1, -1, 0],
  [1, 0, 0, 1], [0, -1, 1, 0], [1, 0, 0, -1], [0, 1, -1, 0],
  [-1, 0, 0, -1], [0, 1, -1, 0], [1, 0, 0, 1], [0, -1, 1, 0]
]

var graph

// Graph config
export default function KiCadFileUtils (grid) {
  graph = grid
}

// Reads Kicad .sch files and returns the schematic as instructions
function readKicadSchematic (text) {
  const textSplit = text.split('\n')
  let i = 0
  const instructions = {}

  // Metadata and description of the schematic
  for (i = 0; i < textSplit.length; i++) {
    var brk = false
    switch (textSplit[i].split(' ')[0]) {
      case '$Descr':
        instructions.pageSize = textSplit[i].split(' ')[1]
        break
      case 'Title':
        instructions.title = textSplit[i].split(' ')[1].substr(1, textSplit[i].split(' ')[1].length - 2)
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
    switch (textSplit[i].split(' ')[0]) {
      case '$Comp':
        i += 1
        component = {}
        component.library = textSplit[i].split(' ')[1].split(':')[0]
        component.componentName = textSplit[i].split(' ')[1].split(':')[1]
        i += 2 // skips identifier line
        component.x = parseInt(textSplit[i].split(' ')[1])
        component.y = parseInt(textSplit[i].split(' ')[2])
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
        i += 1
        wire = {}
        var poss = textSplit[i].split(' ')
        wire.startx = parseInt(poss[0].split('\t')[1])
        wire.starty = parseInt(poss[1])
        wire.endx = parseInt(poss[2])
        wire.endy = parseInt(poss[3])
        instructions.wires.push(wire)
        break
      case 'Connection':
        connection = {}
        connection.x = textSplit[i].split(' ')[2]
        connection.y = textSplit[i].split(' ')[3]
        instructions.connections.push(connection)
        break
      default:
        break
    }
  }
  return instructions
}

async function loadIntructions (instructions) {
  // API config
  const token = store.getState().authReducer.token
  const config = { headers: { 'Content-Type': 'application/json' } }
  if (token) { config.headers.Authorization = `Token ${token}` }

  // Graph config
  const parent = graph.getDefaultParent()

  // Load all components
  for (let i = 0; i < instructions.components.length; i++) {
    // Get component data
    const url = `components/?component_library__library_name__icontains=
      ${instructions.components[i].library}
      &name__icontains=${instructions.components[i].componentName}`
    const componentData = await api.get(url, config)
      .then(res => { return res.data[0] })
    // Add compoennt to graph
    getSvgMetadata(graph, parent, null, null, instructions.components[i].x / 10, instructions.components[i].y / 10, componentData)
  }
}

export function importSCHFile (fileContents) {
  const rawInstr = readKicadSchematic(fileContents)
  loadIntructions(rawInstr)
}
