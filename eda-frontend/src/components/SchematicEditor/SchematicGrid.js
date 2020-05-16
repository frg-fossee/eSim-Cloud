import React, { Component } from "react";
import ReactDOM from "react-dom";
import classNames from 'classnames'
//import AddSideBarComponent from "./Helper/SideBar.js"

import "./Helper/SchematicEditor.css";
import LoadGrid from "./Helper/ComponentDrag.js";

export default class SchematicGrid extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      gridSize: "a4",
      btClass: classNames('grid-container', `a4p`),
      orientation: "p"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleRadio = this.handleRadio.bind(this);



  }
  componentDidMount() {
    var container = ReactDOM.findDOMNode(this.refs.divGrid);
    var sidebar = ReactDOM.findDOMNode(this.props.compRef.current);
    //var collapsebar = ReactDOM.findDOMNode(this.props.listref.current)
    LoadGrid(container,sidebar);
  }
  handleChange(event) {
    this.setState({gridSize: event.target.value, btClass:classNames('grid-container',`${event.target.value}${this.state.orientation}`)});
  }

  handleRadio(event){
    
    this.setState({gridSize: this.state.gridSize, 
      btClass:classNames('grid-container',`${this.state.gridSize}${event.target.value}`),
      orientation: event.target.value
    });
    console.log(this.state)
  }
  

  render() {
    return (<><div className={this.state.btClass} ref="divGrid" id="divGrid" />
            
              <div id="propertiesSidebar">
              <span>select grid size: </span>
              <select value={this.state.value} onChange={this.handleChange}>
              <option value="a1">A1</option>
              <option value="a2">A2</option>
                <option value="a3">A3</option>
            
                
                <option selected value="a4">A4</option>
               
               
                <option value="a5">A5</option>
              </select>
             
              
                <div className="radio">
                select orientation: 
                <label>
                  <input type="radio" value="p" onClick={this.handleRadio} checked={this.state.orientation === 'p'} />
                  Portrait
                </label>
                <label>
                  <input type="radio" value="l" onClick={this.handleRadio} checked={this.state.orientation === 'l'} />
                  Landscape
                </label>
              </div>

              
              </div>
    </>);
  }
}
