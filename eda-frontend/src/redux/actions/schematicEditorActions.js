import api from '../../utils/Api'
import * as actions from './actions'
import store from '../store'

// Api call for fetching component library list
export const fetchLibraries = () => (dispatch, getState) => {
// SAMPLE Response from API
// [
  //  {
  //   "id": 1
  //   "library_name": "Analog.lib",
  //   "saved_on": "2020-05-19T14:06:02.351977Z"
  // },
// ] -- Multiple objects in array
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (token) { config.headers.Authorization = `Token ${token}` }

  api.get('libraries/default', config).then((res) => {
    dispatch({
      type: actions.FETCH_LIBRARIES,
      payload: res.data
    })
  })
    .catch((err) => { console.error(err) })
}

export const fetchAllLibraries = () => (dispatch) => {
  // SAMPLE Response from API
  // [
  //  {
  //   "id": 1
  //   "library_name": "Analog.lib",
  //   "saved_on": "2020-05-19T14:06:02.351977Z"
  // },
  // ] -- Multiple objects in array
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (token) { config.headers.Authorization = `Token ${token}` }

  api.get('libraries/', config).then((res) => {
    dispatch({
      type: actions.FETCH_ALL_LIBRARIES,
      payload: res.data
    })
  })
    .catch((err) => { console.error(err) })
}

export const fetchCustomLibraries = () => (dispatch) => {
  // SAMPLE Response from API
  // [
  //  {
  //   "id": 1
  //   "library_name": "Analog.lib",
  //   "saved_on": "2020-05-19T14:06:02.351977Z"
  // },
  // ] -- Multiple objects in array
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (token) { config.headers.Authorization = `Token ${token}` }

  api.get('libraries/get_custom_libraries', config).then((res) => {
    if (res.data.length > 0) {
      dispatch({
        type: actions.FETCH_CUSTOM_LIBRARIES,
        payload: res.data
      })
    }
  })
    .catch((err) => { console.error(err) })
}

export const fetchLibrary = (libraryId) => (dispatch) => {
  // SAMPLE Response from API
  // {
  //   "library_name": "Motor.lib",
  //   "saved_on": "2021-05-10T20:29:01.794498Z",
  //   "id": 363
  // } -- Single Object
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (token) { config.headers.Authorization = `Token ${token}` }

  api.get(`libraries/${libraryId}`, config).then(res => {
    dispatch({
      type: actions.FETCH_LIBRARY,
      payload: res.data
    })
  })
}

export const removeLibrary = (libraryId) => (dispatch) => {
  dispatch({
    type: actions.REMOVE_LIBRARY,
    payload: libraryId
  })
}

export const deleteLibrary = (libraryId) => (dispatch) => {
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      Authorization: `Token ${token}`
    }
  }
  api.delete(`libraries/${libraryId}/`, config).then(
    dispatch({
      type: actions.DELETE_LIBRARY,
      payload: libraryId
    })
  ).catch(err => {
    console.log(err)
  })
}

// API call to save uploaded libraries
export const uploadLibrary = (formData) => (dispatch) => {
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      Authorization: `Token ${token}`
    }
  }
  api.post('/library-sets/', formData, config).then(res => {
    dispatch({
      type: actions.UPLOAD_LIBRARIES,
      payload: res.status
    })
  })
    .catch(err => {
      console.log(err)
      console.log(err.response.status)
      dispatch({
        type: actions.UPLOAD_LIBRARIES,
        payload: err.response.status
      })
    })
}

export const resetUploadSuccess = () => (dispatch) => {
  dispatch({
    type: actions.RESET_UPLOAD_SUCCESS
  })
}

// Api call for fetching components under specified library id
export const fetchComponents = (libraryId) => (dispatch) => {
// SAMPLE Response from API
//   [
  // {
  //   "id": 14221,
  //   "name": "BAT54ADW",
  //   "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-A.svg",
  //   "thumbnail_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-A_thumbnail.svg",
  //   "symbol_prefix": "D",
  //   "component_library": "http://localhost/api/libraries/193/",
  //   "description": "Schottky diode array 2 pair Com A",
  //   "data_link": "http://www.diodes.com/datasheets/ds30152.pdf",
  //   "full_name": "D-BAT54ADW-1-A",
  //   "keyword": "diode",
  //   "alternate_component": [
  //     {
  //       "dmg": 1,
  //       "part": "C",
  //       "full_name": "D-BAT54ADW-1-C",
  //       "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-C.svg",
  //       "id": 2326
  //     },
  //     {
  //       "dmg": 1,
  //       "part": "B",
  //       "full_name": "D-BAT54ADW-1-B",
  //       "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-B.svg",
  //       "id": 2327
  //     },
  //   ]
  // },
// ] -- Multiple objects in array
  const token = store.getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (token) { config.headers.Authorization = `Token ${token}` }
  const url = 'components/?component_library=' + parseInt(libraryId)
  api.get(url, config)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_COMPONENTS,
          payload: { components: res.data, id: libraryId }
        })
      }
    )
    .catch((err) => { console.error(err) })
}

// Action to keep only one component list dropdown open at a time
export const toggleCollapse = (id) => (dispatch) => {
  dispatch({
    type: actions.TOGGLE_COLLAPSE,
    payload: { id: id }
  })
}

// Action to hide components list to display simulation parameters
export const toggleSimulate = () => (dispatch) => {
  dispatch({
    type: actions.TOGGLE_SIMULATE
  })
}
