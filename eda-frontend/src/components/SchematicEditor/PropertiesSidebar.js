import React from 'react'
import PropTypes from 'prop-types'
import { Hidden, List, ListItem, ListItemText, TextField, MenuItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  pages: {
    margin: theme.spacing(0, 1)
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

export default function PropertiesSidebar ({ gridRef }) {
  const classes = useStyles()

  return (
    <>
      <Hidden mdDown>
        <div className={classes.toolbar} />
      </Hidden>
      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Properties</h2>
        </ListItem>

        <GridProperties gridRef={gridRef} />
      </List>
    </>
  )
}

PropertiesSidebar.propTypes = {
  gridRef: PropTypes.object.isRequired
}
