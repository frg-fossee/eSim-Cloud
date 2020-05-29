import * as actions from './actions'
import api from '../../utils/Api'
import store from '../store'

export const loadUser = () => (dispatch) => {
  dispatch({ type: actions.USER_LOADING })

  const token = store.getState().authReducer.token

  const headers = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Token ${token}`
  } else {
    dispatch({ type: actions.LOGIN_FAILED })
    return
  }

  api.get('auth/users/me/', { headers })
    .then(
      (res) => {
        if (res.status === 200) {
          dispatch({
            type: actions.USER_LOADED,
            user: res.data
          })
          return res.data
        } else if (res.status >= 400 && res.status < 500) {
          dispatch({
            type: actions.LOGIN_FAILED,
            data: res.data
          })
          throw res.data
        }
      }
    )
    .catch(function (error) {
      console.log(error)
    })
}

export const login = (username, password) => (dispatch) => {
  const body = {
    password: password,
    username: username
  }

  api.post('auth/token/login/', body)
    .then((res) => {
      if (res.status === 200) {
        dispatch({ type: actions.LOGIN_SUCCESSFUL, data: res.data })
        return res.data
      } else if (res.status === 403 || res.status === 401) {
        dispatch({ type: actions.AUTHENTICATION_ERROR, data: res.data })
        throw res.data
      } else {
        dispatch({ type: actions.LOGIN_FAILED, data: res.data })
        throw res.data
      }
    })
    .catch(function (error) {
      console.log(error)
    })
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
    .catch(function (error) {
      console.log(error)
    })
}
