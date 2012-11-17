
var canvas = $('#cancan');
var canvas_element = canvas.get(0);
var width = canvas.width();
var height = canvas.height();
var ctx = canvas_element.getContext("2d");

var shapes = [];
var max_point_displacement = 70;
var min_point_displacement = 40;


var generateShape = function(shapes,width,height){

	var all_points = [];

	var num_shapes = shapes.length;
	for(var i = 0;i<num_shapes;i++){
		all_points.concat(shapes[i].points);
	}

	var shape = {
		points : [],
		color : '#' + parseInt(Math.random()*255*255*255,10),
		addPoint : function(){
			if(all_points.length === 0 && this.points.length === 0){

				this.points.push({
					x : parseInt(Math.random() * width),
					y : parseInt(Math.random() * height)
				});
			}else{
				if(this.points.length==0){

					var old_point = all_points[parseInt(all_points.length * Math.random())];
					this.points.push({
						x : old_point.x,
						y : old_point.y
					});
				}else{

					var last_point = this.points[this.points.length-1];
					var displacement = min_point_displacement + (max_point_displacement - min_point_displacement) * Math.random();
					var angle = Math.PI * 2 * Math.random();
					this.points.push({
						x : last_point.x + displacement * Math.cos(angle),
						y : last_point.y + displacement * Math.sin(angle)
					})
				}
			}
		},
		plot : function(){
			shape.addPoint();
			shape.addPoint();
			shape.addPoint();
			shape.addPoint();
			shape.addPoint();
			console.log(this.points);
		}
	};


	shape.plot();


	return shape;
};




var render = function(){
	var num_shapes = shapes.length;
	ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
	for( var i = 0;i< num_shapes;i++){
		var shape = shapes[i];
		var num_points = shape.points.length;
		ctx.beginPath();

		for(var j = 0; j<num_points;j++){
			var p = shape.points[j];
			console.log(p.x,p.y)
			if(j === 0){
				ctx.moveTo(p.x,p.y);
			}else{
				ctx.lineTo(p.x,p.y);
			}
		}
		ctx.stroke();
		//ctx.fill();
	}	

};

shapes.push(generateShape(shapes,width,height));
render();

