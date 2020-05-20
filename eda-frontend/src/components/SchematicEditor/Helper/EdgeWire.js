/*
    Adding clipboard functionality to the diagram editor 
*/
/* eslint-disable */
import mxGraphFactory from "mxgraph";


const {
  mxUtils,
  mxEvent,
  mxPoint,
  mxConstants,
  mxConnectionHandler,
  mxEdgeHandler,
  mxEdgeSegmentHandler,
  mxCellHighlight
} = new mxGraphFactory();

export default function EdgeWireFunct() {
    mxConnectionHandler.prototype.createEdgeState = function(me)
		{
			var edge = this.graph.createEdge();
			
			if (this.sourceConstraint != null && this.previous != null)
			{
				edge.style = mxConstants.STYLE_EXIT_X+'='+this.sourceConstraint.point.x+';'+
					mxConstants.STYLE_EXIT_Y+'='+this.sourceConstraint.point.y+';';
			}
			else if (this.graph.model.isEdge(me.getCell()))
			{
				var scale = this.graph.view.scale;
				var tr = this.graph.view.translate;
				var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
						this.graph.snap(me.getGraphY() / scale) - tr.y);
				edge.geometry.setTerminalPoint(pt, true);
			}
			
			return this.graph.view.createState(edge);
		};
		
		// Uses right mouse button to create edges on background (see also: lines 67 ff)
		mxConnectionHandler.prototype.isStopEvent = function(me)
		{
			return me.getState() != null || mxEvent.isRightMouseButton(me.getEvent());
		};
		
        // Updates target terminal point for edge-to-edge connections.
        
		var mxConnectionHandlerUpdateCurrentState = mxConnectionHandler.prototype.updateCurrentState;
		mxConnectionHandler.prototype.updateCurrentState = function(me)
		{
			mxConnectionHandlerUpdateCurrentState.apply(this, arguments);

			if (this.edgeState != null)
			{
				this.edgeState.cell.geometry.setTerminalPoint(null, false);
			
				if (this.shape != null && this.currentState != null &&
					this.currentState.view.graph.model.isEdge(this.currentState.cell))
				{
					var scale = this.graph.view.scale;
					var tr = this.graph.view.translate;
					var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
							this.graph.snap(me.getGraphY() / scale) - tr.y);
					this.edgeState.cell.geometry.setTerminalPoint(pt, false);
				}
			}
		};

		// Updates the terminal and control points in the cloned preview.
		mxEdgeSegmentHandler.prototype.clonePreviewState = function(point, terminal)
		{
			var clone = mxEdgeHandler.prototype.clonePreviewState.apply(this, arguments);
			clone.cell = clone.cell.clone();
			
			if (this.isSource || this.isTarget)
			{
				clone.cell.geometry = clone.cell.geometry.clone();
				
				// Sets the terminal point of an edge if we're moving one of the endpoints
				if (this.graph.getModel().isEdge(clone.cell))
				{
					// TODO: Only set this if the target or source terminal is an edge
					clone.cell.geometry.setTerminalPoint(point, this.isSource);
				}
				else
				{
					clone.cell.geometry.setTerminalPoint(null, this.isSource);				
				}
			}

			return clone;
		};
		
		var mxEdgeHandlerConnect = mxEdgeHandler.prototype.connect;
		mxEdgeHandler.prototype.connect = function(edge, terminal, isSource, isClone, me)
		{
			var result = null;
			var model = this.graph.getModel();
			// eslint-disable-next-line
			var parent = model.getParent(edge);
			
			model.beginUpdate();
			try
			{
				result = mxEdgeHandlerConnect.apply(this, arguments);
				var geo = model.getGeometry(result);
				
				if (geo != null)
				{
					geo = geo.clone();
					var pt = null;
					
					if (model.isEdge(terminal))
					{
						pt = this.abspoints[(this.isSource) ? 0 : this.abspoints.length - 1];
						pt.x = pt.x / this.graph.view.scale - this.graph.view.translate.x;
						pt.y = pt.y / this.graph.view.scale - this.graph.view.translate.y;
			
						var pstate = this.graph.getView().getState(
								this.graph.getModel().getParent(edge));
								
						if (pstate != null)
						{
							pt.x -= pstate.origin.x;
							pt.y -= pstate.origin.y;
						}
						
						pt.x -= this.graph.panDx / this.graph.view.scale;
						pt.y -= this.graph.panDy / this.graph.view.scale;
					}
				
					geo.setTerminalPoint(pt, isSource);
					model.setGeometry(edge, geo);
				}
			}
			finally
			{
				model.endUpdate();
			}
			
			return result;
        };
        var mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
		mxConnectionHandler.prototype.createMarker = function()
		{
			var marker = mxConnectionHandlerCreateMarker.apply(this, arguments);
			
			// Uses complete area of cell for new connections (no hotspot)
			marker.intersects = function(state, evt)
			{
				return true;
			};
			
			// Adds in-place highlighting
			// eslint-disable-next-line
			var mxCellHighlightHighlight = mxCellHighlight.prototype.highlight;
			marker.highlight.highlight = function(state)
			{
				// eslint-disable-next-line
				if (this.state != state)
				{
					if (this.state != null)
					{
						this.state.style = this.lastStyle;
						
						// Workaround for shape using current stroke width if no strokewidth defined
						this.state.style['strokeWidth'] = this.state.style['strokeWidth'] || '1';
						this.state.style['strokeColor'] = this.state.style['strokeColor'] || 'none';
						
						if (this.state.shape != null)
						{
							this.state.view.graph.cellRenderer.configureShape(this.state);
							this.state.shape.redraw();
						}
					}
					
					if (state != null)
					{
						this.lastStyle = state.style;
						state.style = mxUtils.clone(state.style);
						state.style['strokeColor'] = '#00ff00';
						state.style['strokeWidth'] = '3';
						
						if (state.shape != null)
						{
							state.view.graph.cellRenderer.configureShape(state);
							state.shape.redraw();
						}
					}
					
					this.state = state;
				}
			};
			
			return marker;
		};
		
		var mxEdgeHandlerCreateMarker = mxEdgeHandler.prototype.createMarker;
		mxEdgeHandler.prototype.createMarker = function()
		{
			var marker = mxEdgeHandlerCreateMarker.apply(this, arguments);
			
			// Adds in-place highlighting when reconnecting existing edges
			marker.highlight.highlight = this.graph.connectionHandler.marker.highlight.highlight;
			
			return marker;
		}
    
}
