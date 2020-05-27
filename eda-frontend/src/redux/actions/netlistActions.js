import * as actions from './actions'

export const setNetlist = (netlist) => (dispatch) => {
  dispatch({
    type: actions.SET_NETLIST,
    payload: {
      netlist: netlist
    }
  })
}

export const setTitle = (title) => (dispatch) => {
  dispatch({
    type: actions.SET_TITLE,
    payload: {
      title: title
    }
  })
}

export const setModel = (model) => (dispatch) => {
  dispatch({
    type: actions.SET_MODEL,
    payload: {
      model: model
    }
  })
}

export const setControlLine = (controlLine) => (dispatch) => {
  dispatch({
    type: actions.SET_CONTROL_LINE,
    payload: {
      controlLine: controlLine
    }
  })
}

export const setControlBlock = (controlBlock) => (dispatch) => {
  dispatch({
    type: actions.SET_CONTROL_BLOCK,
    payload: {
      controlBlock: controlBlock
    }
  })
}
