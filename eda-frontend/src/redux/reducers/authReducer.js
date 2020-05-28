import * as actions from '../actions/actions'

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  user: null,
  errors: {}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.USER_LOADING: {
      return {
        ...state, isLoading: true
      }
    }

    case actions.USER_LOADED: {
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.user
      }
    }

    case actions.LOGIN_SUCCESSFUL: {
      localStorage.setItem('token', action.data.auth_token)
      return {
        ...state,
        ...action.data,
        isAuthenticated: true,
        isLoading: false,
        errors: null
      }
    }

    case actions.AUTHENTICATION_ERROR:
    case actions.LOGIN_FAILED:
    case actions.LOGOUT_SUCCESSFUL: {
      localStorage.removeItem('token')
      return {
        ...state,
        errors: action.data,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    }

    default:
      return state
  }
}
