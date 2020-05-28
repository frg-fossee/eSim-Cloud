// import * as actions from './actions'
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
    })
    .catch(function (error) {
      console.log(error)
    })
}
