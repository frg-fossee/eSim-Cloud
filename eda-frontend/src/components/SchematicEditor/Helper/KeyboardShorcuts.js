/* eslint-disable new-cap */
import MxGraphFactory from 'mxgraph'
import { Undo, Redo, ZoomIn, ZoomOut, ZoomAct } from './ToolbarTools'

const {
  mxKeyHandler,
  mxEvent,
  mxClient
} = new MxGraphFactory()

export default function KeyboardShortcuts (graph) {
  var keyHandler = new mxKeyHandler(graph)

  keyHandler.getFunction = function (evt) {
    if (evt != null) {
      return (mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey)) ? this.controlKeys[evt.keyCode] : this.normalKeys[evt.keyCode]
    }

    return null
  }

  // Delete - Del
  // keyHandler.bindKey(46, function (evt) {
  //   if (graph.isEnabled()) {
  //     graph.removeCells()
  //   }
  // })

  // Undo - Ctrl + Z
  keyHandler.bindControlKey(90, function (evt) {
    if (graph.isEnabled()) {
      Undo()
    }
  })

  // Redo - Ctrl + A
  keyHandler.bindControlKey(65, function (evt) {
    if (graph.isEnabled()) {
      Redo()
    }
  })

  // Zoom In - Ctrl + I
  keyHandler.bindControlKey(73, function (evt) {
    if (graph.isEnabled()) {
      ZoomIn()
    }
  })

  // Zoom Out - Ctrl + O
  keyHandler.bindControlKey(79, function (evt) {
    if (graph.isEnabled()) {
      ZoomOut()
    }
  })

  // Zoom Out - Ctrl + Y
  keyHandler.bindControlKey(89, function (evt) {
    if (graph.isEnabled()) {
      ZoomAct()
    }
  })
}
