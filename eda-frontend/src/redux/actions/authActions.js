import * as actions from './actions'
import api from '../../utils/Api'

export const loadUser = () => (dispatch, getState) => {
  // User Loading
  dispatch({ type: actions.USER_LOADING })

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

  api.get('auth/users/me/', config)
    .then(
      (res) => {
        if (res.status === 200) {
          dispatch({
            type: actions.USER_LOADED,
            payload: {
              user: res.data
            }
          })
        } else if (res.status >= 400 && res.status < 500) {
          dispatch({
            type: actions.LOGIN_FAILED,
            payload: {
              data: res.data
            }
          })
        }
      }
    )
    .catch((err) => { console.error(err) })
}

export const login = (username, password) => {
  const body = {
    password: password,
    username: username
  }

  return function (dispatch) {
    api.post('auth/token/login/', body)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: actions.LOGIN_SUCCESSFUL,
            payload: {
              data: res.data
            }
          })
        } else if (res.status === 403 || res.status === 401) {
          dispatch({
            type: actions.AUTHENTICATION_ERROR,
            payload: {
              data: res.data
            }
          })
        } else {
          dispatch({
            type: actions.LOGIN_FAILED,
            payload: {
              data: res.data
            }
          })
        }
      })
      .then()
      .catch((err) => { console.error(err) })
  }
}

export const signUp = (userCredentials) => (dispatch) => {
  const body = {
    email: userCredentials.email,
    username: userCredentials.username,
    password: userCredentials.password
  }

  api.post('auth/users/', body)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => { console.error(err) })
}
