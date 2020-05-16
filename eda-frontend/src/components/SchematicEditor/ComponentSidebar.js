/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import AddSideBarComponentDOM from "./Helper/SidebarDom.js"
import {
  Hidden,
  List,
  ListItem,
  Collapse,
  ListItemIcon
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import './Helper/SchematicEditor.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLibraries, toggleCollapse, fetchComponents } from '../../redux/actions/index'
// import AddSideBarComponent from './Helper/SideBar'

const COMPONENTS_PER_ROW = 3

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

export default function ComponentSidebar (props) {
  const classes = useStyles()
  const libraries = useSelector(state => state.schematicEditorReducer.libraries)
  const collapse = useSelector(state => state.schematicEditorReducer.collapse)
  const components = useSelector(state => state.schematicEditorReducer.components)

  const dispatch = useDispatch()

  const handleCollapse = (id) => {
    console.log('Current: ', collapse[id], components[id].length)

    // Fetches Components for given library if not already fetched
    if(collapse[id]===false && components[id].length===0){
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

  const chunk = (array, size) => {
    return array.reduce((chunks, item, i) => {
      if (i % size === 0) {
        chunks.push([item]);
      } else {
        chunks[chunks.length - 1].push(item);
      }
      return chunks;
    }, []);
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
                chunk(components[library.id], COMPONENTS_PER_ROW).map((component_chunk)=>{
                 return(
                  <ListItem key={component_chunk[0].svg_path} divider>
                  {
                  component_chunk.map((component)=>{
                  return(<ListItemIcon key={component.component_name}>
                  <img src={'../'+component.svg_path} alt="Logo" onLoad={AddSideBarComponentDOM()} />
                  </ListItemIcon>)
                                     }
                          )
                  }
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

        <ListItem>
          <div ref={props.compRef}></div>
        </ListItem>
      </List>
    </>
  )
}
