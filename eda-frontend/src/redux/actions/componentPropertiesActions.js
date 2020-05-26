import * as actions from './actions'

export const getCompPropertiess = (compObj) => (dispatch) => {
  dispatch({
    type: actions.GET_COMP_PROPERTIES,
    payload: {
      compObj:compObj
    }
  })
}

export const setCompPropertiess = (compObj) => (dispatch) => {
  dispatch({
    type: actions.SET_COMP_PROPERTIES,
    payload: {
      compObj:compObj
    }
  })
}
