import * as actions from '../actions/actions'
import { ZoomAct } from '../../components/SchematicEditor/Helper/ToolbarTools.js'

const InitialState = {
  id: '',
  isPropertiesWindowOpen: false,
  compProperties: {},
  x: 0,
  y: 0
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.GET_COMP_PROPERTIES: {
      return {
        ...state,
        id: action.payload.id,
        isPropertiesWindowOpen: true,
        compProperties: action.payload.compProperties,
        x: action.payload.x,
        y: action.payload.y
      }
    }

    case actions.SET_COMP_PROPERTIES: {
      return {
        ...state,
        id: action.payload.id,
        isPropertiesWindowOpen: false,
        compProperties: action.payload.compProperties
      }
    }

    case actions.CLOSE_COMP_PROPERTIES: {
      ZoomAct()
      return {
        ...state,
        isPropertiesWindowOpen: false
      }
    }

    case actions.CLOSE_COMP_PROPERTIES_TEMP: {
      return {
        ...state,
        isPropertiesWindowOpen: false
      }
    }

    default:
      return state
  }
}
