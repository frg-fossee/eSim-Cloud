import * as actions from '../actions/actions'

const InitialState = {
  schematics: [],
  myPublications:[],
  publicPublications:[],
  otherPublications:[],
}

export default function (state = InitialState, action) {
  switch (action.type) {
    case actions.FETCH_SCHEMATICS: {
      return {
        ...state,
        schematics: action.payload
      }
    }
    case actions.FETCH_MY_PUBLICATIONS:{
      return{
        ...state,
        myPublications:action.payload
      }
    }
    case actions.FETCH_PUBLIC_PUBLICATIONS:{
      return{
        ...state,
        publicPublications:action.payload
      }
    }
    case actions.FETCH_OTHER_PUBLICATIONS:{
      return{
        ...state,
        otherPublications:action.payload
      }
    }

    default:
      return state
  }
}
