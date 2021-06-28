// Main Layout for Submission Page
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
import SubmissionTable from '../components/LTI/SubmissionTable'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh'
  },
  toolbar: {
    minHeight: '40px'
  }
}))

export default function Submissions () {
  const classes = useStyles()
  // var auth = useSelector(state => state.authReducer)

  useEffect(() => {
    document.title = 'Submissions - eSim'
    // eslint-disable-next-line
  }, [])

  return (
    <div className={classes.root}>
      <CssBaseline />

      {/* Submission page header and left side pane */}
      <Layout resToolbar={<Header />} sidebar={<DashboardSidebar />} />

      <LayoutMain>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/dashboard" component={DashboardHome} />
          <Route exact path="/dashboard/profile" />
          <Route
            exact
            path="/dashboard/schematics"
            component={SchematicsList}
          />
        </Switch>
        <SubmissionTable />
      </LayoutMain>
    </div>
  )
}
