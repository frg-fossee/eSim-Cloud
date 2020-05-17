//import mxGraphFactory from "mxgraph";
//import comp1 from "../../../static/CircuitComp/4002_1_A.svg";
//import getMetadataXML from "./xml_parser";
import AddSideBarComponentDOMd from "./DraggableDOM.js"
/*const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
  mxPoint,
  mxDragSource,
} = new mxGraphFactory();*/



export default function AddSideBarComponentDOM() {
 
   var a = document.getElementsByTagName('img')
   
Array.from(a).forEach(function (element) { 
    AddSideBarComponentDOMd(element)
    console.log(element) 
  }); 



}