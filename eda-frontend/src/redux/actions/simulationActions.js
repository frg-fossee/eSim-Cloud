import * as actions from './actions'

export const setResultTitle = (title) => (dispatch) => {
  dispatch({
    type: actions.SET_RESULT_TITLE,
    payload: {
      title: title
    }
  })
}
export const setResultGraph = (graph) => (dispatch) => {
  dispatch({
    type: actions.SET_RESULT_GRAPH,
    payload: {
      graph: graph
    }
  })
}

export const setResultText = (text) => (dispatch) => {
  dispatch({
    type: actions.SET_RESULT_TEXT,
    payload: {
      text: text
    }
  })
}
