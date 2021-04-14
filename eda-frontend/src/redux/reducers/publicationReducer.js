import * as actions from '../actions/actions'

const initialState =
{
  details:{},
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_CURRENT_PUBLICATION: {
      return {
        ...state,
        details: action.payload
      }
    }
    default:
      return state
  }
}