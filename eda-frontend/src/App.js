/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import Navbar from './components/Shared/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import SchematicEditor from './pages/SchematiEditor'
import Simulator from './pages/Simulator'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/signUp'

import { useSelector, useDispatch } from 'react-redux'
import { loadUser } from './redux/actions/index'

function PrivateRoute ({ component: Component, ...rest }) {
  const auth = useSelector(state => state.authReducer)
  const dispatch = useDispatch()

  useEffect(() => dispatch(loadUser()), [dispatch])

  return <Route {...rest} render={props => {
    if (auth.isLoading) {
      return <em>Loading...</em>
    } else if (!auth.isAuthenticated) {
      return <Redirect to="/login" />
    } else {
      return <Component {...props} />
    }
  }} />
}

function App () {
  // Routes For User
  const UserRoute = () => (
    <>
      <Route component={Dashboard} />
    </>
  )

  // Routes For DeafaultPages
  const DefaultRoute = () => (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/simulator" component={Simulator} />
        <Route component={NotFound} />
      </Switch>
    </>
  )

  return (
    <BrowserRouter basename='/eda'>
      <Switch>
        <Route path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/editor" component={SchematicEditor} />
        <PrivateRoute component={UserRoute} path="/dashboard" />
        <Route component={DefaultRoute} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
