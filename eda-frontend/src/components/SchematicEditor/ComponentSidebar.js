import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
// import AddSideBarComponentDOM from './Helper/SidebarDom.js'
import {
  Hidden,
  List,
  ListItem,
  Collapse,
  ListItemText,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import './Helper/SchematicEditor.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLibraries, toggleCollapse, fetchComponents } from '../../redux/actions/index'
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state"
import Popover from "@material-ui/core/Popover"

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  nested: {
    paddingLeft: theme.spacing(2),
    width: '100%'
  },
  head: {
    marginRight: 'auto'
  }
}))

export default function ComponentSidebar ({ compRef }) {
  const classes = useStyles()
  const libraries = useSelector(state => state.schematicEditorReducer.libraries)
  const collapse = useSelector(state => state.schematicEditorReducer.collapse)
  const components = useSelector(state => state.schematicEditorReducer.components)

  const dispatch = useDispatch()

  const handleCollapse = (id) => {
    console.log('Current: ', collapse[id], components[id].length)

    // Fetches Components for given library if not already fetched
    if (collapse[id] === false && components[id].length === 0) {
      console.log('Components not fetched earlier, fetching.')
      dispatch(fetchComponents(id))
    }

    // Updates state of collapse to show/hide dropdown
    dispatch(toggleCollapse(id))
    console.log(collapse)
  }

  // For Fetching Libraries
  useEffect(() => {
    dispatch(fetchLibraries())
  }, [dispatch])


// Generates Component Listing and It's Pop Over
const generateComponent = (component) => {
  return (
    <PopupState variant="popover" popupId={component.full_name}>
    {popupState => (
      <div>
    <ListItem key={component.full_name} {...bindTrigger(popupState)}>
    {/* <img src={'../'+component.svg_path} alt="Logo" onLoad={AddSideBarComponentDOM()} /> */}
      {component.full_name}
    </ListItem>

    <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: "center",
                horizontal: "right"
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "left"
              }}
    >
      <List component="div" disablePadding dense >
        <ListItem>
          <b>Description:</b> {component.description}
        </ListItem>

        <ListItem>
        <b>Keywords:</b> {component.keyword}
        </ListItem>

        <ListItem>
        <b>Datasheet:</b> <a href={component.data_link}>{component.data_link}</a>
        </ListItem>

        <ListItem>
        <b>DMG:</b> {component.dmg}
        </ListItem>

     </List>
     </Popover>
    </div>
        )}
    </PopupState>
  )
}




  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>

       {/* Display List of categorized components */}
       <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Components List</h2>
        </ListItem>

        {/* Collapsing List Mapped by Libraries fetched by the API */}
        {
          libraries.map(
            (library) => {
              return (
                <div key={library.id}>
                  <ListItem onClick={(e, id = library.id) => handleCollapse(id)} button divider>
                    <span className={classes.head}>{library.library_name}</span>
                    {collapse[library.id] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={collapse[library.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense >

                {/* Chunked Components of Library */}
                {
                components[library.id].map((component)=>{
                 return(
                  <ListItem key={component.full_name} divider>
                    <ListItemText component="div" disablePadding dense >
                  {
                      generateComponent(component)
                  }
                   </ListItemText>
                  </ListItem>
                      )
                 })
                 }

                    </List>
                  </Collapse>
                </div>
              )
            }
          )
        }

        <ListItem ref={compRef}>
        </ListItem>
      </List>
    </>
  )
}

ComponentSidebar.propTypes = {
  compRef: PropTypes.object.isRequired
}
