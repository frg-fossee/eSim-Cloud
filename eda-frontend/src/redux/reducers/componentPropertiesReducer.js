import * as actions from '../actions/actions'

const InitialState = {
  compProperties: {}
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.GET_COMP_PROPERTIES: {
      console.log(action.payload.compProperties)
      return {
        ...state,
        compProperties: action.payload.compProperties
      }
    }

    case actions.SET_COMP_PROPERTIES: {
      return {
        ...state
      }
    }

    default:
      return state
  }
}
