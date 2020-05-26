import * as actions from '../actions/actions'

const InitialState = {
  compObj: {}
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.GET_COMP_PROPERTIES: {
      console.log(action.payload.compObj)
      return {
        ...state,

        compObj:action.payload.compObj
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
