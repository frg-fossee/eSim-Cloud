// Main Layout for user dashboard.
import React, { useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'
import { CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { Header } from '../components/Shared/Navbar'
import Layout from '../components/Shared/Layout'
import LayoutMain from '../components/Shared/LayoutMain'
import DashboardSidebar from '../components/Dashboard/DashboardSidebar'
import DashboardHome from '../components/Dashboard/DashboardHome'
import SchematicsList from '../components/Dashboard/SchematicsList'
import DashboardPublications from '../components/Dashboard/DashboardPublications'
import DashboardOtherPublications from '../components/Dashboard/DashboardOtherPublications'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh'
  },
  toolbar: {
    minHeight: '40px'
  }
}))

export default function Dashboard() {
  const classes = useStyles()

  useEffect(() => {
    document.title = 'Dashboard - eSim '
  })

  return (
    <div className={classes.root}>
      <CssBaseline />

      {/* Schematic editor header and left side pane */}
      <Layout resToolbar={<Header />} sidebar={<DashboardSidebar />} />

      <LayoutMain>
        <div className={classes.toolbar} />

        {/* Subroutes under dashboard section */}
        <Switch>
          <Route exact path="/dashboard" component={DashboardHome} />
          <Route exact path="/dashboard/profile" />
          <Route
            exact
            path="/dashboard/schematics"
            component={SchematicsList}
          />
          <Route
            exact
            path="/dashboard/reviewpublications"
            component={DashboardOtherPublications}
          />
        </Switch>
      </LayoutMain>
    </div>
  )
}
