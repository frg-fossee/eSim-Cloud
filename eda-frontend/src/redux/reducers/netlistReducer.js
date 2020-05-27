import * as actions from '../actions/netlistActions'

const initialState = ''

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.setNetlist: {
      return {
        netlist: action.payload.netlist
      }
    }
    default:
      return state
  }
}
