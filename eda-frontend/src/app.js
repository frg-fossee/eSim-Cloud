import React from "react";
import ReactDOM from "react-dom";
import resistor from "./resistor.svg";
const $ = require("jquery");
window.$ = $;
window.jQuery = $;
require("jquery-ui-bundle/jquery-ui.min.js");

const app = () => {
  return React.createElement("div", { id: "Layout" }, [
    React.createElement("h1", {}, "Adopt me!"),
    React.createElement("div", { className: "Grid" }),
    React.createElement("div", { className: "LeftBox" }, [
      <img src={resistor} alt="Resistor" id="res" class="drop" />,
    ]),
    React.createElement("div", { className: "RightBox" })
    
  ]);
};
ReactDOM.render(React.createElement(app), document.getElementById("root"));
