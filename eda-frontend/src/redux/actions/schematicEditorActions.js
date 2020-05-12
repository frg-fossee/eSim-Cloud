import api from '../../utils/Api'
import * as actions from './actions'

export const fetchLibraries = () => (dispatch) => {
  api.get('libraries/').then(
    (res) => {
      dispatch({
        type: actions.FETCH_LIBRARIES,
        payload: res.data
      })
      console.log('Fetched Libraries:', res)
    }
  )
}
