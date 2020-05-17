import api from '../../utils/Api'
import * as actions from './actions'


export const fetchLibraries = () => (dispatch) => {
// SAMPLE Response from API
// [
//   {
//     "id": 1,
//     "library_name": "Analog.lib",
//     "library_type": "U",
//     "saved_on": "2020-05-12T15:39:42.294000Z"
//   }
// ] -- Multiple dicts in array
  api.get('libraries/')
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_LIBRARIES,
          payload: res.data
        })
      }
    )
    .catch((err) => { console.error(err) })
}
export const fetchComponents = (library_id) => (dispatch) => {
// SAMPLE Response from API
//   [{
//     "component_name": "U-LF398H-1_A",
//     "svg_path": "kicad-symbols/symbol_svgs/Analog/U-LF398H-1_A.svg",
//     "component_type": "U",
//     "component_library": 1
// }] -- Multiple dicts in array
  const url = 'components/?component_library='+parseInt(library_id)
  api.get(url)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_COMPONENTS,
          payload: {components: res.data, id: library_id}
        })
      }
    )
    .catch((err) => { console.error(err) })
}

export const toggleCollapse = (id) => (dispatch) => {
  dispatch({
    type: actions.TOGGLE_COLLAPSE,
    payload: { id: id }
  })
}
