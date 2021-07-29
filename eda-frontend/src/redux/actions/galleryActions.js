/* eslint-disable camelcase */
import * as actions from './actions'
import api from '../../utils/Api'
import { renderGalleryXML } from '../../components/SchematicEditor/Helper/ToolbarTools'
import { setTitle } from './index'
import { fetchLibrary, removeLibrary } from './schematicEditorActions'
import { setSchTitle, setSchDescription, setSchXmlData } from './saveSchematicActions'

// Action for Loading Gallery schematics
export const fetchGallery = () => (dispatch, getState) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.get('save/gallery', config)
    .then((res) => {
      console.log(res.data)
      const data = res.data
      dispatch({
        type: actions.FETCH_GALLERY,
        payload: data
      })
      dispatch(setTitle('* ' + data.name))
      dispatch(setSchTitle(data.name))
      dispatch(setSchDescription(data.description))
      dispatch(setSchXmlData(data.data_dump))

      renderGalleryXML(data.data_dump)
      if (data.esim_libraries.length > 0) {
        getState().schematicEditorReducer.libraries.forEach(e => dispatch(removeLibrary(e.id)))
        data.esim_libraries.forEach(e => dispatch(fetchLibrary(e.id)))
      }
      dispatch({
        type: actions.FETCH_GALLERY,
        payload: res.data
      })
    })
    .catch((err) => { console.error(err) })
}

// Api call to delete the schematic in gallery [role required: Staff]
export const deleteGallerySch = (Id) => (dispatch, getState) => {
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
  console.log('deleting ', Id)
  api
    .delete('save/gallery/' + Id, config)
    .then(
      (res) => {
        console.log('Called delete for: ', res)
        dispatch(fetchGallery())
      }
    )
    .catch((err) => { console.error(err) })
}
