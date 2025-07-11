export function orthogonalConnectionPathing(){
    mxEdgeStyle.WireConnector = function(state, sourceScaled, targetScaled, controlHints, result)
	{
		var graph = state.view.graph;
		var sourceEdge = source == null ? false : graph.getModel().isEdge(source.cell);
		var targetEdge = target == null ? false : graph.getModel().isEdge(target.cell);

		var pts = mxEdgeStyle.scalePointArray(state.absolutePoints, state.view.scale);
		var source = mxEdgeStyle.scaleCellState(sourceScaled, state.view.scale);
		var target = mxEdgeStyle.scaleCellState(targetScaled, state.view.scale);

        var p0 = pts[0];
		var pe = pts[pts.length-1];

        // changes for edge connections
        if (target != null && source != null && target.cell.edge && target.cell == source.cell){
            var edgeTarget = target;
            target = null;
            var edgeSource = source;
            source = null;
        }

        if (target != null && target.cell.edge){
            var edgeTarget = target;
            target = null;
        }

        if (source != null && source.cell.edge){
            var edgeSource = source;
            source = null;
        }

        //

        //console.log(pe);
		
		var sourceX = source != null ? source.x : p0.x;
		var sourceY = source != null ? source.y : p0.y;
		var sourceWidth = source != null ? source.width : 0;
		var sourceHeight = source != null ? source.height : 0;
		
		var targetX = target != null ? target.x : pe.x;
		var targetY = target != null ? target.y : pe.y;
		var targetWidth = target != null ? target.width : 0;
		var targetHeight = target != null ? target.height : 0;

		var sourceBuffer = mxEdgeStyle.getJettySize(state, true);
		var targetBuffer = mxEdgeStyle.getJettySize(state, false);
		
		//console.log('sourceBuffer', sourceBuffer);
		//console.log('targetBuffer', targetBuffer);
		// Workaround for loop routing within buffer zone
		if (source != null && target == source)
		{
			targetBuffer = Math.max(sourceBuffer, targetBuffer);
			sourceBuffer = targetBuffer;
		}
		
		var totalBuffer = targetBuffer + sourceBuffer;
		// console.log('totalBuffer', totalBuffer);
		var tooShort = false;
		
		// Checks minimum distance for fixed points and falls back to segment connector
		if (p0 != null && pe != null)
		{
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			
			tooShort = dx * dx + dy * dy < totalBuffer * totalBuffer;
		}

		if (tooShort || (mxEdgeStyle.orthPointsFallback && (controlHints != null &&
				controlHints.length > 0)) || sourceEdge || targetEdge)
		{
			mxEdgeStyle.SegmentConnector(state, sourceScaled, targetScaled, controlHints, result);
			
			return;
		}

		// Determine the side(s) of the source and target vertices
		// that the edge may connect to
		// portConstraint [source, target]
		var portConstraint = [mxConstants.DIRECTION_MASK_ALL, mxConstants.DIRECTION_MASK_ALL];
		var rotation = 0;
		
		if (source != null)
		{
			portConstraint[0] = mxUtils.getPortConstraints(source, state, true, 
					mxConstants.DIRECTION_MASK_ALL);
			rotation = mxUtils.getValue(source.style, mxConstants.STYLE_ROTATION, 0);
			
			//console.log('source rotation', rotation);
			
			if (rotation != 0)
			{
				var newRect = mxUtils.getBoundingBox(new mxRectangle(sourceX, sourceY, sourceWidth, sourceHeight), rotation);
				sourceX = newRect.x; 
				sourceY = newRect.y;
				sourceWidth = newRect.width;
				sourceHeight = newRect.height;
			}
		}

		if (target != null)
		{
			portConstraint[1] = mxUtils.getPortConstraints(target, state, false,
				mxConstants.DIRECTION_MASK_ALL);
			rotation = mxUtils.getValue(target.style, mxConstants.STYLE_ROTATION, 0);
			
			//console.log('target rotation', rotation);

			if (rotation != 0)
			{
				var newRect = mxUtils.getBoundingBox(new mxRectangle(targetX, targetY, targetWidth, targetHeight), rotation);
				targetX = newRect.x;
				targetY = newRect.y;
				targetWidth = newRect.width;
				targetHeight = newRect.height;
			}
		}

		//console.log('source' , sourceX, sourceY, sourceWidth, sourceHeight);
		//console.log('targetX' , targetX, targetY, targetWidth, targetHeight);

		var dir = [0, 0];

		// Work out which faces of the vertices present against each other
		// in a way that would allow a 3-segment connection if port constraints
		// permitted.
		// geo -> [source, target] [x, y, width, height]

		var geo = [ [sourceX, sourceY, sourceWidth, sourceHeight] ,
		            [targetX, targetY, targetWidth, targetHeight] ];
        
		var buffer = [sourceBuffer, targetBuffer];


		for (var i = 0; i < 2; i++)
		{
			mxEdgeStyle.limits[i][1] = geo[i][0] - buffer[i];
			mxEdgeStyle.limits[i][2] = geo[i][1] - buffer[i];
			mxEdgeStyle.limits[i][4] = geo[i][0] + geo[i][2] + buffer[i];
			mxEdgeStyle.limits[i][8] = geo[i][1] + geo[i][3] + buffer[i];
		}
		
		// Work out which quad the target is in
		var sourceCenX = geo[0][0] + geo[0][2] / 2.0;
		var sourceCenY = geo[0][1] + geo[0][3] / 2.0;
		var targetCenX = pe.x//geo[1][0]// + geo[1][2] / 2.0;
		var targetCenY = pe.y//geo[1][1]// + geo[1][3] / 2.0;
		
		var dx = sourceCenX - targetCenX;
		var dy = sourceCenY - targetCenY;

		var quad = 0;

		// 0 | 1
		// -----
		// 3 | 2
		
		if (dx < 0)
		{
			if (dy < 0)
			{
				quad = 2;
			}
			else
			{
				quad = 1;
			}
		}
		else
		{
			if (dy <= 0)
			{
				quad = 3;
				
				// Special case on x = 0 and negative y
				if (dx == 0)
				{
					quad = 2;
				}
			}
		}


		// Check for connection constraints
		var currentTerm = null;
		
		if (source != null)
		{
			currentTerm = p0;
		}

		var constraint = [ [0.5, 0.5] , [0.5, 0.5] ];
        //var geo = [ [sourceX, sourceY, sourceWidth, sourceHeight] ,

		for (var i = 0; i < 2; i++)
		{
			if (currentTerm != null)
			{
				constraint[i][0] = (currentTerm.x - geo[i][0]) / geo[i][2];
				
				if (Math.abs(currentTerm.x - geo[i][0]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_WEST;
				}
				else if (Math.abs(currentTerm.x - geo[i][0] - geo[i][2]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_EAST;
				}

				constraint[i][1] = (currentTerm.y - geo[i][1]) / geo[i][3];

				if (Math.abs(currentTerm.y - geo[i][1]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_NORTH;
				}
				else if (Math.abs(currentTerm.y - geo[i][1] - geo[i][3]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_SOUTH;
				}
			}


			currentTerm = null;
			
			if (target != null)
			{
				currentTerm = pe;
			}
		}

        if  (edgeTarget != null){
            var prefDir = edgeDirection(edgeTarget, p0, pe); 
            if (prefDir != null){
                dir[1] = prefDir;
            }
        }

        if  (edgeSource != null){
            var prefDir = edgeDirection(edgeSource, pe, p0); 
            if (prefDir != null){
                dir[0] = prefDir;
            }
        }

		var sourceTopDist = geo[0][1] - (geo[1][1] + geo[1][3]);
		var sourceLeftDist = geo[0][0] - (geo[1][0] + geo[1][2]);
		var sourceBottomDist = geo[1][1] - (geo[0][1] + geo[0][3]);
		var sourceRightDist = geo[1][0] - (geo[0][0] + geo[0][2]);

		mxEdgeStyle.vertexSeperations[1] = Math.max(sourceLeftDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[2] = Math.max(sourceTopDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[4] = Math.max(sourceBottomDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[3] = Math.max(sourceRightDist - totalBuffer, 0);	
		//==============================================================
		// Start of source and target direction determination

		// Work through the preferred orientations by relative positioning
		// of the vertices and list them in preferred and available order
		
		var dirPref = [];
		var horPref = [];
		var vertPref = [];

		horPref[0] = (sourceLeftDist >= sourceRightDist) ? mxConstants.DIRECTION_MASK_WEST
				: mxConstants.DIRECTION_MASK_EAST;
		vertPref[0] = (sourceTopDist >= sourceBottomDist) ? mxConstants.DIRECTION_MASK_NORTH
				: mxConstants.DIRECTION_MASK_SOUTH;

		horPref[1] = mxUtils.reversePortConstraints(horPref[0]);
		vertPref[1] = mxUtils.reversePortConstraints(vertPref[0]);
		
		var preferredHorizDist = sourceLeftDist >= sourceRightDist ? sourceLeftDist
				: sourceRightDist;
		var preferredVertDist = sourceTopDist >= sourceBottomDist ? sourceTopDist
				: sourceBottomDist;


		var prefOrdering = [ [0, 0] , [0, 0] ];
		var preferredOrderSet = false;

		// If the preferred port isn't available, switch it
		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}

			if ((horPref[i] & portConstraint[i]) == 0)
			{
				horPref[i] = mxUtils.reversePortConstraints(horPref[i]);
			}

			if ((vertPref[i] & portConstraint[i]) == 0)
			{
				vertPref[i] = mxUtils
						.reversePortConstraints(vertPref[i]);
			}

			prefOrdering[i][0] = vertPref[i];
			prefOrdering[i][1] = horPref[i];
		}

		if (preferredVertDist > 0
				&& preferredHorizDist > 0)
		{
			// Possibility of two segment edge connection
			if (((horPref[0] & portConstraint[0]) > 0)
					&& ((vertPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = horPref[0];
				prefOrdering[0][1] = vertPref[0];
				prefOrdering[1][0] = vertPref[1];
				prefOrdering[1][1] = horPref[1];
				preferredOrderSet = true;
			}
			else if (((vertPref[0] & portConstraint[0]) > 0)
					&& ((horPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = vertPref[0];
				prefOrdering[0][1] = horPref[0];
				prefOrdering[1][0] = horPref[1];
				prefOrdering[1][1] = vertPref[1];
				preferredOrderSet = true;
			}
		}
		
		if (preferredVertDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = vertPref[0];
			prefOrdering[0][1] = horPref[0];
			prefOrdering[1][0] = vertPref[1];
			prefOrdering[1][1] = horPref[1];
			preferredOrderSet = true;

		}
		
		if (preferredHorizDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = horPref[0];
			prefOrdering[0][1] = vertPref[0];
			prefOrdering[1][0] = horPref[1];
			prefOrdering[1][1] = vertPref[1];
			preferredOrderSet = true;
		}

		// The source and target prefs are now an ordered list of
		// the preferred port selections
		// If the list contains gaps, compact it

		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}

			if ((prefOrdering[i][0] & portConstraint[i]) == 0)
			{
				prefOrdering[i][0] = prefOrdering[i][1];
			}

			dirPref[i] = prefOrdering[i][0] & portConstraint[i];
			dirPref[i] |= (prefOrdering[i][1] & portConstraint[i]) << 8;
			dirPref[i] |= (prefOrdering[1 - i][i] & portConstraint[i]) << 16;
			dirPref[i] |= (prefOrdering[1 - i][1 - i] & portConstraint[i]) << 24;

			if ((dirPref[i] & 0xF) == 0)
			{
				dirPref[i] = dirPref[i] << 8;
			}
			
			if ((dirPref[i] & 0xF00) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xF) | dirPref[i] >> 8;
			}
			
			if ((dirPref[i] & 0xF0000) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xFFFF)
						| ((dirPref[i] & 0xF000000) >> 8);
			}

			dir[i] = dirPref[i] & 0xF;

			if (portConstraint[i] == mxConstants.DIRECTION_MASK_WEST
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_NORTH
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_EAST
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_SOUTH)
			{
				dir[i] = portConstraint[i];
			}
		}

		//==============================================================
		// End of source and target direction determination

		var sourceIndex = dir[0] == mxConstants.DIRECTION_MASK_EAST ? 3
				: dir[0];
		var targetIndex = dir[1] == mxConstants.DIRECTION_MASK_EAST ? 3
				: dir[1];

		sourceIndex -= quad;
		targetIndex -= quad;

		if (sourceIndex < 1)
		{
			sourceIndex += 4;
		}
		
		if (targetIndex < 1)
		{
			targetIndex += 4;
		}

		var routePattern = mxEdgeStyle.routePatterns[sourceIndex - 1][targetIndex - 1];
		
		//console.log('routePattern', routePattern);

		mxEdgeStyle.wayPoints1[0][0] = p0.x;
		mxEdgeStyle.wayPoints1[0][1] = p0.y;



		switch (dir[0])
		{
			case mxConstants.DIRECTION_MASK_WEST:
				mxEdgeStyle.wayPoints1[0][0] -= sourceBuffer;
				//mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case mxConstants.DIRECTION_MASK_SOUTH:
				//mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				mxEdgeStyle.wayPoints1[0][1] += sourceBuffer;
				break;
			case mxConstants.DIRECTION_MASK_EAST:
				mxEdgeStyle.wayPoints1[0][0] +=  sourceBuffer;
				//mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case mxConstants.DIRECTION_MASK_NORTH:
				//mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				mxEdgeStyle.wayPoints1[0][1] -= sourceBuffer;
				break;
		}

        //console.log(mxEdgeStyle.wayPoints1[0][0]-p0.x);
        //console.log(mxEdgeStyle.wayPoints1[0][1]-p0.y);

		var currentIndex = 0;

		// Orientation, 0 horizontal, 1 vertical
		var lastOrientation = (dir[0] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0
				: 1;
		var initialOrientation = lastOrientation;
		var currentOrientation = 0;

		for (var i = 0; i < routePattern.length; i++)
		{
			var nextDirection = routePattern[i] & 0xF;

			// Rotate the index of this direction by the quad
			// to get the real direction
			var directionIndex = nextDirection == mxConstants.DIRECTION_MASK_EAST ? 3
					: nextDirection;

			directionIndex += quad;

			if (directionIndex > 4)
			{
				directionIndex -= 4;
			}

			var direction = mxEdgeStyle.dirVectors[directionIndex - 1];

			currentOrientation = (directionIndex % 2 > 0) ? 0 : 1;
			// Only update the current index if the point moved
			// in the direction of the current segment move,
			// otherwise the same point is moved until there is 
			// a segment direction change
			if (currentOrientation != lastOrientation)
			{
				currentIndex++;
				// Copy the previous way point into the new one
				// We can't base the new position on index - 1
				// because sometime elbows turn out not to exist,
				// then we'd have to rewind.
				mxEdgeStyle.wayPoints1[currentIndex][0] = mxEdgeStyle.wayPoints1[currentIndex - 1][0];
				mxEdgeStyle.wayPoints1[currentIndex][1] = mxEdgeStyle.wayPoints1[currentIndex - 1][1];
			}

			var tar = (routePattern[i] & mxEdgeStyle.TARGET_MASK) > 0;
			var sou = (routePattern[i] & mxEdgeStyle.SOURCE_MASK) > 0;
			var side = (routePattern[i] & mxEdgeStyle.SIDE_MASK) >> 5;
			side = side << quad;

			if (side > 0xF)
			{
				side = side >> 4;
			}

			var center = (routePattern[i] & mxEdgeStyle.CENTER_MASK) > 0;

			if ((sou || tar) && side < 9)
			{
				var limit = 0;
				var souTar = sou ? 0 : 1;

				if (center && currentOrientation == 0)
				{
					limit = geo[souTar][0] + constraint[souTar][0] * geo[souTar][2];

				}
				else if (center)
				{
					limit = geo[souTar][1] + constraint[souTar][1] * geo[souTar][3];
				}
				else
				{
					limit = mxEdgeStyle.limits[souTar][side];
				}
				
				if (currentOrientation == 0)
				{
					var lastX = mxEdgeStyle.wayPoints1[currentIndex][0];
					var deltaX = (limit - lastX) * direction[0];

					if (deltaX > 0)
					{
						mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
								* deltaX;
					}
				}
				else
				{
					var lastY = mxEdgeStyle.wayPoints1[currentIndex][1];
					var deltaY = (limit - lastY) * direction[1];

					if (deltaY > 0)
					{
						mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
								* deltaY;
					}
				}
			}

			else if (center)
			{
				// Which center we're travelling to depend on the current direction
				mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
						* Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
				mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
						* Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
			}

			if (currentIndex > 0
					&& mxEdgeStyle.wayPoints1[currentIndex][currentOrientation] == mxEdgeStyle.wayPoints1[currentIndex - 1][currentOrientation])
			{
				currentIndex--;
			}
			else
			{
				lastOrientation = currentOrientation;
			}
		}

        //console.log(mxEdgeStyle.wayPoints1);
		for (var i = 0; i <= currentIndex; i++)
		{
			if (i == currentIndex)
			{
				// Last point can cause last segment to be in
				// same direction as jetty/approach. If so,
				// check the number of points is consistent
				// with the relative orientation of source and target
				// jx. Same orientation requires an even
				// number of turns (points), different requires
				// odd.
				var targetOrientation = (dir[1] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0
						: 1;
				var sameOrient = targetOrientation == initialOrientation ? 0 : 1;

				// (currentIndex + 1) % 2 is 0 for even number of points,
				// 1 for odd
				if (sameOrient != (currentIndex + 1) % 2)
				{
					// The last point isn't required
					break;
				}
			}
			
			result.push(new mxPoint(Math.round(mxEdgeStyle.wayPoints1[i][0] * state.view.scale * 10) / 10,
									Math.round(mxEdgeStyle.wayPoints1[i][1] * state.view.scale * 10) / 10));
		}
		
		//console.log("res",result);

		// Removes duplicates
		var index = 1;
		
		while (index < result.length)
		{
			if (result[index - 1] == null || result[index] == null ||
				result[index - 1].x != result[index].x ||
				result[index - 1].y != result[index].y)
			{
				index++;
			}
			else
			{
				result.splice(index, 1);
			}
		}
	}
	
	mxStyleRegistry.putValue('orthogonalConnectionStyle', mxEdgeStyle.WireConnector);

    var mxGraphCreateHandler = mxGraph.prototype.createHandler;
	mxGraph.prototype.createHandler = function(state)
	{
		var result = null;
		
		if (state != null)
		{
			if (this.model.isEdge(state.cell))
			{
				var style = this.view.getEdgeStyle(state);
				
				if (style == mxEdgeStyle.WireConnector)
				{
					return new mxEdgeSegmentHandler(state);
				}
			}
		}
		
		return mxGraphCreateHandler.apply(this, arguments);
	};
	
}

function edgeDirection(edge, startPoint, endPoint){
    var points = edge.absolutePoints;

    for(var i=0; i<points.length; i++){
        if (endPoint.x == points[i].x && endPoint.y == points[i].y){
            return null;
        }
    }
    
    for(var i=0; i<points.length-1; i++){
        var contactSegmentDirection = isBetweenPoints(edge.absolutePoints[i], edge.absolutePoints[i+1], endPoint);

        if( contactSegmentDirection == "horizontal"){
            if (startPoint.y >= endPoint.y){
                return mxConstants.DIRECTION_MASK_SOUTH;
            } else {
                return mxConstants.DIRECTION_MASK_NORTH;
            }
        }
        else if (contactSegmentDirection == "vertical"){
            if (startPoint.x <= endPoint.x){
                return mxConstants.DIRECTION_MASK_WEST;
            } else {
                return mxConstants.DIRECTION_MASK_EAST;
            }
        }
    }
}

function isBetweenPoints(a, b, point){
    var dir1 = new mxPoint(b.x-a.x, b.y-a.y);
    var dir2 = new mxPoint(point.x-a.x, point.y-a.y);

    if(dir1.y == 0 && dir2.y==0){
        if (Math.abs(dir1.x)>Math.abs(dir2.x)){
            return "horizontal"
        }
    } 
    else if(dir1.x==0 && dir2.x==0){
        if (Math.abs(dir1.y)>Math.abs(dir2.y)){
            return "vertical"
        }
    }
    return false;
}