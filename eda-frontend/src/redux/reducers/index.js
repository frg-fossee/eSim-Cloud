import { combineReducers } from 'redux'
import schematicEditorReducer from './schematicEditorReducer'
import componentPropertiesReducer from './componentPropertiesReducer'
export default combineReducers({
  schematicEditorReducer,
  componentPropertiesReducer
})
