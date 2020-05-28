import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Navbar from './components/Shared/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import SchematicEditor from './pages/SchematiEditor'
import Simulator from './pages/Simulator'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/signUp'

function App () {
  // Routes For SchematicEditor
  const SchematicRoute = () => (
    <>
      <Route exact path="/editor"component={SchematicEditor} />
    </>
  )

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
    <BrowserRouter basename={'/eda'}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/editor" component={SchematicRoute} />
        <Route path="/dashboard" component={UserRoute} />
        <Route exact path="/signup" component={SignUp} />
        <Route component={DefaultRoute} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
