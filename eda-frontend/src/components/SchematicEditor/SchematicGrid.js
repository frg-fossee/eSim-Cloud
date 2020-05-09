import React, { Component } from "react";
import "./Helper/SchematicEditor.css";

export default class SchematicGrid extends Component {
  render() {
    return <div className="grid-container" ref="divGrid" id="divGrid" />;
  }
}
