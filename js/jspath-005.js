var jspath_util = {
	/**
	* Creates and returns all posible directions.
	*
	* @return {Array[Position]}	Returns an array with all the directions.
	*/
	create_directions: function(){
		var dirs = new Array();
		dirs.push( {row: 0, col: -1 } );
		dirs.push( {row: 0, col: 1 } );
		dirs.push( {row: -1, col: 0 } );
		dirs.push( {row: 1, col: 0 } );

		return dirs;
	}
}

var jspath = {

	// Used to hold nodes
	nodes:undefined,
	// Maximum number of steps
	timeout: 3000,
	// Variable with all possible directions
	directions: jspath_util.create_directions(),

	/**
	* Creates a node object.
	*
	* @param {Position} pos -> A position. Ex.  { row: 7, col: 5 }
	* @param {Position} goal -> A position. Ex.  { row: 0, col: 0 }
	* @param {Node} parent -> The parent node
	* @return {Node}	Returns the matrix.
	*/
	node: function(pos, goal, parent) {

		var object = {};
		object.pos = pos;
		object.active = true;
		object.goal = goal;
		object.distance = jspath.calculate_distance(pos, goal);

		if ( parent != undefined ){
			object.steps = parent.steps + pos.weight;
			object.parent = parent;
			object.weight = object.distance + object.steps;
		}

		return object;
	},

	/**
	* Creates and returns a 2 dimensional Array.
	*
	* @param {Integer} rows		The width of the new matrix.
	* @param {Integer} cols		The height of the new matrix.
	* @return {Array[Array]}	Returns the matrix.
	*/
	create_matrix: function(rows, cols){
		var matrix = new Array(rows);

		for( var row = 0; row < rows; row++) {
			matrix[row] = new Array(cols);
			for( var col = 0; col < cols; col++) {
				matrix[row][col] = 1;

			}
		}
		return matrix;
	},

	/**
	* Calculates and returns the position from a given object.
	*
	* @param {Position} position -> A position. Ex.  { row: 7, col: 5 }
	* @param {Position} goal -> A position. Ex.  { row: 0, col: 0 }
	* @return {Integer}	Calculated distance
	*/
	calculate_distance: function(position, goal){
		var rows = goal.row - position.row;
		if ( rows < 0 ) {
			rows = rows * -1;
		}
		var cols = goal.col - position.col;
		if ( cols < 0 ) {
			cols = cols * -1;
		}
		return rows + cols;
	},

	at_goal: function(start, goal){
		if ( start.row == goal.row && start.col == goal.col ){
			return true;
		}
	},


	find_path: function(matrix, start, goal){

		var path = new Array();
		jspath.nodes = new Array();

		var node = jspath.node(start, goal, undefined);
		node.steps = 0;

		jspath.traverse(matrix, node, goal, path);
		return path;

	},

	reverse_path: function(position, path){
		
		path.push(position.pos);
		if ( position.parent != undefined ){
			jspath.reverse_path(position.parent, path);
		}
	},

	node_exists: function(position){
		var found = false;

		// Check if we already have node in table
		$.each(jspath.nodes, function(){
			if ( this.pos.row == position.row && this.pos.col == position.col ){
				found = true;
				return false;
			}	
		});
		return found;
	},

	traverse: function(matrix, position, goal, path){

		if ( jspath.at_goal(position.pos, goal) ) {
			// If we find the goal we reverse the path
			jspath.reverse_path(position, path);
		} else {	

			// Remove myself from jspath.nodes
			jspath.remove_node(position);

			// Add Nodes for this position
			$.each(jspath.directions, function(){
				var row = position.pos.row + this.row;
				var col = position.pos.col + this.col;
				var pos = {row: row, col: col };

				if ( matrix[row] != undefined && matrix[row][col] > 0 && !jspath.node_exists(pos) ){
					pos.weight = matrix[row][col];
					var node = jspath.node(pos, goal, position);
					jspath.nodes.push(node);
				}
			});
		
			// Find the best node to work with 
			var next_node = jspath.lowest_weighted_node();

			if ( next_node != undefined ){
				if ( next_node.steps < jspath.timeout ){
					// Work it
					jspath.traverse(matrix, next_node, goal, path);
				}
			}
		}
	},

	lowest_weighted_node: function(){
		var node = undefined;
		var weight = 0;

		$.each(jspath.nodes, function(){
			if ( this.active == true ) {
				if ( node == undefined || this.weight < weight ){
					node = this;
					weight = this.weight;
				}
			}
		});
		return node;
	},

	remove_node: function(node){
		node.active = false;
	},	

}



