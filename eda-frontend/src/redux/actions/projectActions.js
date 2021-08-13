/* eslint-disable camelcase */
import * as actions from './actions'
import api from '../../utils/Api'

export const createProject = (save_id, details) => (dispatch, getState) => {
  // Get token from localstorage
  const token = localStorage.getItem('esim_token')

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
  api.post(`/publish/project/${save_id}`, details, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_CURRENT_PROJECT,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}

export const fetchProject = () => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token
  const project_id = getState().saveSchematicReducer.details.project_id
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
  api.get('/publish/project/' + project_id, config)
    .then(
      (res) => {
        dispatch({
          type: actions.SET_CURRENT_PROJECT,
          payload: res.data
        })
        if (res.data.is_reported) {
          dispatch(fetchReports(project_id))
        }
      }
    )
    .catch((err) => {
      if (err.response?.status === 401) {
        dispatch({
          type: actions.SET_CURRENT_PROJECT,
          payload: '401'
        })
      }
    })
}
export const deleteProject = (project_id) => (dispatch, getState) => {
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
  api.delete('/publish/project/' + project_id, config)
    .then(
      (res) => {
        dispatch({
          type: actions.DELETE_PROJECT
        })
      }
    )
    .catch((err) => {
      console.log(err)
    })
}
export const fetchReports = (projectID) => (dispatch, getState) => {
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
  api.get('workflow/report/' + projectID, config)
    .then(
      (res) => {
        if (res.data.open !== [] && res.data.closed !== [] && res.data.approved !== []) {
          dispatch({
            type: actions.FETCH_REPORTS,
            payload: res.data
          })
        }
      }
    )
    .catch((err) => { console.error(err) })
}
export const resolveReports = (projectID, stateName) => (dispatch, getState) => {
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
  api.post('workflow/report/resolve/' + projectID, { name: stateName }, config)
    .then(
      (res) => {
        dispatch({
          type: actions.RESOLVE_REPORTS
        })
        console.log(res.data)
      }
    )
    .catch((err) => { console.error(err) })
}

export const getStatus = (project_id) => (dispatch, getState) => {
  const token = getState().authReducer.token
  if (!project_id) {
    project_id = getState().saveSchematicReducer.details.project_id
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
  api.get(`/workflow/state/${project_id}`, config)
    .then((res) => {
      console.log(res.data)
      dispatch({
        type: actions.GET_STATES,
        payload: res.data
      })
    })
    .catch(error => console.log(error))
}
export const changeStatus = (project_id, status, notes) => (dispatch, getState) => {
  // post the state
  const token = localStorage.getItem('esim_token')
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
  api.post(`/workflow/state/${project_id}`,
    {
      name: status,
      note: notes
    }, config)
    .then((res) => {
      dispatch(fetchProject())
      dispatch(getStatus())
    })
    .catch(error => console.log(error))
}
export const reportProject = (reportDescription, project_id) => (dispatch, getState) => {
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
    api.post(`workflow/report/create/${project_id}`, { description: reportDescription }, config)
      .then(
        (res) => {
          dispatch(fetchProject(project_id))
          dispatch(fetchReports(project_id))
        }
      )
      .catch((err) => { console.error(err) })
  }
}
export const approveReports = (project_id, reports, status) => (dispatch, getState) => {
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
  api.post(`workflow/report/approve/${project_id}`,
    {
      reports: reports,
      state: { name: status }
    }, config)
    .then(
      (res) => {
        dispatch(fetchReports(project_id))
      }
    )
    .catch((err) => { console.error(err) })
}
