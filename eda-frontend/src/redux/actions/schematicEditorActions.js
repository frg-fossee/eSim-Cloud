import api from '../../utils/Api'
import * as actions from './actions'

export const fetchLibraries = () => (dispatch) => {
// SAMPLE Response from API
// [
  //  {
  //   "id": 1
  //   "library_name": "Analog.lib",
  //   "saved_on": "2020-05-19T14:06:02.351977Z"
  // },
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
//   [
//   {
//     "id": 1
//     "name": "AD630ARZ",
//     "svg_path": "kicad-symbols/symbol_svgs/Analog/U-AD630ARZ-1-A.svg",
//     "symbol_prefix": "U",
//     "component_library": 9,
//     "description": "High precision Balanced Modulator/Demodulator, 2 MHz, SOIC-20W",
//     "data_link": "https://www.analog.com/media/en/technical-documentation/data-sheets/ad630.pdf",
//     "full_name": "U-AD630ARZ-1-A",
//     "keyword": "modulator demodulator",
//     "part": "A",
//     "dmg": 1
//   },
// ] -- Multiple dicts in array
  const url = 'components/?component_library=' + parseInt(library_id)
  api.get(url)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_COMPONENTS,
          payload: { components: res.data, id: library_id }
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
