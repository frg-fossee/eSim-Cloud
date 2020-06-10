import * as actions from '../actions/actions'

const InitialState = {
  schematics: []
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_SCHEMATICS: {
      return {
        ...state,
        schematics: action.payload
      }
    }

    default:
      return state
  }
}
