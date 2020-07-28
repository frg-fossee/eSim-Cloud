import api from '../../utils/Api'
import * as actions from './actions'

// Api call for fetching component library list
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

// Api call for fetching components under specified library id
export const fetchComponents = (libraryId) => (dispatch) => {
// SAMPLE Response from API
//   [
  // {
  //   "id": 14221,
  //   "name": "BAT54ADW",
  //   "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-A.svg",
  //   "thumbnail_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-A_thumbnail.svg",
  //   "symbol_prefix": "D",
  //   "component_library": "http://localhost/api/libraries/193/",
  //   "description": "Schottky diode array 2 pair Com A",
  //   "data_link": "http://www.diodes.com/datasheets/ds30152.pdf",
  //   "full_name": "D-BAT54ADW-1-A",
  //   "keyword": "diode",
  //   "alternate_component": [
  //     {
  //       "dmg": 1,
  //       "part": "C",
  //       "full_name": "D-BAT54ADW-1-C",
  //       "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-C.svg",
  //       "id": 2326
  //     },
  //     {
  //       "dmg": 1,
  //       "part": "B",
  //       "full_name": "D-BAT54ADW-1-B",
  //       "svg_path": "kicad-symbols/symbol_svgs/Diode/D-BAT54ADW-1-B.svg",
  //       "id": 2327
  //     },
  //   ]
  // },
// ] -- Multiple dicts in array
  const url = 'components/?component_library=' + parseInt(libraryId)
  api.get(url)
    .then(
      (res) => {
        dispatch({
          type: actions.FETCH_COMPONENTS,
          payload: { components: res.data, id: libraryId }
        })
      }
    )
    .catch((err) => { console.error(err) })
}

// Action to keep only one component list dropdown open at a time
export const toggleCollapse = (id) => (dispatch) => {
  dispatch({
    type: actions.TOGGLE_COLLAPSE,
    payload: { id: id }
  })
}

// Action to hide components list to display simulation parameters
export const toggleSimulate = () => (dispatch) => {
  dispatch({
    type: actions.TOGGLE_SIMULATE
  })
}
