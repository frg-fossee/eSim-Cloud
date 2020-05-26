import * as actions from './actions'

export const getCompPropertiess = (id, compProperties) => (dispatch) => {
  dispatch({
    type: actions.GET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties
    }
  })
}

export const setCompPropertiess = (id, compProperties) => (dispatch) => {
  dispatch({
    type: actions.SET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties
    }
  })
}
