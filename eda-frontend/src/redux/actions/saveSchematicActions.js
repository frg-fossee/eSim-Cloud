import * as actions from './actions'
import queryString from 'query-string'
import api from '../../utils/Api'

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

export const saveSchematic = (title, description, xml) => (dispatch, getState) => {
  const dataDump = {
    title: title,
    description: description,
    xmlData: xml
  }

  const body = {
    data_dump: JSON.stringify(dataDump)
  }

  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.post('save', queryString.stringify(body), config)
    .then(
      (res) => {
        console.log(res)
      }
    )
    .catch((err) => { console.error(err) })
}
