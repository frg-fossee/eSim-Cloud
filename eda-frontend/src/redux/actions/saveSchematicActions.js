import * as actions from './actions'

export const setSchTitle = (title) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_TITLE,
    payload: {
      title: title
    }
  })
}

export const setSchDescription = (description) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_DESCRIPTION,
    payload: {
      description: description
    }
  })
}

export const setSchXmlData = (xmlData) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_XML_DATA,
    payload: {
      xmlData: xmlData
    }
  })
}

export const saveSchematic = (title, description, xml) => (dispatch) => {
  const body = {
    data_dump: {
      title: title,
      description: description,
      xmlData: xml
    }
  }

  console.log(body)
}
