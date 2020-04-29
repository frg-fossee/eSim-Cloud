mxGraphView.prototype.updateFixedTerminalPoint = function(edge, terminal, source, constraint)
		{
			var pt = null;
			
			if (constraint != null)
			{
				pt = this.graph.getConnectionPoint(terminal, constraint);
			}

			if (source)
			{
				edge.sourceSegment = null;
			}
			else
			{
				edge.targetSegment = null;
			}
			
			if (pt == null)
			{
				var s = this.scale;
				var tr = this.translate;
				var orig = edge.origin;
				var geo = this.graph.getCellGeometry(edge.cell);
				pt = geo.getTerminalPoint(source);

				// Computes edge-to-edge connection point
				if (pt != null)
				{
					pt = new mxPoint(s * (tr.x + pt.x + orig.x),
									 s * (tr.y + pt.y + orig.y));
					
					// Finds nearest segment on edge and computes intersection
					if (terminal != null && terminal.absolutePoints != null)
					{
						var seg = mxUtils.findNearestSegment(terminal, pt.x, pt.y);

						// Finds orientation of the segment
						var p0 = terminal.absolutePoints[seg];
						var pe = terminal.absolutePoints[seg + 1];
						var horizontal = (p0.x - pe.x == 0);
						
						// Stores the segment in the edge state
						var key = (source) ? 'sourceConstraint' : 'targetConstraint';
						var value = (horizontal) ? 'horizontal' : 'vertical';
						edge.style[key] = value;
						
						// Keeps the coordinate within the segment bounds
						if (horizontal)
						{
							pt.x = p0.x;
							pt.y = Math.min(pt.y, Math.max(p0.y, pe.y));
							pt.y = Math.max(pt.y, Math.min(p0.y, pe.y));
						}
						else
						{
							pt.y = p0.y;
							pt.x = Math.min(pt.x, Math.max(p0.x, pe.x));
							pt.x = Math.max(pt.x, Math.min(p0.x, pe.x));
						}
					}
				}
				// Computes constraint connection points on vertices and ports
				else if (terminal != null && terminal.cell.geometry.relative)
				{
					pt = new mxPoint(this.getRoutingCenterX(terminal),
						this.getRoutingCenterY(terminal));
				}

				// Snaps point to grid
				/*if (pt != null)
				{
					var tr = this.graph.view.translate;
					var s = this.graph.view.scale;
					
					pt.x = (this.graph.snap(pt.x / s - tr.x) + tr.x) * s;
					pt.y = (this.graph.snap(pt.y / s - tr.y) + tr.y) * s;
				}*/
			}

			edge.setAbsoluteTerminalPoint(pt, source);
		};