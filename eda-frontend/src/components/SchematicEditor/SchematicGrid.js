import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./Helper/SchematicEditor.css";
import LoadGrid from "./Helper/EditerDrop.js";

export default class SchematicGrid extends Component {
  componentDidMount() {
    var container = ReactDOM.findDOMNode(this.refs.divGrid);
    LoadGrid(container);
  }

  render() {
    return <div className="grid-container" ref="divGrid" id="divGrid" />;
  }
}
