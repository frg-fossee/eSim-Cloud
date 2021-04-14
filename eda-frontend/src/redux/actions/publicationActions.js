import * as actions from './actions'
import api from '../../utils/Api'


export const fetchPublication = (circuitID) => (dispatch, getState) => {
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
    api.get('publish/circuit/' + circuitID, config)
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