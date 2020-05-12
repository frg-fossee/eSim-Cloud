/* eslint-disable react/prop-types */
import React, { Component } from 'react'
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
import comp1 from '../../static/CircuitComp/4002_1_A.svg'
import comp2 from '../../static/CircuitComp/C_1_A.svg'
import comp3 from '../../static/CircuitComp/resistor.svg'
import comp4 from '../../static/CircuitComp/Voltmeter_DC_1_A.svg'

import { connect } from 'react-redux'
import { fetchLibraries } from '../../redux/actions/index'

class ComponentSidebar extends Component {
  constructor (props) {
    super(props)
    this.setState({ open: false })

    this.handleClick = (e) => {
      this.setState({ open: !this.state.open })
    }
  }

  render () {
    return (
      <>
        <Hidden smDown>
          <div className={useStyles.toolbar} />
        </Hidden>

        {/* Display List of categorized components */}
        <List>
          <ListItem button divider>
            <h2 style={{ margin: '5px' }}>Components List</h2>
          </ListItem>

          <ListItem onClick={this.handleClick} button divider>
            <span className={useStyles.head}>Sample Elements</span>
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense="true">
              <ListItem divider>
                <ListItemIcon>
                  <img src={comp1} alt="Logo" />
                </ListItemIcon>
                <ListItemIcon>
                  <img src={comp2} alt="Logo" />
                </ListItemIcon>
                <ListItemIcon>
                  <img src={comp3} alt="Logo" />
                </ListItemIcon>
              </ListItem>

              <ListItem divider>
                <ListItemIcon>
                  <img src={comp4} alt="Logo" />
                </ListItemIcon>
                <ListItemIcon>
                  <img src={comp1} alt="Logo" />
                </ListItemIcon>
                <ListItemIcon>
                  <img src={comp2} alt="Logo" />
                </ListItemIcon>
              </ListItem>
            </List>
          </Collapse>
          <ListItem>
            <div ref={this.props.compRef}></div>
          </ListItem>
        </List>
      </>
    )
  }
}

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

// Redux Bindings
const mapStateToProps = state => ({
  libraries: state.schematicEditorReducer.libraries
})
export default connect(mapStateToProps, { fetchLibraries })(ComponentSidebar)
