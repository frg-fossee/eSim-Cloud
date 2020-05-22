import React, { useEffect } from 'react'
import { CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import Layout from '../components/Shared/Layout'
import Header from '../components/SchematicEditor/Header'
import ComponentSidebar from '../components/SchematicEditor/ComponentSidebar'
import LayoutMain from '../components/Shared/LayoutMain'
import SchematicToolbar from '../components/SchematicEditor/SchematicToolbar'
import RightSidebar from '../components/SchematicEditor/RightSidebar'
import PropertiesSidebar from '../components/SchematicEditor/PropertiesSidebar'
import LoadGrid from '../components/SchematicEditor/Helper/ComponentDrag.js'
import '../components/SchematicEditor/Helper/SchematicEditor.css'

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
  const outlineRef = React.createRef()

  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    var container = gridRef.current
    var sidebar = compRef.current
    var outline = outlineRef.current
    LoadGrid(container, sidebar, outline)
  }, [compRef, gridRef, outlineRef])

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Layout header={<Header />} resToolbar={<SchematicToolbar mobileClose={handleDrawerToggle} />} sidebar={<ComponentSidebar compRef={compRef} />} />

      <LayoutMain>
        <div className={classes.toolbar} />
        <center>
          <div className="grid-container A4-L" ref={gridRef} id="divGrid" />
        </center>
      </LayoutMain>

      <RightSidebar mobileOpen={mobileOpen} mobileClose={handleDrawerToggle} >
        <PropertiesSidebar gridRef={gridRef} outlineRef={outlineRef} />
      </RightSidebar>
    </div>
  )
}
