import React from 'react'
import PropTypes from 'prop-types'
import { Hidden, List, ListItem, ListItemText, TextField, MenuItem, TextareaAutosize } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ComponentProperties from './ComponentProperties'
import { useSelector, useDispatch } from 'react-redux'
import { setSchDescription } from '../../redux/actions/index'
import api from "../../utils/Api"
import VersionComponent from "./VersionComponent"

import './Helper/SchematicEditor.css'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  pages: {
    margin: theme.spacing(0, 0.7)
  }
}))

const pageSize = [
  {
    value: 'A1',
    label: 'A1'
  },
  {
    value: 'A2',
    label: 'A2'
  },
  {
    value: 'A3',
    label: 'A3'
  },
  {
    value: 'A4',
    label: 'A4'
  },
  {
    value: 'A5',
    label: 'A5'
  }
]

const pageLayout = [
  {
    value: 'P',
    label: 'Portrait'
  },
  {
    value: 'L',
    label: 'Landscape'
  }
]

// Display grid size and orientation
function GridProperties ({ gridRef }) {
  const classes = useStyles()

  const [gridSize, setGridSize] = React.useState('A4')
  const [gridLayout, setGridLayout] = React.useState('L')

  const handleSizeChange = (event) => {
    setGridSize(event.target.value)
    gridRef.current.className = 'grid-container ' + event.target.value + '-' + gridLayout
  }

  const handleLayoutChange = (event) => {
    setGridLayout(event.target.value)
    gridRef.current.className = 'grid-container ' + gridSize + '-' + event.target.value
  }

  return (
    <>
      <ListItem>
        <ListItemText primary="Grid Properties" />
      </ListItem>
      <ListItem style={{ padding: '10px 5px 15px 5px' }} divider>
        <TextField
          id="filled-select-currency"
          select
          size='small'
          className={classes.pages}
          value={gridSize}
          onChange={handleSizeChange}
          helperText="Grid size"
          variant="outlined"
        >
          {pageSize.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="grid-layout"
          select
          size='small'
          className={classes.pages}
          value={gridLayout}
          onChange={handleLayoutChange}
          helperText="Grid Layout"
          variant="outlined"
        >
          {pageLayout.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </ListItem>

    </>
  )
}
GridProperties.propTypes = {
  gridRef: PropTypes.object.isRequired
}

export default function PropertiesSidebar({ gridRef, outlineRef }) {
  const classes = useStyles()

  const isOpen = useSelector(state => state.componentPropertiesReducer.isPropertiesWindowOpen)
  const schSave = useSelector(state => state.saveSchematicReducer)

  const [description, setDescription] = React.useState(schSave.description)
  const [versions, setVersions] = React.useState(null)
  React.useEffect(() => {
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const token = localStorage.getItem("esim_token")
    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api
      .get(
        "save/versions/" +
          window.location.href.split("?id=")[1].substring(0, 36),
        config
      )
      .then((resp) => {
        console.log(resp.data)
        resp.data.forEach(value => {
          var d = new Date(value.save_time);
          value.date =
            d.getDate() + "/"+
            d.getMonth() +"/"+
          d.getFullYear()
          value.time = d.getHours() + ":" + d.getMinutes();
          if (d.getMinutes() < 10)
          {
            value.time = d.getHours() + ":0" + d.getMinutes();
            }
        })
        setVersions(resp.data)
      });
  }, [])

  const dispatch = useDispatch()

  const getInputValues = (evt) => {
    setDescription(`${evt.target.value}`)
    dispatch(setSchDescription(evt.target.value))
  }

  return (
    <>
      <Hidden mdDown>
        <div className={classes.toolbar} />
      </Hidden>

      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Properties</h2>
        </ListItem>
        <div style={isOpen ? { display: 'none' } : {} }>
          <GridProperties gridRef={gridRef} />

          {/* Display component position box */}
          <ListItem>
            <ListItemText primary="Components Position" />
          </ListItem>
          <ListItem style={{ padding: '0px' }} divider>
            <div className="outline-container" ref={outlineRef} id="outlineContainer" />
          </ListItem>

          {/* Input form field for schematic description */}
          <ListItem>
            <ListItemText primary="Schematic Description" />
          </ListItem>
          <ListItem style={{ padding: '0px 7px 7px 7px' }} divider>
            <TextareaAutosize id='Description' label='Description' value={ schSave.description === '' ? description || '' : schSave.description } onChange={getInputValues} rowsMin={6} aria-label='Description' placeholder={'Add Schematic Description'} style={{ width: '100%', minWidth: '234px', maxHeight: '250px' }} />
          </ListItem>
        </div>
      </List>
      <ComponentProperties />
      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Versions</h2>
        </ListItem>
        {versions !== null ? <>{versions.map((version) => <VersionComponent name={version.name} date={version.date} time={version.time} save_id={version.save_id} version={version.version} />)}</> : <ListItemText>Loading</ListItemText>}
      </List>
    </>
  )
}

PropertiesSidebar.propTypes = {
  gridRef: PropTypes.object.isRequired,
  outlineRef: PropTypes.object.isRequired
}
