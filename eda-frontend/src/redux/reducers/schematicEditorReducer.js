import * as actions from '../actions/actions'

const InitialState = {
  libraries: [],
  collapse: {}
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_LIBRARIES: {
    // Add 'open' parameter to track open/close state of collapse
      const collapse = {}
      action.payload.forEach(element => {
        collapse[element.id] = false
      })
      return { ...state, libraries: action.payload, collapse: collapse }
    }

    case actions.TOGGLE_COLLAPSE: {
      const newCollapse = state.collapse
      newCollapse[action.payload.id] = !newCollapse[action.payload.id]
      console.log('Updating collapse', action.payload.id)
      Object.assign(state.collapse, newCollapse)
      return { ...state, collapse: { ...state.collapse, newCollapse } }
    }

    case 'inc':
      return { ...state, cnt: state.cnt + 1 }

    default:
      return state
  }
}
