import { combineReducers } from 'redux'
import schematicEditorReducer from './schematicEditorReducer'
import componentPropertiesReducer from './componentPropertiesReducer'
import netlistReducer from './netlistReducer'
import simulationReducer from './simulationReducer'
import authReducer from './authReducer'
import saveSchematicReducer from './saveSchematicReducer'
import dashboardReducer from './dashboardReducer'
import accountReducer from './accountReducer'
import projectReducer from './projectReducer'
import galleryReducer from './galleryReducer'
export default combineReducers({
  schematicEditorReducer,
  componentPropertiesReducer,
  netlistReducer,
  simulationReducer,
  authReducer,
  saveSchematicReducer,
  dashboardReducer,
  accountReducer,
  projectReducer,
  galleryReducer
})
