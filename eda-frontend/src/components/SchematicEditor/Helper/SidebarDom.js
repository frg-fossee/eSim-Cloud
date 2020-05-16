import mxGraphFactory from "mxgraph";
import comp1 from "../../../static/CircuitComp/4002_1_A.svg";
import getMetadataXML from "./xml_parser";
const {
  mxGraph,
  mxRubberband,
  mxClient,
  mxUtils,
  mxEvent,
  mxPoint,
  mxDragSource,
} = new mxGraphFactory();



export default function AddSideBarComponentDOM() {
 
   var a = document.getElementsByTagName('img')
   console.log(a)
   console.log('image loaded');


}