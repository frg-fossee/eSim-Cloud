import api from '../../utils/Api'
import * as actions from './actions'

export const fetchSchematics = () => (dispatch, getState) => {
  const token = getState().authReducer.token

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  api.get('save/list', config)
    .then(
      (res) => {
        console.log(res)
        dispatch({
          type: actions.FETCH_SCHEMATICS,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
