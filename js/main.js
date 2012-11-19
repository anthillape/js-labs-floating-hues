var canvas = $('#cancan');
var canvas_element = canvas.get(0);
var width = canvas_element.width = document.width;
var height = canvas_element.height = document.height;
var ctx = canvas_element.getContext("2d");
var num_dots = 100;
var dots = [];
var is_click_toggle = false;
var selected_dot = null;


var createDots = function(){
	for(var i = 0;i < num_dots;i++){
		var max_radius = 26;
		var radius = Math.random() * max_radius/3*2 + max_radius/3;
		var speed = (max_radius - radius) * 3;
		var color = '#'+Math.floor(Math.random()*16777215).toString(16);
		var x = Math.random() * width;
		var y = Math.random() * height;
		var hsl = hexToHsl(color);
		dots.push({
			x : x,
			y : y,
			rx : x,
			ry : y,
			radius : radius,
			expansion : 0,
			visual_size : radius,
			color : color,
			hue : hsl[0],
			sat : hsl[1],
			lum : hsl[2],

			vx : Math.random() * speed * 2 - speed,
			vy : Math.random() * speed * 2 - speed
		});

	}
};


var render = function(){
	var l = dots.length;
	ctx.clearRect(0,0,width,height);
	ctx.beginPath();
	ctx.rect(0,0,width,height);
	ctx.fillStyle = '#112233';

	ctx.fill();

	for(var i = 0; i< l;i++){
		var dot = dots[i];
		ctx.beginPath();
		dot.visual_size += ((dot.radius + dot.expansion) - dot.visual_size) / 10;

		ctx.arc(dot.rx,dot.ry,dot.visual_size,0,Math.PI*2,true);
		ctx.fillStyle = dot.color;
		ctx.fillOpacity = 0.6;
		ctx.fill();
	}
	
};

var move = function(){
	var l = dots.length;

	for(var i = 0; i< l;i++){
		var dot = dots[i];
		var mouse_dist = mouseDist(dot.x,dot.y);
		var catch_dist = 100;
		var angle;
		var hue_diff;
		var hue_diff_sq;
		var hue_force;
		var dx;
		var dy;
		var disp;
		var touch_dist;

		dot.expansion = 0;

		if(is_click_toggle){


			var dampen = false;
			hue_diff = colDiff(selected_dot,dot);
			hue_diff_sq = hue_diff * hue_diff;
			dx = selected_dot.x - dot.x;
			dy = selected_dot.y - dot.y;
			angle = Math.atan2(dx,dy);
			disp = distDisp(dx,dy);

			var grow = Math.max(0,50-disp/2);
			dot.expansion = grow;
			selected_dot.x = mouse.x;
			selected_dot.y = mouse.y;
			selected_dot.vx = selected_dot.vy = 0;

			// push close ones away, squared rel
			touch_dist = dot.radius + dot.expansion + selected_dot.radius + selected_dot.expansion + 10;
			
			var selected_effect_dist = disp;

			if(disp < touch_dist){
				if( disp > 0){
					var rep = 1 / (disp * disp) * 100000;
					dot.vx -= Math.sin(angle) * rep;
					dot.vy -= Math.cos(angle) * rep;
					dot.vx *= 0.6;
					dot.vy *= 0.6;
				}

			}else{
				hue_force = ((0.05-hue_diff_sq) * (disp*disp)) / 1000;
				// hue_force = ((0.05-hue_diff_sq) / (disp*disp)) * 100000;
				hue_force = Math.min(1,hue_force);
				dot.vx += Math.sin(angle) * hue_force;
				dot.vy += Math.cos(angle) * hue_force;
			}



			for(var j = 0; j< l;j++){

				/**
				*	should attract similar colours, more the further away they are
					all should push away anything close
				*/

				var dot_compare = dots[j];
				touch_dist = dot.radius + dot.expansion + dot_compare.radius + dot_compare.expansion + 10;

				
				hue_diff = colDiff(dot_compare,dot);

				var dx = dot_compare.x - dot.x;
				var dy = dot_compare.y - dot.y;
				angle = Math.atan2(dx,dy);
				if(dx === 0 && dy === 0) continue;
				var disp = distDisp(dx,dy);

				


				if(selected_effect_dist < 1000){


					if(disp < touch_dist){
						if( disp > 0){
							// push close ones away, squared rel
							var rep = 1 / (disp * disp) * 50000;
							dot.vx -= Math.sin(angle) * rep;
							dot.vy -= Math.cos(angle) * rep;
							
							dampen = true;
						}
					}else{
						// Attract similar colors / repel different, squared relationship
						hue_diff_sq = hue_diff * hue_diff;
						hue_force = ((0.5-hue_diff_sq) / (disp*disp)) * 1000;

						//dot.vx += Math.sin(angle) * hue_force;
						//dot.vy += Math.cos(angle) * hue_force;
					}

				}
				
			}


		}else{
			if(mouse_dist < catch_dist / 3){
				dot.vx *= 0.96;
				dot.vy *= 0.96;
				if(Math.abs(dot.vx) < 0.001) dot.vx = 0;
				if(Math.abs(dot.vy) < 0.001) dot.vy = 0;
			}else if(mouse_dist < catch_dist){
				angle = mouseAngle(dot.x,dot.y)
				dot.vx += Math.sin(angle) * mouse_dist/100;
				dot.vy += Math.cos(angle) * mouse_dist/100;
			}

			for(var j = 0; j< l;j++){

				/**
				*	should attract similar colours, more the further away they are
					all should push away anything close
				*/

				var dot_compare = dots[j];
				var dx = dot_compare.x - dot.x;
				var dy = dot_compare.y - dot.y;
				angle = Math.atan2(dx,dy);
				if(dx === 0 && dy === 0) continue;
				var disp = distDisp(dx,dy);
				touch_dist = dot.radius + dot.expansion + dot_compare.radius + dot_compare.expansion + 10;
				if(disp < touch_dist){

				
				if( disp > 0){
					
				
					// push close ones away, squared rel
					var rep = 1 / (disp * disp) * 50000;
					dot.vx -= Math.sin(angle) * rep;
					dot.vy -= Math.cos(angle) * rep;
					dot.vx *= 0.3;
					dot.vy *= 0.3;
					
				}
			}
			}
			
		}
		
		var max = 7;
		if(dot.vx > max) dot.vx = max;
		if(dot.vx < -max) dot.vx = -max;
		if(dot.vy > max) dot.vy = max;
		if(dot.vy < -max) dot.vy = -max;

		if(dampen){
			dot.vx *= 0.2;
			dot.vy *= 0.2;
		}else{
			dot.vx *= 0.99;
			dot.vy *= 0.99;
		}

		dot.x += dot.vx;
		dot.y += dot.vy;

		if(dot.x > width){
			dot.x = width;
			dot.vx = -dot.vx;
		}

		if(dot.x < 0){
			dot.x = 0;
			dot.vx = -dot.vx;
		}

		if(dot.y > height){
			dot.y = height;
			dot.vy = -dot.vy;
		}

		if(dot.y < 0){
			dot.y = 0;
			dot.vy = -dot.vy;
		}

		dot.rx += (dot.x - dot.rx) / 10;
		dot.ry += (dot.y - dot.ry) / 10;

	}
};

var mouseDist = function(x,y){
	return dist(mouse.x,mouse.y,x,y);
};

var mouseAngle = function(x,y){
	return Math.atan2(mouse.x - x,mouse.y - y);
};

var distDisp = function(dx,dy){
	return Math.sqrt(dx*dx+dy*dy);
};

var dist = function(x1,y1,x2,y2){
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
};

var colDiff = function(a,b){

	var h = Math.abs(a.hue-b.hue);
	if(h > 0.5) h = 1 - h;

	// var s = Math.abs(a.sat-b.sat);
	// if(s > 0.5) s = 1 - s;

	// var l = Math.abs(a.lum-b.lum);
	// if(l > 0.5) l = 1 - l;

	return h * 2;

 	// return (h + s + l) * (2/3);
};




var hexToHsl = function(color){
	var rgb = hexToRgb(color);
	return rgbToHsl(rgb.r,rgb.g,rgb.b);
};

var hexToRgb = function(color){
	var r = parseInt(color.substr(1,2), 16);
	var g = parseInt(color.substr(3,2), 16);
	var b = parseInt(color.substr(5,2), 16);
	return {r:r,g:g,b:b};
};

var rgbToHsl = function (r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
};

var mouse = { x: -1, y: -1 };
$(document).mousemove(function(event) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;
});

$('body').click(function(e){
	is_click_toggle = !is_click_toggle;
	if(is_click_toggle){
		selectClosest();
	}else{
		selected_dot = null;
	}
});

var selectClosest = function(){
	var l = dots.length;
	var current_dot = null;
	var low_dist = null;

	for(var i = 0; i< l;i++){
		var dot = dots[i];
		var mouse_dist = mouseDist(dot.x,dot.y);
		if( low_dist === null || mouse_dist < low_dist){
			current_dot = dot;
			low_dist = mouse_dist;
		}
	}

	selected_dot = current_dot;

};

var mouse_down = 0;
document.body.onmousedown = function() { 
  ++mouse_down;
}
document.body.onmouseup = function() {
  --mouse_down;
}

createDots();
render();

var run = function(){
	move();
	render();
}



setInterval(run,30);