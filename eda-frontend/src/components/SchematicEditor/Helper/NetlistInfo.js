// mport AddSideBarComponentDOMd from './DraggableDOM.js'
import MxGraphFactory from 'mxgraph'
// eslint-disable-next-line
 const {mxGraph, mxRubberband, mxClient, mxUtils, mxEvent, mxPoint, mxDragSource} = new MxGraphFactory()

export default function NetlistInfoFunct (graph) {
  /* I need to get information of the components that are displayed on my graph */
  /* I will use mxgraph functions to achieve this, I have no idea how, A lot of googling awaits and I'll be going through documentations */
  /* stay with my */
  /* var root = graph.pageFormat
  var portsEnabled = graph.portsEnabled
  console.log(root)
  console.log(portsEnabled) */
  var taponhold = graph.tapAndHoldInProgress
  // console.log(taponhold)
  // eslint-disable-next-line eqeqeq
  if (taponhold == true) {
    alert(true)
  }
}
