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

// Handle api call for user login
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

// Handle api call for user sign up
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
        } else if (res.data.password !== undefined) {
          dispatch(signUpError(res.data.password))
        } else {
          dispatch(signUpError(res.data.email))
        }
      } else {
        dispatch(signUpError('Something went wrong! Registration Failed'))
      }
    })
}

// Handle api call for user logout
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

// Redux action for display reset password error
const resetPasswordError = (message) => (dispatch) => {
  dispatch({
    type: actions.RESET_PASSWORD_FAILED,
    payload: {
      data: message
    }
  })
}

// Redux action for display reset password confirmation error
const resetPasswordConfirmError = (message) => (dispatch) => {
  dispatch({
    type: actions.RESET_PASSWORD_CONFIRM_FAILED,
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

// Handles api call for user's password recovery
export const resetPassword = (email) => (dispatch) => {
  const body = {
    email: email
  }

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.post('auth/users/reset_password/', body, config)
    .then((res) => {
      if (res.status >= 200 || res.status < 304) {
        dispatch({
          type: actions.RESET_PASSWORD_SUCCESSFUL,
          payload: {
            data: 'The password reset link has been sent to your email account.'
          }
        })
        setTimeout(() => {
          window.location.href = '/eda/#/login'
        }, 2000)
        // history.push('/login')
      }
    })
    .catch((err) => {
      var res = err.response
      if ([400, 401, 403, 304].includes(res.status)) {
        dispatch(resetPasswordError(res.data))
      }
    })
}

// Handles api call for user's password reset confirmation
export const resetPasswordConfirm = (uid, token, newPassword, reNewPassword) => (dispatch) => {
  const body = {
    uid: uid,
    token: token,
    new_password: newPassword,
    re_new_password: reNewPassword
  }

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.post('auth/users/reset_password_confirm/', body, config)
    .then((res) => {
      if (res.status >= 200 || res.status < 304) {
        dispatch({
          type: actions.RESET_PASSWORD_CONFIRM_SUCCESSFUL,
          payload: {
            data: 'The password has been reset successfully.'
          }
        })
        setTimeout(() => {
          window.location.href = '/eda/#/login'
        }, 2000)
      }
    })
    .catch((err) => {
      var res = err.response
      if ([400, 401, 403, 304].includes(res.status)) {
        // eslint-disable-next-line camelcase
        const { new_password, re_new_password, non_field_errors, token } = res.data
        const defaultErrors = ['Password reset failed.']
        // eslint-disable-next-line camelcase
        var message = (new_password || re_new_password || non_field_errors || defaultErrors)[0]

        if (token) {
          // Override message if it's a token error
          message = 'Either the password has already been changed or you have the incorrect URL'
        }

        dispatch(resetPasswordConfirmError(message))
      }
    })
}
