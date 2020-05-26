import * as actions from './actions'

export const getCompPropertiess = (compProperties) => (dispatch) => {
  dispatch({
    type: actions.GET_COMP_PROPERTIES,
    payload: {
      compProperties
    }
  })
}

export const setCompPropertiess = (compProperties) => (dispatch) => {
  dispatch({
    type: actions.SET_COMP_PROPERTIES,
    payload: {
      compProperties
    }
  })
}
