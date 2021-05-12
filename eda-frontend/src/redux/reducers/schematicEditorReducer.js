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
      var components = {}
      var allLibraries = action.payload
      allLibraries.forEach(e =>{
        components[e.id] = []
      })
      return { ...state, allLibraries: allLibraries, allComponents: components }
    }

    case actions.FETCH_CUSTOM_LIBRARIES: {
      var components = {};
      action.payload.forEach(e =>{
        components[e.id] = []
      })
      return { ...state, customLibraries: action.payload, customComponents: components }
    }

    case actions.FETCH_LIBRARY: {
      const components = { ...state.components }
      components[action.payload.id] = []
      const collapse = { ...state.collapse }
      const libraries = [ ...state.libraries ]
      const f = 0;
      const newLib = action.payload
      collapse[newLib.id] = false
      for ( var i=0; i< libraries.length; i++) {
        if (libraries[i].id == newLib.id) {
          f = 1;
          break;
        }
      }
      if (f == 0)
        libraries.push(newLib)
      return { ...state, libraries: libraries, components: components, collapse: collapse }
    }

    case actions.REMOVE_LIBRARY: {
      const libraries = [ ...state.libraries ]
      const newLibraries = []
      const libToRemove = action.payload
      for (let i=0; i< libraries.length; i++) {
        if(libraries[i].id != libToRemove.id) {
          newLibraries.push(libraries[i])
        }
      }
      return { ...state, libraries: newLibraries }
    }

    default:
      return state
  }
}
