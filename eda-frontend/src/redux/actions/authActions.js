import * as actions from './actions'
import api from '../../utils/Api'

// Api call for maintaining user login state throughout the application
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
  } else {
    dispatch({ type: actions.LOADING_FAILED })
    return
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
    .catch((err) => {
      console.error(err)
      dispatch({
        type: actions.LOGIN_FAILED,
        payload: {
          data: {}
        }
      })
    })
}

// Handel api call for user login
export const login = (username, password, toUrl) => {
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
          if (toUrl === '') {
            dispatch(loadUser())
          } else {
            window.open(toUrl, '_self')
          }
        } else if (res.status === 400 || res.status === 403 || res.status === 401) {
          dispatch({
            type: actions.AUTHENTICATION_ERROR,
            payload: {
              data: 'Incorrect Username or Password.'
            }
          })
        } else {
          dispatch({
            type: actions.LOGIN_FAILED,
            payload: {
              data: 'Something went wrong! Login Failed'
            }
          })
        }
      })
      .catch((err) => {
        var res = err.response
        if (res.status === 400 || res.status === 403 || res.status === 401) {
          dispatch(loginError('Incorrect Username or Password.'))
        } else {
          dispatch(loginError('Something went wrong! Login Failed'))
        }
      })
  }
}

// Handel api call for user sign up
export const signUp = (email, username, password, history) => (dispatch) => {
  const body = {
    email: email,
    username: username,
    password: password
  }

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.post('auth/users/', body, config)
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        dispatch({
          type: actions.SIGNUP_SUCCESSFUL,
          payload: {
            data: 'Successfully Signed Up! A verification link has been sent to your email account.'
          }
        })
        // history.push('/login')
      }
    })
    .catch((err) => {
      var res = err.response
      if (res.status === 400 || res.status === 403 || res.status === 401) {
        if (res.data.username !== undefined) {
          if (res.data.username[0].search('already') !== -1 && res.data.username[0].search('exists') !== -1) { dispatch(signUpError('Username Already Taken.')) }
        } else {
          dispatch(signUpError(res.data.password))
        }
      } else {
        dispatch(signUpError('Something went wrong! Registeration Failed'))
      }
    })
}

// Handel api call for user logout
export const logout = (history) => (dispatch, getState) => {
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

  api.post('auth/token/logout/', {}, config)
    .then(
      (res) => {
        if (res.status === 200 || res.status === 204) {
          dispatch({
            type: actions.LOGOUT_SUCCESSFUL,
            payload: {
              user: res.data
            }
          })
          history.push('/login')
        }
      }
    )
    .catch((err) => { console.error(err) })
}

// Redux action for default auth store
export const authDefault = () => (dispatch) => {
  dispatch({ type: actions.DEFAULT_STORE })
}

// Redux action for display login error
const loginError = (message) => (dispatch) => {
  dispatch({
    type: actions.AUTHENTICATION_ERROR,
    payload: {
      data: message
    }
  })
}

// Redux action for display sign up error
const signUpError = (message) => (dispatch) => {
  dispatch({
    type: actions.SIGNUP_FAILED,
    payload: {
      data: message
    }
  })
}

// Api call for Google oAuth login or sign up
export const googleLogin = (host, toUrl) => {
  return function (dispatch) {
    api.get('auth/o/google-oauth2/?redirect_uri=' + host + '/api/auth/google-callback')
      .then((res) => {
        if (res.status === 200) {
          // Open google login page
          window.open(res.data.authorization_url, '_self')
        } else {
          dispatch({
            type: actions.LOGIN_FAILED,
            payload: {
              data: 'Something went wrong! Login Failed'
            }
          })
        }
      })
      .then((res) => { console.log(res) })
      .catch((err) => {
        var res = err.response
        if (res.status === 400 || res.status === 403 || res.status === 401) {
          dispatch(loginError('Incorrect Username or Password.'))
        } else {
          dispatch(loginError('Something went wrong! Login Failed'))
        }
      })
  }
}
