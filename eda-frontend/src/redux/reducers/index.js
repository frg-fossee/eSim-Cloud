import { combineReducers } from 'redux'
import schematicEditorReducer from './schematicEditorReducer'
import componentPropertiesReducer from './componentPropertiesReducer'
import netlistReducer from './netlistReducer'
import simulationReducer from './simulationReducer'
export default combineReducers({
  schematicEditorReducer,
  componentPropertiesReducer,
  netlistReducer,
  simulationReducer
})
