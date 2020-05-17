import mxGraphFactory from "mxgraph";
//import comp1 from "../../../static/CircuitComp/4002_1_A.svg";
//import getMetadataXML from "./xml_parser";
const {
  mxPoint,
  mxConnectionConstraint,
  mxEdgeHandler,
  mxCellEditor,
  mxGraphHandler
} = new mxGraphFactory();

export default function WireConfigFunct(graph) 
{
	var container = document.getElementById("divGrid");
    graph.view.scale=1;
    graph.view.scale = 1;
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setConnectableEdges(true);
    graph.setDisconnectOnMove(false);
    graph.foldingEnabled = false;    
    graph.panningHandler.isPopupTrigger = function() { return false; };

    graph.setEnterStopsCellEditing(true);
    graph.getAllConnectionConstraints = function(terminal){
		var geo = (terminal != null) ? this.getCellGeometry(terminal.cell) : null;
				// eslint-disable-next-line
			   if ((geo != null ? !geo.relative : false) &&
				   this.getModel().isVertex(terminal.cell) &&
				   this.getModel().getChildCount(terminal.cell) === 0)
			   {
					return [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
				    	new mxConnectionConstraint(new mxPoint(1, 0.5), false)];
			    }

				return null;
            };
            graph.connectionHandler.isConnectableCell = function(cell)
			{
				if (this.graph.getModel().isEdge(cell))
				{
					return true;
				}
				else
				{
					var geo = (cell != null) ? this.graph.getCellGeometry(cell) : null;
					
					return (geo != null) ? geo.relative : false;
				}
			};
			mxEdgeHandler.prototype.isConnectableCell = function(cell)
			{
				return graph.connectionHandler.isConnectableCell(cell);
			};
			
			// Adds a special tooltip for edges
            graph.setTooltips(true);
            
            var getTooltipForCell = graph.getTooltipForCell;
			graph.getTooltipForCell = function(cell)
			{
				var tip = '';
				
				if (cell != null)
				{
					var src = this.getModel().getTerminal(cell, true);
					
					if (src != null)
					{
						tip += this.getTooltipForCell(src) + ' ';
					}
					
					var parent = this.getModel().getParent(cell);
					
					if (this.getModel().isVertex(parent))
					{
						tip += this.getTooltipForCell(parent) + '.';
					}
	
					tip += getTooltipForCell.apply(this, arguments);
					
					var trg = this.getModel().getTerminal(cell, false);
					
					if (trg != null)
					{
						tip += ' ' + this.getTooltipForCell(trg);
					}
				}

				return tip;
			};
			var invert = false;
			
			if (invert)
			{
				container.style.backgroundColor = 'black';
				
				// White in-place editor text color
				var mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
				mxCellEditor.prototype.startEditing = function (cell, trigger)
				{
					mxCellEditorStartEditing.apply(this, arguments);
					
					if (this.textarea != null)
					{
						this.textarea.style.color = '#FFFFFF';					
					}
				};
				
				mxGraphHandler.prototype.previewColor = 'white';
            }
            var labelBackground = (invert) ? '#000000' : '#FFFFFF';
			var fontColor = (invert) ? '#FFFFFF' : '#000000';
			var strokeColor = (invert) ? '#C0C0C0' : '#000000';
			//var fillColor = (invert) ? 'none' : '#FFFFFF';
			
			var style = graph.getStylesheet().getDefaultEdgeStyle();
			delete style['endArrow'];
			//style['strokeColor'] = strokeColor;
			style['labelBackgroundColor'] = labelBackground;
			style['edgeStyle'] = 'wireEdgeStyle';
			style['fontColor'] = fontColor;
			style['fontSize'] = '9';
			style['movable'] = '0';
			//style['strokeWidth'] = strokeWidth;
			//style['rounded'] = '1';
			
			// Sets join node size
			//style['startSize'] = joinNodeSize;
			//style['endSize'] = joinNodeSize;
			
			style = graph.getStylesheet().getDefaultVertexStyle();
			style['gradientDirection'] = 'south';
			//style['gradientColor'] = '#909090';
			style['strokeColor'] = strokeColor;
			//style['fillColor'] = '#e0e0e0';
			style['fillColor'] = 'none';
			//style['fontColor'] = fontColor;
			style['fontStyle'] = '1';
			style['fontSize'] = '12';
			style['resizable'] = '0';
			style['rounded'] = '1';
            //style['strokeWidth'] = strokeWidth;
            graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle';



			
}