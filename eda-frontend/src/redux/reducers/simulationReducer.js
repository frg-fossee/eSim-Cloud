import * as actions from '../actions/actions'

const initialState = {
  title: '',
  isGraph: 'false',
  text: '',
  graph: {}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_RESULT_TITLE: {
      return {
        ...state,
        title: action.payload.title
      }
    }
    case actions.SET_RESULT_GRAPH: {
      return {
        ...state,
        isGraph: 'true',
        graph: action.payload.graph
      }
    }

    case actions.SET_RESULT_TEXT: {
      return {
        ...state,
        isGraph: 'false',
        text: action.payload.text
      }
    }

    default:
      return state
  }
}
