import React from "react";
import { Switch, Route } from "react-router-dom";
import { CssBaseline } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Header from "../components/Dashboard/Header";
import Layout from "../components/Shared/Layout";
import LayoutMain from "../components/Shared/LayoutMain";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import DashboardHome from "../components/Dashboard/DashboardHome";
import SchematicsList from "../components/Dashboard/SchematicsList";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    minHeight: "100vh",
  },
  toolbar: {
    minHeight: "40px",
  },
}));

export default function Dashboard() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Layout resToolbar={<Header />} sidebar={<DashboardSidebar />} />

      <LayoutMain>
        <div className={classes.toolbar} />

        {/* Dashboard Subroutes */}
        <Switch>
          <Route exact path="/dashboard" component={DashboardHome} />
          <Route exact path="/dashboard/profile" />
          <Route
            exact
            path="/dashboard/schematics"
            component={SchematicsList}
          />
        </Switch>
      </LayoutMain>
    </div>
  );
}
