/* eslint-disable new-cap */
import MxGraphFactory from 'mxgraph'
import { Undo, Redo, ZoomIn, ZoomOut, ZoomAct, DeleteComp, ClearGrid, Rotate, RotateACW } from './ToolbarTools'

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

  // Rotate Alt + (right arrow)
  keyHandler.bindKey(39, function (evt) {
    if (graph.isEnabled) {
      if (evt.altKey) {
        Rotate()
      }
    }
  })

  // Rotate Alt + (left Arrow)
  keyHandler.bindKey(37, function (evt) {
    if (graph.isEnabled) {
      if (evt.altKey) {
        RotateACW()
      }
    }
  })

  // Delete - Del / Clear All - Shift + Del
  keyHandler.bindKey(46, function (evt) {
    if (graph.isEnabled()) {
      if (evt.shiftKey) {
        ClearGrid()
      } else {
        DeleteComp()
      }
    }
  })

  // Undo - Ctrl + Z / Redo - Ctrl + Shift + Z
  keyHandler.bindControlKey(90, function (evt) {
    if (graph.isEnabled()) {
      if (evt.ctrlKey && !evt.shiftKey) {
        Undo()
      } else if (evt.ctrlKey && evt.shiftKey) {
        Redo()
      }
    }
  })

  // Zoom In - Ctrl + +
  keyHandler.bindControlKey(187, function (evt) {
    evt.preventDefault()
    if (graph.isEnabled()) {
      ZoomIn()
    }
  })
  keyHandler.bindControlKey(107, function (evt) {
    evt.preventDefault()
    if (graph.isEnabled()) {
      ZoomIn()
    }
  })

  // Zoom Out - Ctrl + -
  keyHandler.bindControlKey(189, function (evt) {
    evt.preventDefault()
    if (graph.isEnabled()) {
      ZoomOut()
    }
  })
  keyHandler.bindControlKey(109, function (evt) {
    evt.preventDefault()
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
