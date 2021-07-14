import api from '../../utils/Api'
import * as actions from './actions'

// Api call for listing user'ssaved schematic to display on dashboard
export const fetchSchematics = () => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.get('save/list', config)
    .then(
      (res) => {
        console.log(res.data)

        dispatch({
          type: actions.FETCH_SCHEMATICS,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
// Api call for listing users projects to display on dashboard
export const fetchMyProjects = () => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.get('publish/myproject/', config)
    .then(
      (res) => {
        console.log(res.data)
        dispatch({
          type: actions.FETCH_MY_PROJECTS,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
// Api call for listing other users projects to display on dashboard
export const fetchOtherProjects = () => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.get('workflow/otherprojects/', config)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_OTHER_PROJECTS,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
// Api call for listing public projects to display on dashboard
export const fetchPublicProjects = () => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.get('publish/publishing/', config)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_PUBLIC_PROJECTS,
          payload: res.data
        })
        console.log(res.data[0].status)
      }
    )
    .catch((err) => { console.error(err) })
}

// Api call for deleting saved schematic
export const deleteSchematic = (saveId) => (dispatch, getState) => {
  const token = getState().authReducer.token
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.delete('save/' + saveId, config)
    .then(
      (res) => {
        if (res.status === 200 || res.status === 204) {
          console.log('Called Delete')
          dispatch(fetchSchematics())
        }
      }
    )
    .catch((err) => { console.error(err) })
}
