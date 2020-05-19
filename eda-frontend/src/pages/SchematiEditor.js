import React from 'react'
import { CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import Layout from '../components/Shared/Layout'
import Header from '../components/SchematicEditor/Header'
import ComponentSidebar from '../components/SchematicEditor/ComponentSidebar'
import LayoutMain from '../components/Shared/LayoutMain'
import SchematicGrid from '../components/SchematicEditor/SchematicGrid'
import SchematicToolbar from '../components/SchematicEditor/SchematicToolbar'
import RightSidebar from '../components/SchematicEditor/RightSidebar'
import PropertiesSidebar from '../components/SchematicEditor/PropertiesSidebar'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh'
  },
  toolbar: {
    minHeight: '80px'
  }
}))

export default function SchematiEditor () {
  const classes = useStyles()

  const compRef = React.createRef()
  const gridRef = React.createRef()

  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Layout header={<Header />} resToolbar={<SchematicToolbar mobileClose={handleDrawerToggle} />} sidebar={<ComponentSidebar compRef={compRef} />} />

      <LayoutMain>
        <div className={classes.toolbar} />
        <SchematicGrid gridRef={gridRef} compRef={compRef} />
      </LayoutMain>

      <RightSidebar mobileOpen={mobileOpen} mobileClose={handleDrawerToggle} >
        <PropertiesSidebar gridRef={gridRef} />
      </RightSidebar>
    </div>
  )
}
