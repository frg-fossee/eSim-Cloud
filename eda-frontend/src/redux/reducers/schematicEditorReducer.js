import * as actions from '../actions/actions'

const InitialState = {
  libraries: []
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_LIBRARIES:
      return { ...state, libraries: action.payload }

    default:
      return state
  }
}
