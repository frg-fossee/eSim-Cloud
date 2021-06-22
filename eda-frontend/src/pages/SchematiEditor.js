// Main Layout for Schemaic Editor page.
/* eslint-disable react/prop-types */
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
import { fetchSchematic, loadGallery } from '../redux/actions/index'
import { useDispatch } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh'
  },
  toolbar: {
    minHeight: '80px'
  }
}))

export default function SchematiEditor (props) {
  const classes = useStyles()
  const compRef = React.createRef()
  const gridRef = React.createRef()
  const outlineRef = React.createRef()
  const dispatch = useDispatch()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    document.title = 'Schematic Editor - eSim '
    var container = gridRef.current
    var sidebar = compRef.current
    var outline = outlineRef.current
    LoadGrid(container, sidebar, outline)

    if (props.location.search !== '') {
      const query = new URLSearchParams(props.location.search)
      var cktid = query.get('id')

      if (cktid.substr(0, 7) === 'gallery') {
        // Loading Gallery schemaic.
        dispatch(loadGallery(cktid.substr(7, cktid.length)))
      } else {
        // Loading User on-cloud saved schemaic.
        dispatch(fetchSchematic(cktid))
      }
    }
  // eslint-disable-next-line
  }, [])

  return (

    <div className={classes.root}>

      <CssBaseline />

      {/* Schematic editor header, toolbar and left side pane */}
      <Layout header={<Header />} resToolbar={<SchematicToolbar gridRef={gridRef} mobileClose={handleDrawerToggle} />} sidebar={<ComponentSidebar compRef={compRef} />} />

      {/* Grid for drawing and designing circuits */}
      <LayoutMain>
        <div className={classes.toolbar} />
        <center>
          <div className="grid-container A4-L" ref={gridRef} id="divGrid" />
        </center>
      </LayoutMain>

      {/* Schematic editor Right side pane */}
      <RightSidebar mobileOpen={mobileOpen} mobileClose={handleDrawerToggle} >
        <PropertiesSidebar gridRef={gridRef} outlineRef={outlineRef} />
      </RightSidebar>
    </div>
  )
}
