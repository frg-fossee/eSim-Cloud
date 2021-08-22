import * as actions from './actions'

// Actions for listing stored component properites on double click on component
export const getCompProperties = (id, compProperties, x, y) => (dispatch) => {
  dispatch({
    type: actions.GET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties,
      x: x,
      y: y
    }
  })
}

// Actions for updating entered component properites on clicking set parameters
export const setCompProperties = (id, compProperties) => (dispatch) => {
  dispatch({
    type: actions.SET_COMP_PROPERTIES,
    payload: {
      id: id,
      compProperties: compProperties
    }
  })
}

// handleing hiding of component properties sidebar
export const closeCompProperties = () => (dispatch) => {
  dispatch({
    type: actions.CLOSE_COMP_PROPERTIES
  })
}
