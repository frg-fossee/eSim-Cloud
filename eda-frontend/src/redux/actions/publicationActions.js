import * as actions from './actions'
import api from '../../utils/Api'

export const createPublication = (save_id, details) => (dispatch, getState) => {
  // Get token from localstorage
  const token = localStorage.getItem("esim_token")

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
  console.log(details)
  api.post(`/publish/publication/${save_id}`, details, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_CURRENT_PUBLICATION,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}

export const fetchPublication = () => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token
  const publication_id = getState().saveSchematicReducer.details.publication_id
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
  api.get('publish/publication/' + publication_id, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_CURRENT_PUBLICATION,
          payload: res.data
        })
        if (res.data.is_reported) {
          dispatch(fetchReports(publication_id))
        }
      }
    )
    .catch((err) => {
      if(err.response.status == 401)
      {
        console.log("Hello")
        dispatch({
          type:actions.SET_CURRENT_PUBLICATION,
          payload:"400"
        })
      }
    })
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
        if (res.data.open !== [] && res.data.closed !== [] && res.data.approved !== [])
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
  if (!publication_id) {
    publication_id = getState().saveSchematicReducer.details.publication_id
  }

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
      console.log(res.data)
      dispatch({
        type: actions.GET_STATES,
        payload: res.data
      })
    })
    .catch(error => console.log(error))
}
export const changeStatus = (publication_id, status,notes) => (dispatch, getState) => {
  //post the state
  const token = localStorage.getItem("esim_token")
  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
  }

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  api.post(`/workflow/state/${publication_id}`,
    {
      'name': status,
      'note':notes
    }, config)
    .then(() => {
      dispatch(fetchPublication())
      dispatch(getStatus())
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
