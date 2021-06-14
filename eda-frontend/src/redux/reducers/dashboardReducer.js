import * as actions from '../actions/actions'

const InitialState = {
  schematics: [],
  myProjects: [],
  publicProjects: [],
  otherProjects: []
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_SCHEMATICS: {
      return {
        ...state,
        schematics: action.payload
      }
    }
    case actions.FETCH_MY_PROJECTS: {
      return {
        ...state,
        myProjects: action.payload
      }
    }
    case actions.FETCH_PUBLIC_PROJECTS: {
      return {
        ...state,
        publicProjects: action.payload
      }
    }
    case actions.FETCH_OTHER_PROJECTS: {
      return {
        ...state,
        otherProjects: action.payload
      }
    }

    default:
      return state
  }
}
