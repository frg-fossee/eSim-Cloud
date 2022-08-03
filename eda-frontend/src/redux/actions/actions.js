// Actions for schematic editor
export const FETCH_LIBRARIES = 'FETCH_LIBRARIES'
export const FETCH_LIBRARY = 'FETCH_LIBRARY'
export const REMOVE_LIBRARY = 'REMOVE_LIBRARY'
export const FETCH_ALL_LIBRARIES = 'FETCH_ALL_LIBRARIES'
export const FETCH_CUSTOM_LIBRARIES = 'FETCH_CUSTOM_LIBRARIES'
export const DELETE_LIBRARY = 'DELETE_LIBRARY'
export const UPLOAD_LIBRARIES = 'UPLOAD_LIBRARIES'
export const RESET_UPLOAD_SUCCESS = 'RESET_UPLOAD_SUCCESS'
export const TOGGLE_COLLAPSE = 'TOGGLE_COLLAPSE'
export const FETCH_COMPONENTS = 'FETCH_COMPONENTS'
export const TOGGLE_SIMULATE = 'TOGGLE_SIMULATE'

// Actions for handleing component properties
export const GET_COMP_PROPERTIES = 'GET_COMP_PROPERTIES'
export const SET_COMP_PROPERTIES = 'SET_COMP_PROPERTIES'
export const CLOSE_COMP_PROPERTIES = 'CLOSE_COMP_PROPERTIES'
export const CLOSE_COMP_PROPERTIES_TEMP = 'CLOSE_COMP_PROPERTIES_TEMP'

// Actions for handleing and generating netlist
export const SET_NETLIST = 'SET_NETLIST'
export const SET_TITLE = 'SET_TITLE'
export const SET_MODEL = 'SET_MODEL'
export const SET_CONTROL_LINE = 'SET_CONTROL_LINE'
export const SET_CONTROL_BLOCK = 'SET_CONTROL_BLOCK'

// Actions for handleing simualtion result display
export const SET_RESULT_TITLE = 'SET_RESULT_TITLE'
export const SET_RESULT_GRAPH = 'SET_RESULT_GRAPH'
export const SET_RESULT_TEXT = 'SET_RESULT_TEXT'

// Actions for handleing user authentication and registeration
export const USER_LOADING = 'USER_LOADING'
export const USER_LOADED = 'USER_LOADED'
export const LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL'
export const AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
export const LOGIN_FAILED = 'LOGIN_FAILED'
export const LOGOUT_SUCCESSFUL = 'LOGOUT_SUCCESSFUL'
export const LOADING_FAILED = 'LOADING_FAILED'
export const SIGNUP_SUCCESSFUL = 'SIGNUP_SUCCESSFUL'
export const SIGNUP_FAILED = 'SIGNUP_FAILED'
export const DEFAULT_STORE = 'DEFAULT_STORE'
export const RESET_PASSWORD_SUCCESSFUL = 'RESET_PASSWORD_SUCCESSFUL'
export const RESET_PASSWORD_FAILED = 'RESET_PASSWORD_FAILED'
export const RESET_PASSWORD_CONFIRM_SUCCESSFUL = 'RESET_PASSWORD_CONFIRM_SUCCESSFUL'
export const RESET_PASSWORD_CONFIRM_FAILED = 'RESET_PASSWORD_CONFIRM_FAILED'
export const ROLE_LOADED = 'ROLE_LOADED'

// Actions for saving scheamtics and loading saved, gallery and local schematics.
export const SAVE_SCHEMATICS = 'SAVE_SCHEMATICS'
export const SET_SCH_SAVED = 'SET_SCH_SAVED'
export const SET_SCH_TITLE = 'SET_SCH_TITLE'
export const SET_SCH_DESCRIPTION = 'SET_SCH_DESCRIPTION'
export const SET_SCH_XML_DATA = 'SET_SCH_XML_DATA'
export const SET_SCH_SHARED = 'SET_SCH_SHARED'
export const CLEAR_DETAILS = 'CLEAR_DETAILS'

// Action for fetching on-cloud saved schematics for authenticated user to display in dashboard
export const FETCH_SCHEMATICS = 'FETCH_SCHEMATICS'

// Action for fetching on-cloud gallery for everyone
export const FETCH_GALLERY = 'FETCH_GALLERY'

// Actions for accounts page
export const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS'
export const CHANGE_PASSWORD_FAILED = 'CHANGE_PASSWORD_FAILED'

export const FETCH_MY_PROJECTS = 'FETCH_MY_PROJECTS'
export const FETCH_PUBLIC_PROJECTS = 'FETCH_PUBLIC_PROJECTS'
export const FETCH_OTHER_PROJECTS = 'FETCH_OTHER_PROJECTS'

// Actions for handling Projects
export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT'
export const DELETE_PROJECT = 'DELETE_PROJECT'
export const FETCH_REPORTS = 'FETCH_REPORTS'
export const RESOLVE_REPORTS = 'RESOLVE_REPORTS'
export const GET_STATES = 'GET_STATES'
export const SET_STATE = 'SET_STATE'
