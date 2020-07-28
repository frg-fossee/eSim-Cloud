import * as actions from '../actions/actions'

const initialState = {
  title: '* Untitled_Schematic',
  model: '',
  netlist: '',
  controlLine: '',
  controlBlock: ''
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_NETLIST: {
      return {
        ...state,
        netlist: action.payload.netlist
      }
    }
    case actions.SET_TITLE: {
      return {
        ...state,
        title: action.payload.title
      }
    }

    case actions.SET_MODEL: {
      return {
        ...state,
        model: action.payload.model
      }
    }
    case actions.SET_CONTROL_LINE: {
      return {
        ...state,
        controlLine: action.payload.controlLine
      }
    }
    case actions.SET_CONTROL_BLOCK: {
      return {
        ...state,
        controlBlock: action.payload.controlBlock
      }
    }
    default:
      return state
  }
}
