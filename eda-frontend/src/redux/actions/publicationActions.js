import * as actions from './actions'
import api from '../../utils/Api'


export const fetchPublication = (publicationID) => (dispatch, getState) => {
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
  api.get('publish/publication/' + publicationID, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_CURRENT_PUBLICATION,
          payload: res.data
        })
        if (res.data.is_reported) {
          dispatch(fetchReports(publicationID))
        }
      }
    )
    .catch((err) => { console.error(err) })
}
export const fetchReports = (publicationID) => (dispatch, getState) => {
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
  api.get('workflow/report/' + publicationID, config)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_REPORTS,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
export const resolveReports = (publicationID, stateName) => (dispatch, getState) => {
  // Get token from localstorage
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
  api.post('workflow/report/resolve/' + publicationID, { name: stateName }, config)
    .then(
      (res) => {
        dispatch({
          type: actions.RESOLVE_REPORTS,
        })
        console.log(res.data)
      }
    )
    .catch((err) => { console.error(err) })
}

export const getStatus = (publication_id) => (dispatch, getState) => {
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
  api.get(`/workflow/state/${publication_id}`, config)
    .then((res) => {
      dispatch({
        type: actions.GET_STATES,
        payload: res.data
      })
    })
    .catch(error => console.log(error))
}
export const reportPublication = (reportDescription, publication_id) => (dispatch, getState) => {
  // Get token from localstorage
  if (reportDescription) {
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
    api.post(`workflow/report/create/${publication_id}`, { 'description': reportDescription }, config)
      .then(
        (res) => {
          dispatch(fetchReports(publication_id))
        }
      )
      .catch((err) => { console.error(err) })
  }
}
export const approveReports = (publication_id, reports, status) => (dispatch, getState) => {
  // Get token from localstorage
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
    api.post(`workflow/report/approve/${publication_id}`,
      {
        'reports': reports,
        'state': { 'name': status }
      }, config)
      .then(
        (res) => {
          dispatch(fetchReports(publication_id))
        }
      )
      .catch((err) => { console.error(err) })
}
