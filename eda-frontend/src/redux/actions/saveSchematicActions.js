import * as actions from './actions'
import queryString from 'query-string'
import api from '../../utils/Api'
import GallerySchSample from '../../utils/GallerySchSample'
import { renderGalleryXML } from '../../components/SchematicEditor/Helper/ToolbarTools'
import { setTitle } from './index'

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

export const saveSchematic = (title, description, xml, base64) => (dispatch, getState) => {
  const body = {
    data_dump: xml,
    base64_image: base64,
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
        renderGalleryXML(res.data.data_dump)
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

export const loadGallery = (Id) => (dispatch, getState) => {
  var data = GallerySchSample[Id]

  dispatch(setTitle('* ' + data.name))
  dispatch(setSchTitle(data.name))
  dispatch(setSchDescription(data.description))
  dispatch(setSchXmlData(data.data_dump))
  renderGalleryXML(data.data_dump)
}
