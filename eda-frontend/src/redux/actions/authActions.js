import * as actions from './actions'
import api from '../../utils/Api'

export const login = (username, password) => (dispatch) => {
  const body = {
    password: password,
    username: username
  }
  console.log(body)

  api.post('auth/token/login/', body)
    .then((res) => {
      console.log(res)
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
  console.log(body)

  api.post('auth/users/', body)
    .then((res) => {
      console.log(res)
    })
    .catch(function (error) {
      console.log(error)
    })
}
