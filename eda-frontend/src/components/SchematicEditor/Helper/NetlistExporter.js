/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable eqeqeq */

import mxGraphFactory from 'mxgraph'
const { mxCell } = new mxGraphFactory()

/**
 * Performs ERC check before netlist generation
 * @param {mxGraph} graph - The mxGraph editor instance
 * @returns {Object} { isValid, vertexCount, errorCount, pinNC, ground, errorMsg }
 */
export function checkNetlistErc(graph) {
  var list = graph.getModel().cells
  var vertexCount = 0
  var errorCount = 0
  var PinNC = 0
  var ground = 0
  for (var property in list) {
    var cell = list[property]
    if (cell.Component === true) {
      for (var child in cell.children) {
        if (child.connectable) {
          var childVertex = cell.children[child]
          if (childVertex.Pin === true && childVertex.edges === null) {
            ++PinNC
            ++errorCount
          }
        }
      }
      ++vertexCount
    }
    if (cell.symbol === 'PWR') {
      ++ground
    }
  }
  
  let errorMsg = null
  if (vertexCount === 0) {
    errorMsg = 'No Component added'
  } else if (PinNC !== 0) {
    errorMsg = 'Pins not connected'
  } else if (ground === 0) {
    errorMsg = 'Ground not connected'
  }

  return {
    isValid: (vertexCount > 0 && PinNC === 0 && ground > 0 && errorCount === 0),
    errorCount,
    vertexCount,
    pinNC: PinNC,
    ground,
    errorMsg
  }
}

class Stack {
    constructor(){
        this.data = [];
        this.top = 0;
    }
    push(element) {
      this.data[this.top] = element;
      this.top = this.top + 1;
    }
   length() {
      return this.top;
   }
   peek() {
      return this.data[this.top-1];
   }
   isEmpty() {
     return this.top === 0;
   }
   pop() {
    if( this.isEmpty() === false ) {
       this.top = this.top -1;
       return this.data.pop(); // removes the last element
     }
   }
   print() {
      var top = this.top - 1; // because top points to index where new    element to be inserted
      while(top >= 0) { // print upto 0th index
           top--;
      }
    }
    reverse() {
       this._reverse(this.top - 1 );
    }
    _reverse(index) {
       if(index != 0) {
          this._reverse(index-1);
       }
    }
}

function traverseWire(edge, vis) {
  var ans = []
  vis[edge.id] = 1
  if (edge.target.vertex == true || edge.source.vertex == true) {
    //check for edges connected to such an edge 
    if (edge.target.vertex == true) { ans.push(edge.target) }
    if (edge.source.vertex == true) { ans.push(edge.source) }
    return ans;
  } else {
    vis[parseInt(edge.id)] = true
    if (edge.edges && edge.edges.length > 0) {
      edge.edges.forEach((elem) => {
        ans = ans.concat(traverseWire(elem, vis))
      })
    } else {
      if (edge.source.edge == true && !vis[edge.source.id]) {
        ans = ans.concat(traverseWire(edge.source, vis))
      }
      if (edge.target.edge == true && !vis[edge.target.id]) {
        ans = ans.concat(traverseWire(edge.target, vis))
      }
    }
    return ans
  }
}

/**
 * Annotates the graph components with connected nodes
 * @param {mxGraph} graph - The mxGraph editor instance
 * @returns {Object} List of cells
 */
export function annotate(graph) {
  var r = 1;
  var v = 1;
  var c = 1;
  var l = 1;
  var d = 1;
  var q = 1;
  var w = 1;
  var list = graph.getModel().cells;

  // DFS _________
  var NODE_SETS = [];
  var mp = Array(5000).fill(0);
  NODE_SETS[0] = new Set(); // Defining ground

  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      mxCell.prototype.ConnectedNode = null;
      var component = list[property];

      if (component.children !== null) {
        // pins
        for (var child in component.children) {
          var pin = component.children[child];

          if (pin != null && pin.vertex === true && pin.connectable) {
            if (pin.edges !== null && pin.edges.length !== 0) {
              if (mp[pin.id] === 1) {
                continue;
              }
              var stk = new Stack();
              var cur_node;
              var cur_set = [];
              var contains_gnd = 0;

              stk.push(pin);
              stk.push(pin);
              stk.push(pin);

              while (!stk.isEmpty()) {
                cur_node = stk.peek();
                stk.pop();
                mp[cur_node.id] = 1;
                cur_set.push(cur_node);

                for (var wire in cur_node.edges) {
                  if (cur_node.edges[wire].source !== null && cur_node.edges[wire].target !== null) {
                    if (
                      (cur_node.edges[wire].target.ParentComponent !== null &&
                        cur_node.edges[wire].target.ParentComponent.symbol === 'PWR') ||
                      (cur_node.edges[wire].source.ParentComponent !== null &&
                        cur_node.edges[wire].source.ParentComponent.symbol === 'PWR')
                    ) {
                      contains_gnd = 1;
                    }

                    if (cur_node.edges[wire].target.vertex === true) {
                      if (
                        cur_node.edges[wire].target.id !== cur_node.id &&
                        !mp[cur_node.edges[wire].target.id]
                      ) {
                        stk.push(cur_node.edges[wire].target);
                      }
                    }

                    if (cur_node.edges[wire].source.vertex === true) {
                      if (
                        cur_node.edges[wire].source.id !== cur_node.id &&
                        !mp[cur_node.edges[wire].source.id]
                      ) {
                        stk.push(cur_node.edges[wire].source);
                      }
                    }

                    var conn_vertices = [];
                    if (cur_node.edges[wire].edges && cur_node.edges[wire].edges.length > 0) {
                      for (const ed in cur_node.edges[wire].edges) {
                        if (!mp[cur_node.edges[wire].edges[ed].id]) {
                          conn_vertices = conn_vertices.concat(...traverseWire(cur_node.edges[wire].edges[ed], mp));
                        }
                      }
                    }

                    if (cur_node.edges[wire].source.edge === true) {
                      if (
                        cur_node.edges[wire].source.id !== cur_node.id &&
                        !mp[cur_node.edges[wire].source.id]
                      ) {
                        conn_vertices = conn_vertices.concat(...traverseWire(cur_node.edges[wire].source, mp));
                      }
                    }

                    if (cur_node.edges[wire].target.edge === true) {
                      if (
                        cur_node.edges[wire].target.id !== cur_node.id &&
                        !mp[cur_node.edges[wire].target.id]
                      ) {
                        conn_vertices = conn_vertices.concat(...traverseWire(cur_node.edges[wire].target, mp));
                      }
                    }

                    conn_vertices.forEach((elem) => {
                      stk.push(elem);
                    });
                  }
                }
              }

              if (contains_gnd === 1) {
                for (var x in cur_set) {
                  NODE_SETS[0].add(cur_set[x]);
                }
              } else {
                NODE_SETS.push(new Set(cur_set));
              }
            }
          }
        }
      }
    }
  }

  for (var cellId in list) {
    if (list[cellId].Component === true && list[cellId].symbol !== 'PWR') {
      mxCell.prototype.ConnectedNode = null;
      var compNode = list[cellId];

      if (compNode.symbol === 'R') {
        component.value = component.symbol + r.toString();
        component.properties.PREFIX = component.value;
        ++r;
      } else if (compNode.symbol === 'V') {
        compNode.value = compNode.symbol + v.toString();
        compNode.properties.PREFIX = compNode.value;
        ++v;
      } else if (compNode.symbol === 'C') {
        compNode.value = compNode.symbol + c.toString();
        compNode.properties.PREFIX = compNode.value;
        ++c;
      } else if (compNode.symbol === 'D') {
        compNode.value = compNode.symbol + d.toString();
        compNode.properties.PREFIX = compNode.value;
        ++d;
      } else if (compNode.symbol === 'Q') {
        compNode.value = compNode.symbol + q.toString();
        compNode.properties.PREFIX = compNode.value;
        ++q;
      } else {
        compNode.value = compNode.symbol + w.toString();
        compNode.properties.PREFIX = compNode.value;
        ++w;
      }

      if (compNode.children !== null) {
        for (var childIdx in compNode.children) {
          var pinElem = compNode.children[childIdx];

          if (pinElem.vertex === true && pinElem.connectable) {
            if (pinElem.edges !== null && pinElem.edges.length !== 0) {
              NODE_SETS.forEach((e, i) => {
                var done = 0;
                e.forEach((vertex) => {
                  if (vertex.id == pinElem.id && done === 0) {
                    if (i === 0) {
                      pinElem.edges[0].node = 0;
                      pinElem.ConnectedNode = 0;
                      pinElem.edges[0].value = pinElem.edges[0].node;
                    } else {
                      pinElem.edges[0].node = 'COM.' + i.toString();
                      pinElem.ConnectedNode = 'COM.' + i.toString();
                      pinElem.edges[0].value = pinElem.edges[0].node;
                    }
                    done = 1;
                  }
                });
              });
            }
          }
          // Additional condition to handle ground connection
          if (pinElem.edges !== null && pinElem.edges.length !== 0) {
            pinElem.edges.forEach((edge) => {
              if (
                edge.target === null ||
                edge.target.ParentComponent === null ||
                (edge.target.ParentComponent.symbol !== 'PWR' && edge.target.ParentComponent.symbol !== 'GND')
              ) {
                if (pinElem.ConnectedNode === 0) {
                  edge.node = 0;
                  edge.value = edge.node;
                } else {
                  edge.node = pinElem.ConnectedNode;
                  edge.value = edge.node;
                }
              }
            });
          }
        }
      }
    }
  }

  return list;
}

/**
 * Builds SPICE netlist text from mxGraph instance
 * @param {mxGraph} graph - The mxGraph editor instance
 * @returns {Object} { models: string, main: string, componentlist: Array, nodelist: Set }
 */
export function buildNetlistFromGraph(graph) {
  var r = 1
  var v = 1
  var c = 1
  var spiceModels = ''
  var compDetails = {
    componentlist: [],
    nodelist: new Set()
  }
  var k = ''
  
  var list = annotate(graph)
  
  for (var property in list) {
    if (list[property].Component === true && list[property].symbol !== 'PWR') {
      var compobj = {
        name: '',
        magnitude: ''
      }
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
          if (pin.vertex === true && pin.connectable) {
            if (pin.edges !== null && pin.edges.length !== 0) {
              for (var wire in pin.edges) {
                if (pin.edges[wire].source !== null && pin.edges[wire].target !== null) {
                  // Wire to Pin Connection 
                  if (pin.edges[wire].source.edge === true) {
                    pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                    pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    // Pin to Wire Connection 
                  } else if (pin.edges[wire].target.edge === true) {
                    pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                    pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    pin.edges[wire].tarx = pin.edges[wire].geometry.targetPoint.x
                    pin.edges[wire].tary = pin.edges[wire].geometry.targetPoint.y
                    // Souce or Target is Ground 
                  } else if (pin.edges[wire].source.ParentComponent.symbol === 'PWR'  ||  pin.edges[wire].target.ParentComponent.symbol === 'PWR') {
                    pin.edges[wire].value = 0
                    pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                    pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    // Pin to Pin Connection, Setting the Source to be the Node Value 
                  } else {
                    pin.edges[wire].sourceVertex = pin.edges[wire].source.id
                    pin.edges[wire].targetVertex = pin.edges[wire].target.id
                    pin.edges[wire].value = pin.edges[wire].node
                  }
                  pin.edges[wire].value = pin.edges[wire].node
                }
              }
              k = k + ' ' + pin.edges[0].node
            } else {
              k = k + ' NC'
            }
          }
        }
        compobj.name = component.symbol
        compobj.magnitude = 10
        var nodeNumber = 0
        for(var childIdx in component.children){
            nodeNumber++
            var pinEdges = component.children[childIdx].edges
            var nodeVal = (pinEdges && pinEdges.length > 0 && pinEdges[0].node !== undefined) ? pinEdges[0].node : 'NC'
            compobj['node' + nodeNumber.toString()] = nodeVal
            if (nodeVal !== 'NC') {
              compDetails.nodelist.add(nodeVal)
            }
        }
        compDetails.componentlist.push(component.properties.PREFIX)
      }

      if (component.properties.MODEL && component.properties.MODEL.length > 0) {
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
      } else if (component.properties.PREFIX.charAt(0) === 'C' || component.properties.PREFIX.charAt(0) === 'c') {
        k = k + ' ' + component.properties.VALUE
        if (component.properties.IC != 0) {
          k = k + ' IC=' + component.properties.IC
        }
        component.value = component.value + '\n' + component.properties.VALUE
      } else if (component.properties.PREFIX.charAt(0) === 'L' || component.properties.PREFIX.charAt(0) === 'l') {
        k = k + ' ' + component.properties.VALUE
        if (component.properties.IC != 0) {
          k = k + ' IC=' + component.properties.IC
        }
        if (component.properties.DTEMP != 27) {
          k = k + ' dtemp=' + component.properties.DTEMP
        }
        component.value = component.value + '\n' + component.properties.VALUE
      } else if (component.properties.PREFIX.charAt(0) === 'M' || component.properties.PREFIX.charAt(0) === 'm') {
        if (component.properties.MULTIPLICITY_PARAMETER != 1) {
          k = k + ' m=' + component.properties.MULTIPLICITY_PARAMETER
        }
        if (component.properties.DTEMP != 27) {
          k = k + ' dtemp=' + component.properties.DTEMP
        }
      } else if (component.properties.PREFIX.charAt(0) === 'Q' || component.properties.PREFIX.charAt(0) === 'q') {
        if (component.properties.MULTIPLICITY_PARAMETER != 1) {
          k = k + ' m=' + component.properties.MULTIPLICITY_PARAMETER
        }
        if (component.properties.DTEMP != 27) {
          k = k + ' dtemp=' + component.properties.DTEMP
        }
      } else if (component.properties.PREFIX.charAt(0) === 'R' || component.properties.PREFIX.charAt(0) === 'r') {
        k = k + ' ' + component.properties.VALUE
        if (component.properties.SHEET_RESISTANCE != 0) {
          k = k + ' RSH=' + component.properties.SHEET_RESISTANCE
        }
        if (component.properties.FIRST_ORDER_TEMPERATURE_COEFF != 0) {
          k = k + ' tc1=' + component.properties.FIRST_ORDER_TEMPERATURE_COEFF
        }
        if (component.properties.SECOND_ORDER_TEMPERATURE_COEFF != 0) {
          k = k + ' tc2=' + component.properties.SECOND_ORDER_TEMPERATURE_COEFF
        }
        if (component.properties.PARAMETER_MEASUREMENT_TEMPERATURE != 27) {
          k = k + ' TNOM=' + component.properties.PARAMETER_MEASUREMENT_TEMPERATURE
        }
        component.value = component.value + '\n' + component.properties.VALUE
      } else {
        if (component.properties.VALUE !== undefined) {
          k = k + ' ' + component.properties.VALUE
          component.value = component.value + '\n' + component.properties.VALUE
        }
      }

      if (component.properties.EXTRA_EXPRESSION && component.properties.EXTRA_EXPRESSION.length > 0) {
        k = k + ' ' + component.properties.EXTRA_EXPRESSION
        component.value = component.value + ' ' + component.properties.EXTRA_EXPRESSION
      }

      if (component.properties.MODEL && component.properties.MODEL.length > 0) {
        spiceModels += component.properties.MODEL + '\n'
      }

      k = k + ' \n'
    }
  }

  return {
    models: spiceModels,
    main: k,
    componentlist: compDetails.componentlist,
    nodelist: compDetails.nodelist
  }
}

export const sanitizeNetlistForExport = (code) => {
  const codeArray = code.split('\n')
  let cleanCode = ''
  let frontPlot = ''
  for (let line = 0; line < codeArray.length; line++) {
    if (codeArray[line].includes('plot') && !codeArray[line].includes('setplot')) {
      frontPlot += codeArray[line].split('plot ')[1] + ' '
    }
  }
  frontPlot = `print ${frontPlot} > data.txt \n`
  let flag = 0
  for (let i = 0; i < codeArray.length; i++) {
    if (codeArray[i].includes('plot') && !codeArray[i].includes('setplot')) {
      if (!flag) {
        cleanCode += frontPlot
        flag = 1
      }
    } else {
      cleanCode += codeArray[i] + '\n'
    }
  }
  return cleanCode
}
