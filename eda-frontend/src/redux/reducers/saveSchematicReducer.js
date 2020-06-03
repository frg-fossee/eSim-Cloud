import * as actions from '../actions/actions'

const initialState = {
  title: 'Untitled_Schematic',
  description: '',
  xmlData: null,
  isSaved: null
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_SCH_SAVED: {
      return {
        ...state,
        isSaved: true
      }
    }

    case actions.SET_SCH_TITLE: {
      return {
        ...state,
        title: action.payload.title
      }
    }

    case actions.SET_SCH_DESCRIPTION: {
      return {
        ...state,
        description: action.payload.description
      }
    }

    case actions.SET_SCH_XML_DATA: {
      return {
        ...state,
        xmlData: action.payload.xmlData
      }
    }

    default:
      return state
  }
}
