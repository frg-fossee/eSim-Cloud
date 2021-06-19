import * as actions from '../actions/actions'

const InitialState = {
  isSimulate: false,
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
      const existingState = state.collapse[action.payload.id]
      const newCollapse = Object.keys(state.collapse).reduce(function (accObj, parseObj) {
        accObj[parseObj] = false
        return accObj
      }, {})
      newCollapse[action.payload.id] = !existingState
      Object.assign(state.collapse, newCollapse)
      return { ...state, collapse: { ...state.collapse, newCollapse } }
    }

    case actions.FETCH_COMPONENTS: {
      const newComponents = state.components
      newComponents[action.payload.id] = action.payload.components
      // console.log('Fetched and added ', newComponents[action.payload.id].length, 'Components')
      Object.assign(state.components, newComponents)
      return { ...state, components: { ...state.components, newComponents } }
    }

    case actions.TOGGLE_SIMULATE: {
      return { ...state, isSimulate: !state.isSimulate }
    }

    case actions.FETCH_ALL_LIBRARIES: {
      const components = { ...state.components }
      var allLibraries = action.payload
      allLibraries.forEach(e => {
        if (!components[e.id]) { components[e.id] = [] }
      })
      return { ...state, allLibraries: allLibraries, components: components }
    }

    case actions.FETCH_CUSTOM_LIBRARIES: {
      const allComponents = {}
      action.payload.forEach(e => {
        allComponents[e.id] = []
      })
      return { ...state, customLibraries: action.payload }
    }

    case actions.FETCH_LIBRARY: {
      const components = { ...state.components }
      components[action.payload.id] = []
      const collapse = { ...state.collapse }
      const libraries = [...state.libraries]
      const newLib = action.payload
      collapse[newLib.id] = false
      if (!libraries.some(e => e.id === newLib.id)) { libraries.push(newLib) }
      return { ...state, libraries: libraries, components: components, collapse: collapse }
    }

    case actions.REMOVE_LIBRARY: {
      var libraries = [...state.libraries]
      const filterFunc = (element) => {
        return element.id !== action.payload
      }
      libraries = libraries.filter(filterFunc)
      return { ...state, libraries: libraries }
    }

    case actions.DELETE_LIBRARY: {
      const filterFunc = (element) => {
        return element.id !== action.payload
      }
      var newLibraries = [...state.libraries]
      newLibraries = newLibraries.filter(filterFunc)
      const allComponents = { ...state.components }
      const allLibraries = [...state.allLibraries].filter(filterFunc)
      delete allComponents[action.payload]
      return { ...state, libraries: newLibraries, allLibraries: allLibraries, components: allComponents }
    }

    case actions.UPLOAD_LIBRARIES: {
      if (action.payload === 201) {
        return { ...state, uploadSuccess: true }
      } else { return { ...state, uploadSuccess: false } }
    }

    case actions.RESET_UPLOAD_SUCCESS: {
      return { ...state, uploadSuccess: null }
    }

    default:
      return state
  }
}
