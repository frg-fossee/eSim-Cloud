/* eslint-disable camelcase */
import * as actions from './actions'
import queryString from 'query-string'
import api from '../../utils/Api'
import { renderGalleryXML } from '../../components/SchematicEditor/Helper/ToolbarTools'
import { setTitle } from './index'
import { fetchLibrary, removeLibrary } from './schematicEditorActions'
import randomstring from 'randomstring'
import { fetchProject } from './projectActions'
import { v4 as uuidv4 } from 'uuid'

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

// Api call to save new schematic or updating saved schematic.
export const saveSchematic = (title, description, xml, base64, newBranch = false, branchName = null, setVersions, ltiExists = false, versions, branchOpen, setBranchOpen, setSaveId = null) => (dispatch, getState) => {
  var libraries = []
  getState().schematicEditorReducer.libraries.forEach(e => { libraries.push(e.id) })
  const project_id = getState().saveSchematicReducer.details.project_id
  const body = {
    data_dump: xml,
    base64_image: base64,
    name: title,
    description: description,
    esim_libraries: JSON.stringify([...libraries]),
    project_id: project_id
  }
  // Get token from localstorage
  const token = getState().authReducer.token
  const schSave = getState().saveSchematicReducer
  console.log(schSave)

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  if (!newBranch) {
    console.log('New Version not Branch')
    body.version = randomstring.generate({
      length: 20
    })
    if (schSave.isSaved && !ltiExists) {
      //  Updating saved schemaic
      body.save_id = schSave.details.save_id
      body.branch = decodeURI(window.location.href.split('branch=')[1])
      console.log(window.location.href.split('branch=')[1])
      api
        .post('save', queryString.stringify(body), config)
        .then((res) => {
          if (!res.data.duplicate) { setVersions(res.data.version, false, null) }
          dispatch({
            type: actions.SET_SCH_SAVED,
            payload: res.data
          })
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      body.branch = 'master'
      // saving new schematic
      api
        .post('save', queryString.stringify(body), config)
        .then((res) => {
          setVersions(res.data.version, true, res.data.save_id)
          dispatch({
            type: actions.SET_SCH_SAVED,
            payload: res.data
          })
        })
        .catch((err) => {
          console.error(err)
        })
    }
  } else {
    console.log('New Branch not Version')
    let flag = 0
    for (let i = 0; i < versions.length; i++) {
      if (branchName === versions[i][0]) { flag = 1 }
    }
    if (!flag) {
      body.save_id = schSave.details.save_id
      body.branch = branchName
      body.version = schSave.details.version
      api
        .post('save', queryString.stringify(body), config)
        .then((res) => {
          const temp = versions
          const tempBranch = branchOpen
          const d = new Date(res.data.save_time)
          res.data.date = d.getDate() + '/' + parseInt(d.getMonth() + 1) + '/' + d.getFullYear()
          res.data.time = d.getHours() + ':' + d.getMinutes()
          if (d.getMinutes() < 10) {
            res.data.time = d.getHours() + ':0' + d.getMinutes()
          }
          temp.unshift([res.data.branch, [res.data]])
          tempBranch.unshift(false)
          setBranchOpen(tempBranch)
          setVersions(temp)
          dispatch({
            type: actions.SET_SCH_SAVED,
            payload: res.data
          })
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}

// Api call to save the current schematic to gallery [role required: Staff]
export const saveToGallery = (title, description, xml, base64) => (dispatch, getState) => {
  const token = getState().authReducer.token

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  console.log(token)
  console.log(config)

  const libraries = []
  getState().schematicEditorReducer.libraries.forEach(e => { libraries.push(e.id) })
  const body = {
    data_dump: xml,
    media: base64,
    name: title,
    description: description,
    esim_libraries: JSON.stringify([...libraries]),
    save_id: 'gallery' + uuidv4()
  }
  console.log('successfully saved to gallery')
  console.log(body)

  api
    .post('save/gallery/' + body.save_id, queryString.stringify(body), config)
    .then(
      (res) => {
        console.log(res)
      }
    )
    .catch((err) => { console.error(err) })
}

// Action for Loading on-cloud saved schematics
export const fetchSchematic = (saveId, version, branch) => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  // console.log('Already Saved')
  api.get('save/' + saveId + '/' + version + '/' + branch, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_SCH_SAVED,
          payload: res.data
        })
        dispatch(setSchTitle(res.data.name))
        dispatch(setSchDescription(res.data.description))
        dispatch(setSchXmlData(res.data.data_dump))
        if (res.data.project_id !== undefined) {
          dispatch(fetchProject())
        }
        renderGalleryXML(res.data.data_dump)
        if (res.data.esim_libraries.length > 0) {
          getState().schematicEditorReducer.libraries.forEach(e => dispatch(removeLibrary(e.id)))
          res.data.esim_libraries.forEach(e => dispatch(fetchLibrary(e.id)))
        }
      }
    )
    .catch((err) => { console.error(err) })
}

// Action for Loading Gallery schematics
export const fetchGallerySchematic = (Id) => (dispatch, getState) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.get('save/gallery/' + Id, config)
    .then((res) => {
      console.log(res.data)
      const data = res.data
      dispatch(setTitle('* ' + data.name))
      dispatch(setSchTitle(data.name))
      dispatch(setSchDescription(data.description))
      dispatch(setSchXmlData(data.data_dump))

      renderGalleryXML(data.data_dump)
      if (data.esim_libraries.length > 0) {
        getState().schematicEditorReducer.libraries.forEach(e => dispatch(removeLibrary(e.id)))
        data.esim_libraries.forEach(e => dispatch(fetchLibrary(e.id)))
      }
    })
    .catch((err) => { console.error(err) })
}

export const setSchShared = (share) => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token
  const schSave = getState().saveSchematicReducer

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  let isShared
  if (share === true) {
    isShared = 'on'
  } else {
    isShared = 'off'
  }

  api
    .post(
      'save/' + schSave.details.save_id + '/sharing/' + isShared + '/' + schSave.details.version + '/' + schSave.details.branch,
      {},
      config
    )
    .then((res) => {
      dispatch({
        type: actions.SET_SCH_SHARED,
        payload: res.data
      })
    })
    .catch((err) => {
      console.error(err)
    })
}

// Action for Loading local exported schematics
export const openLocalSch = (obj) => (dispatch, getState) => {
  const data = obj

  dispatch({ type: actions.CLEAR_DETAILS })
  dispatch(setTitle('* ' + data.title))
  dispatch(setSchTitle(data.title))
  dispatch(setSchDescription(data.description))
  dispatch(setSchXmlData(data.data_dump))
  renderGalleryXML(data.data_dump)
}

// Action for making a copy of a schematic
export const makeCopy = (saveID, version, branch) => (dispatch, getState) => {
  const token = getState().authReducer.token

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  api.post(`/save/copy/${version}/${saveID}/${branch}`, {}, config)
    .then(res => {
      const win = window.open()
      win.location.href = '/eda/#/editor?id=' + res.data.save_id + '&version=' + res.data.version + '&branch=' + res.data.branch
      win.focus()
    })
    .catch(error => console.log(error))
}
