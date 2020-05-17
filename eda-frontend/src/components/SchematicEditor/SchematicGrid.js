import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './Helper/SchematicEditor.css'
import LoadGrid from './Helper/ComponentDrag.js'

export default class SchematicGrid extends Component {
  componentDidMount () {
    var container = this.props.gridRef.current
    var sidebar = this.props.compRef.current
    LoadGrid(container, sidebar)
  }

  render () {
    return (
      <>
        <center>
          <div className="grid-container A4-L" ref={this.props.gridRef} id="divGrid" />
        </center>
      </>
    )
  }
}

SchematicGrid.propTypes = {
  compRef: PropTypes.object.isRequired,
  gridRef: PropTypes.object.isRequired
}
