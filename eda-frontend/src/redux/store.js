// Initialize Redux store which holds the whole state tree of application.
import reducer from './reducers/index'
import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore)
const store = createStoreWithMiddleware(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store
