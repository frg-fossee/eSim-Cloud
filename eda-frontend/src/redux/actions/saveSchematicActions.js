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
  const body = {
    data_dump: xml,
    base64_image: 'data:image/png;base64, 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',
    name: title,
    description: description
  }

  const token = getState().authReducer.token
  const schSave = getState().saveSchematicReducer

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  if (schSave.isSaved) {
    // console.log('Already Saved')
    api.post('save/' + schSave.details.save_id, queryString.stringify(body), config)
      .then(
        (res) => {
          // console.log(res)
          dispatch({
            type: actions.SET_SCH_SAVED,
            payload: res.data
          })
        }
      )
      .catch((err) => { console.error(err) })
  } else {
    api.post('save', queryString.stringify(body), config)
      .then(
        (res) => {
          // console.log(res)
          dispatch({
            type: actions.SET_SCH_SAVED,
            payload: res.data
          })
        }
      )
      .catch((err) => { console.error(err) })
  }
}

export const fetchSchematic = (saveId) => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  // console.log('Already Saved')
  api.get('save/' + saveId, config)
    .then(
      (res) => {
        // console.log('response', res)
        dispatch({
          type: actions.SET_SCH_SAVED,
          payload: res.data
        })
        dispatch(setSchTitle(res.data.name))
        dispatch(setSchDescription(res.data.description))
        dispatch(setSchXmlData(res.data.data_dump))
      }
    )
    .catch((err) => { console.error(err) })
}

export const setSchShared = (share) => (dispatch, getState) => {
  const token = getState().authReducer.token
  const schSave = getState().saveSchematicReducer

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  var isShared
  if (share === true) {
    isShared = 'on'
  } else {
    isShared = 'off'
  }

  api.post('save/' + schSave.details.save_id + '/sharing/' + isShared, {}, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_SCH_SHARED,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
