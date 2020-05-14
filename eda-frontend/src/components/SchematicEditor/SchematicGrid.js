import React, { Component } from "react";
import ReactDOM from "react-dom";
//import AddSideBarComponent from "./Helper/SideBar.js"

import "./Helper/SchematicEditor.css";
import LoadGrid from "./Helper/ComponentDrag.js";


export default class SchematicGrid extends Component {
  componentDidMount() {
    var container = ReactDOM.findDOMNode(this.refs.divGrid);
    var sidebar = ReactDOM.findDOMNode(this.props.compRef.current);
    //var collapsebar = ReactDOM.findDOMNode(this.props.listref.current)
    LoadGrid(container,sidebar);
  }

  render() {
    return <div className="grid-container" ref="divGrid" id="divGrid" />;
  }
}
