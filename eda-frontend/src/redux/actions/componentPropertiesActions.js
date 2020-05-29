import * as actions from './actions'

export const getCompProperties = (id, compProperties) => (dispatch) => {
  dispatch({
    type: actions.GET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties
    }
  })
}

export const setCompProperties = (id, compProperties) => (dispatch) => {
  dispatch({
    type: actions.SET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties
    }
  })
}

export const closeCompProperties = () => (dispatch) => {
  dispatch({
    type: actions.CLOSE_COMP_PROPERTIES
  })
}
