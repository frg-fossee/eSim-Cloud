mxConnectionHandler.prototype.movePreviewAway = false;
mxConnectionHandler.prototype.waypointsEnabled = true;// What are waypoints?
mxGraph.prototype.resetEdgesOnConnect = false; // What is reset edges?
mxConstants.SHADOWCOLOR = '#C0C0C0';
var joinNodeSize = 7; //connecting node size
var strokeWidth = 2; //stroke width of the wires

// Replaces the port image
mxConstraintHandler.prototype.pointImage = new mxImage('images/dot.gif', 10, 10);
		
// Enables guides
mxGraphHandler.prototype.guidesEnabled = true;

// Alt disables guides
mxGuide.prototype.isEnabledForEvent = function(evt)
{
    return !mxEvent.isAltDown(evt);
};

// Enables snapping waypoints to terminals
mxEdgeHandler.prototype.snapToTerminals = true;

function main(container)
{
    var graph = new mxGraph(container);
    graph.view.scale = 1; //view scale?
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setConnectableEdges(true); // connectable edges
    graph.setDisconnectOnMove(false);
    graph.foldingEnabled = false; // what is folding?

    //Maximum size
			graph.maximumGraphBounds = new mxRectangle(0, 0, 1920, 1080)
			graph.border = 50;

            // Panning handler consumed right click so this must be
			// disabled if right click should stop connection handler.
			graph.panningHandler.isPopupTrigger = function() { return false; };
			
			// **Enables return key to stop editing (use shift-enter for newlines)
            graph.setEnterStopsCellEditing(true);
            
            // Adds rubberband selection - Understood
			new mxRubberband(graph);

            // Makes sure non-relative cells can only be connected via constraints
			graph.connectionHandler.isConnectableCell = function(cell) //understood
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
            mxEdgeHandler.prototype.isConnectableCell = function(cell) //understood
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
            //Switch for black background and bright styles
            var invert = false;
            
            if (invert)
			{
				container.style.backgroundColor = 'black';
				
				// White in-place editor text color
				mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
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
			var fillColor = (invert) ? 'none' : '#FFFFFF';
			
			var style = graph.getStylesheet().getDefaultEdgeStyle();
			delete style['endArrow'];
			style['strokeColor'] = strokeColor;
			style['labelBackgroundColor'] = labelBackground;
			style['edgeStyle'] = 'wireEdgeStyle';
			style['fontColor'] = fontColor;
			style['fontSize'] = '9';
			style['movable'] = '0';
			style['strokeWidth'] = strokeWidth;

			style['startSize'] = joinNodeSize;
			style['endSize'] = joinNodeSize;
			
			style = graph.getStylesheet().getDefaultVertexStyle();
			style['gradientDirection'] = 'south';
			
			style['strokeColor'] = strokeColor;
			
			style['fillColor'] = 'none';
			style['fontColor'] = fontColor;
			style['fontStyle'] = '1';
			style['fontSize'] = '12';
			style['resizable'] = '0';
			style['rounded'] = '1';
			style['strokeWidth'] = strokeWidth;
			configureStylesheet(graph);
            var parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
			try
			{
				var v5 = graph.insertVertex(parent, null, '4001', 150, 70, 200, 400, 'image');
				v5.setConnectable(false);
				//var 51 = graph.insertVertex(v5, null, '1', 50,50,20,20);
				var v51 = graph.insertVertex(v5, null, '', 0, 0, 10, 16,
				'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;'+
				'spacingLeft=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
				v51.geometry.relative = true;
				v51.geometry.offset = new mxPoint(35, 132);
                var v6 = graph.insertVertex(parent, null, 'J1', 400, 40, 70, 170,
						'verticalLabelPosition=top;verticalAlign=bottom;shadow=1;fillColor=' + fillColor);
                v6.setConnectable(false); 
                var v61 = graph.insertVertex(v6, null, '1', 0, 0, 10, 16,
						'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;'+
                        'spacingLeft=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
                v61.geometry.relative = true;
                v61.geometry.offset = new mxPoint(-v61.geometry.width, 3);
                var v62 = v61.clone();
                v62.value='2';
                v62.geometry.offset = new mxPoint(-v61.geometry.width, 23);
                v6.insert(v62);
                var v63 = v61.clone();
                v63.value='3';
                v63.geometry.offset = new mxPoint(-v61.geometry.width, 43);
                v6.insert(v63);
                var v64 = v61.clone();
                v64.value='4';
                v64.geometry.offset = new mxPoint(-v61.geometry.width, 63);
                v6.insert(v64);
                var v65 = v61.clone();
                v65.value='5';
                v65.geometry.offset = new mxPoint(-v61.geometry.width, 83);
                v6.insert(v65);
                var v66 = v61.clone();
                v66.value='6';
                v66.geometry.offset = new mxPoint(-v61.geometry.width, 103);
                v6.insert(v66);
                var v67 = v61.clone();
                v67.value='7';
                v67.geometry.offset = new mxPoint(-v61.geometry.width, 123);
                v6.insert(v67);
                var v68 = v61.clone();
                v68.value='8';
                v68.geometry.offset = new mxPoint(-v61.geometry.width, 143);
                v6.insert(v68);
				var v69 = v61.clone();
				v69.value = '9';
				v69.geometry.x = 1;
				v69.style =	'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;'+
				'spacingRight=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
				v69.geometry.offset = new mxPoint(0, 3);
				v6.insert(v69);
				var v610 = v69.clone();
				v610.value = '10';
				v610.geometry.offset = new mxPoint(0, 23);
				v6.insert(v610);
				var v611 = v69.clone();
				v611.value = '11';
				v611.geometry.offset = new mxPoint(0, 43);
				v6.insert(v611);
				var v612 = v69.clone();
				v612.value = '12';
				v612.geometry.offset = new mxPoint(0, 63);
				v6.insert(v612);
				var v613 = v69.clone();
				v613.value = '13';
				v613.geometry.offset = new mxPoint(0, 83);
				v6.insert(v613);
				var v614 = v69.clone();
				v614.value = '14';
				v614.geometry.offset = new mxPoint(0, 103);
				v6.insert(v614);
				var v615 = v69.clone();
				v615.value = '15';
				v615.geometry.offset = new mxPoint(0, 123);
				v6.insert(v615);
				var v616 = v69.clone();
				v616.value = '16';
				v616.geometry.offset = new mxPoint(0, 143);
				v6.insert(v616);
				
                

				var v1 = graph.insertVertex(parent, null, 'J1', 90, 40, 40, 80,
						'verticalLabelPosition=top;verticalAlign=bottom;shadow=1;fillColor=' + fillColor);
				v1.setConnectable(false); 
				var v11 = graph.insertVertex(v1, null, '1', 0, 0, 10, 16,
						'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;'+
						'spacingLeft=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
				v11.geometry.relative = true;
				v11.geometry.offset = new mxPoint(-v11.geometry.width, 2);
				var v12 = v11.clone();
				v12.value = '2';
				v12.geometry.offset = new mxPoint(-v11.geometry.width, 22);
				v1.insert(v12);
				var v13 = v11.clone();
				v13.value = '3';
				v13.geometry.offset = new mxPoint(-v11.geometry.width, 42);
				v1.insert(v13);
				var v14 = v11.clone();
				v14.value = '4';
				v14.geometry.offset = new mxPoint(-v11.geometry.width, 62);
				v1.insert(v14);

				var v15 = v11.clone();
				v15.value = '5';
				v15.geometry.x = 1;
				v15.style =	'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;'+
					'spacingRight=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
				v15.geometry.offset = new mxPoint(0, 2);
				v1.insert(v15);
				var v16 = v15.clone();
				v16.value = '6';
				v16.geometry.offset = new mxPoint(0, 22);
				v1.insert(v16);
				var v17 = v15.clone();
				v17.value = '7';
				v17.geometry.offset = new mxPoint(0, 42);
				v1.insert(v17);
				var v18 = v15.clone();
				v18.value = '8';
				v18.geometry.offset = new mxPoint(0, 62);
				v1.insert(v18);
				
				var v19 = v15.clone();
				v19.value = 'clk';
				v19.geometry.x = 0.5;
				v19.geometry.y = 1;
				v19.geometry.width = 10;
				v19.geometry.height = 4;
				// NOTE: portConstraint is defined for east direction, so must be inverted here
				v19.style = 'shape=triangle;direction=north;spacingBottom=12;align=center;portConstraint=horizontal;'+
					'fontSize=8;strokeColor=' + strokeColor + ';routingCenterY=0.5;';
				v19.geometry.offset = new mxPoint(-4, -4);
				v1.insert(v19);
				

				var v3 = graph.addCell(graph.getModel().cloneCell(v1));
				v3.value = 'J3';
				v3.geometry.x = 420;
				v3.geometry.y = 340;
			}
			finally
			{
				graph.getModel().endUpdate();
			}
			function configureStylesheet(graph)
			{
				var style = new Object();
				style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
				style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
				style[mxConstants.STYLE_IMAGE] = 'test.svg';
				style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
				style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
				style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
				style[mxConstants.STYLE_SPACING_TOP] = '56';
				style[mxConstants.STYLE_SPACING] = '8';
				style[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
				graph.getStylesheet().putCellStyle('image', style);
				/*style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
				style[mxConstants.STYLE_STROKECOLOR] = '#000000';
				style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
				style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
				style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
				style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
				style[mxConstants.STYLE_IMAGE] = 'images/icons48/gear.png';
				style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
				style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
				style[mxConstants.STYLE_SPACING_TOP] = '56';
				style[mxConstants.STYLE_SPACING] = '8';*/
			
			
			};
			
			// Wire-mode
			var checkbox = document.createElement('input');
			checkbox.setAttribute('type', 'checkbox');
			
			document.body.appendChild(checkbox);
			mxUtils.write(document.body, 'Wire Mode');
			
			// Starts connections on the background in wire-mode
			var connectionHandlerIsStartEvent = graph.connectionHandler.isStartEvent;
			graph.connectionHandler.isStartEvent = function(me)
			{
				return checkbox.checked || connectionHandlerIsStartEvent.apply(this, arguments);
			};
			
			// Avoids any connections for gestures within tolerance except when in wire-mode
			// or when over a port
			var connectionHandlerMouseUp = graph.connectionHandler.mouseUp;
			graph.connectionHandler.mouseUp = function(sender, me)
			{
				if (this.first != null && this.previous != null)
				{
					var point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
					var dx = Math.abs(point.x - this.first.x);
					var dy = Math.abs(point.y - this.first.y);

					if (dx < this.graph.tolerance && dy < this.graph.tolerance)
					{
						// Selects edges in non-wire mode for single clicks, but starts
						// connecting for non-edges regardless of wire-mode
						if (!checkbox.checked && this.graph.getModel().isEdge(this.previous.cell))
						{
							this.reset();
						}
						
						return;
					}
				}
				
				connectionHandlerMouseUp.apply(this, arguments);
			};
			var img = new mxImage("test.svg",15,20);
			console.log(img.src);
			var imgshape = new mxImageShape(15,img.src,false,3,5);
			// Grid
			var checkbox2 = document.createElement('input');
			checkbox2.setAttribute('type', 'checkbox');
			checkbox2.setAttribute('checked', 'true');
			
			document.body.appendChild(checkbox2);
			mxUtils.write(document.body, 'Grid');
			
			mxEvent.addListener(checkbox2, 'click', function(evt)
			{
				if (checkbox2.checked)
				{
					container.style.background = 'url(\'images/wires-grid.gif\')';
				}
				else
				{
					container.style.background = '';
				}
				
				container.style.backgroundColor = (invert) ? 'black' : 'white';
			});
			
			mxEvent.disableContextMenu(container);
		};
			
            
