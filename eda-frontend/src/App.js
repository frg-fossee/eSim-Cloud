/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'

import Navbar from './components/Shared/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import SchematicEditor from './pages/SchematiEditor'
import Simulator from './pages/Simulator'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/signUp'

import { useDispatch } from 'react-redux'
import store from './redux/store'
import { loadUser } from './redux/actions/index'

function PrivateRoute ({ component: Component, ...rest }) {
  const auth = store.getState().authReducer
  const dispatch = useDispatch()

  useEffect(() => dispatch(loadUser()), [dispatch])

  return <Route {...rest} render={props => {
    if (auth.isLoading) {
      return <CircularProgress style={{ margin: '50vh 50vw' }} />
    } else if (!auth.isAuthenticated) {
      return <Redirect to="/login" />
    } else {
      return <Component {...props} />
    }
  }} />
}

function PublicRoute ({ component: Component, restricted, nav, ...rest }) {
  const auth = store.getState().authReducer
  const dispatch = useDispatch()

  useEffect(() => dispatch(loadUser()), [dispatch])

  return <Route {...rest} render={props => {
    if (auth.isLoading) {
      return <CircularProgress style={{ margin: '50vh 50vw' }} />
    } else if (auth.isAuthenticated && restricted) {
      return <Redirect to="/dashboard" />
    } else if (nav) {
      return (<><Navbar /><Component {...props} /></>)
    } else {
      return <Component {...props} />
    }
  }} />
}

function App () {
  return (
    <BrowserRouter basename='/eda'>
      <Switch>
        <PublicRoute exact path="/login" restricted={true} nav={false} component={Login} />
        <PublicRoute exact path="/signup" restricted={true} nav={false} component={SignUp} />
        <PublicRoute exact path="/" restricted={false} nav={true} component={Home} />
        {localStorage.getItem('esim_token') !== null
          ? <PublicRoute exact path="/editor" restricted={false} nav={false} component={SchematicEditor} />
          : <Route path="/editor" component={SchematicEditor} />
        }
        <PublicRoute exact path="/simulator" restricted={false} nav={true} component={Simulator} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <PublicRoute restricted={false} nav={true} component={NotFound} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
