
import * as actions from './actions'
import api from '../../utils/Api'

// Redux action for account workflow
const changePasswordError = (message) => (dispatch) => {
  dispatch({
    type: actions.CHANGE_PASSWORD_FAILED,
    payload: {
      data: message
    }
  })
}

export const changePassword = (oldPassword, newPassword, reNewPassword, history, url) => (dispatch, getState) => {
  const body = {
    current_password: oldPassword,
    new_password: newPassword,
    re_new_password: reNewPassword
  }

  // add headers
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const token = getState().authReducer.token

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.post('auth/users/set_password/', body, config)
    .then((res) => {
      if (res.status >= 200 || res.status < 304) {
        dispatch({
          type: actions.CHANGE_PASSWORD_SUCCESS,
          payload: {
            data: 'The password has been changed successfully.'
          }
        })
        if (url != null) {
          setTimeout(() => {
            window.location.href = url
          }, 2000)
        } else {
          setTimeout(() => {
            history.push('/dashboard')
          }, 2000)
        }
      }
    })
    .catch((err) => {
      var res = err.response
      if ([400, 401, 403, 304].includes(res.status)) {
        // eslint-disable-next-line camelcase
        const { new_password, re_new_password, current_password, non_field_errors } = res.data
        const defaultErrors = ['Password change failed.']
        // eslint-disable-next-line camelcase
        var message = (current_password || new_password || non_field_errors || re_new_password || defaultErrors)[0]

        dispatch(changePasswordError(message))
      }
    })
}
