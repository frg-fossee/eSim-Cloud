import * as actions from './actions'

export const setNetlist = (netlist) => (dispatch) => {
  dispatch({
    type: actions.SET_NETLIST,
    payload: {
      netlist: netlist
    }
  })
}
