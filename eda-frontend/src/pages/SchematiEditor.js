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
import {fetchSchematic} from '../redux/actions/index'
// import {TermsAndConditions} from '../components/SchematicEditor/ToolbarExtension'
import { useSelector, useDispatch } from 'react-redux'
import api from '../utils/Api'
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

  // const [tAc,settAc] = React.useState(true)
  // const handletAcOpen = () => {
  //   settAc(false)
  // }
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    document.title = 'Schematic Editor - eSim '
    var container = gridRef.current
    var sidebar = compRef.current
    var outline = outlineRef.current

    if(props.location.state !== undefined){
      console.log("id",props.location.state.id)
      //calling the api
      dispatch(fetchSchematic(props.location.state.id))
    }


    LoadGrid(container, sidebar, outline)
  }, [compRef, gridRef, outlineRef])

  return (

    <div className={classes.root}>
      {/* <TermsAndConditions open={tAc} close={handletAcOpen}/> */}

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
