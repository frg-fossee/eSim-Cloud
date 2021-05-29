import * as actions from '../actions/actions'

const initialState = {
  changePasswordSuccess: false,
  changePasswordError: ''
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.CHANGE_PASSWORD_SUCCESS: {
      return {
        ...state,
        changePasswordSuccess: true,
        changePasswordError: action.payload.data
      }
    }

    case actions.CHANGE_PASSWORD_FAILED: {
      return {
        ...state,
        changePasswordSuccess: false,
        changePasswordError: action.payload.data
      }
    }

    default:
      return state
  }
}
