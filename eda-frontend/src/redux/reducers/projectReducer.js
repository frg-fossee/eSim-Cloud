import * as actions from '../actions/actions'

const initialState =
{
  details: null,
  reports: null,
  states: null
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_CURRENT_PROJECT: {
      return {
        ...state,
        details: action.payload
      }
    }
    case actions.DELETE_PROJECT: {
      return {
        reports: null,
        details: null,
        states: null
      }
    }
    case actions.FETCH_REPORTS: {
      return {
        ...state,
        reports: action.payload
      }
    }
    case actions.RESOLVE_REPORTS: {
      return {
        ...state,
        reports: null
      }
    }

    case actions.GET_STATES: {
      return {
        ...state,
        states: action.payload
      }
    }
    case actions.SET_STATE: {
      return {
        ...state
      }
    }
    default:
      return state
  }
}
