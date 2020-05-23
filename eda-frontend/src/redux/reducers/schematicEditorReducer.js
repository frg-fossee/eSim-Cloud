import * as actions from '../actions/actions'

const InitialState = {
  libraries: [],
  collapse: {},
  components: {}
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_LIBRARIES: {
    // Add 'open' parameter to track open/close state of collapse
      const collapse = {}
      const components = {}
      action.payload.forEach(element => {
        collapse[element.id] = false
        components[element.id] = []
      })
      return { ...state, libraries: action.payload, collapse: collapse, components: components }
    }

    case actions.TOGGLE_COLLAPSE: {
      const newCollapse = state.collapse
      newCollapse[action.payload.id] = !newCollapse[action.payload.id]
      console.log('Updating collapse', action.payload.id)
      Object.assign(state.collapse, newCollapse)
      return { ...state, collapse: { ...state.collapse, newCollapse } }
    }

    case actions.FETCH_COMPONENTS: {
      const newComponents = state.components
      newComponents[action.payload.id] = action.payload.components
      console.log('Fetched and added ', newComponents[action.payload.id].length, 'Components')
      Object.assign(state.components, newComponents)
      return { ...state, components: { ...state.components, newComponents } }
    }

    default:
      return state
  }
}
