import * as actions from '../actions/actions'
let extract = window.location.pathname
const params = extract.split('/').join('')

const InitialState = {
  activeDomain: null,
  domains: []
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_DOMAINS: {
        return {
             ...state, 
             activeDomain: params, 
             domains: action.payload
        }
    }
    
    default:
      return state
  }
}
