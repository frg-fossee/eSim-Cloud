import api from '../../utils/Api'
import * as actions from './actions'

// Api call for fetching DOMAINS
export const fetchDomains = () => (dispatch) => {
    // SAMPLE Response from API
    // [
      //  {
      //   "name": "eSim",
      //   "logo": "logo path"
      // },
    // ] -- Multiple dicts in array
      api.get('domains/') //to be changed
        .then(
          (res) => {
            dispatch({
              type: actions.FETCH_DOMAINS,
              payload: res.data
            })
          }
        )
        .catch((err) => { console.error(err) })
}

