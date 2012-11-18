var canvas = $('#cancan');
var canvas_element = canvas.get(0);
var width = canvas.width();
var height = canvas.height();
var ctx = canvas_element.getContext("2d");
var num_dots = 100;
var dots = [];
var is_click_toggle = false;
var selected_dot = null;


var createDots = function(){
	for(var i = 0;i < num_dots;i++){
		var max_radius = 20;
		var radius = Math.random() * max_radius/3*2 + max_radius/3;
		var speed = (max_radius - radius) * 3;
		var color = '#'+Math.floor(Math.random()*16777215).toString(16);
		dots.push({
			x : Math.random() * width,
			y : Math.random() * height,
			radius : radius,
			color : color,
			hue : hexToHue(color),
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
		ctx.arc(dot.x,dot.y,dot.radius,0,Math.PI*2,true);
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

		if(is_click_toggle){
			hue_diff = hueDiff(selected_dot.hue,dot.hue);
			angle = Math.atan2(selected_dot.x - dot.x,selected_dot.y - dot.y);
			// dot.vx += Math.sin(angle) * (0.5 - hueDiff);
			// dot.vy += Math.cos(angle) * (0.5 - hueDiff);
			selected_dot.x = mouse.x;
			selected_dot.y = mouse.y;
			selected_dot.vx = selected_dot.vy = 0;
			for(var j = 0; j< l;j++){

				/**
				*	should attract similar colours, more the further away they are
					all should push away anything close
				*/

				var dot_compare = dots[j];

				
				hue_diff = hueDiff(dot_compare.hue,dot.hue);

				var dx = dot_compare.x - dot.x;
				var dy = dot_compare.y - dot.y;
				angle = Math.atan2(dx,dy);
				if(dx === 0 && dy === 0) continue;
				var disp = distDisp(dx,dy);

				// Attract similar colors / repel different, squared relationship

				var hue_diff_sq = hue_diff * hue_diff;
				var hue_force = (0.5 - hue_diff_sq) / 10;

				dot.vx += Math.sin(angle) * hue_force;
				dot.vy += Math.cos(angle) * hue_force;


				// push close ones away, squared rel
				var touch_dist = dot.radius + dot_compare.radius + 10;
				if(disp < touch_dist){
					var rep = 1 / (disp * disp) * 1000;
					dot.vx -= Math.sin(angle) * rep;
					dot.vy -= Math.cos(angle) * rep;
					dot.vx *= 0.99;
					dot.vy *= 0.99;
				}


				
			}


		}else if(mouse_down){
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
		}
		
		var max = 10;
		if(dot.vx > max) dot.vx = max;
		if(dot.vx < -max) dot.vx = -max;
		if(dot.vy > max) dot.vy = max;
		if(dot.vy < -max) dot.vy = -max;

		dot.x += dot.vx;
		dot.y += dot.vy;



		dot.vx *= 0.99;
		dot.vy *= 0.99;


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

var hueDiff = function(h1,h2){
	var d = Math.abs(h1,h2);
	if(d > 0.5) d = 1 - d;
 	return d * 2;
};

var hexToHue = function(color){
	var rgb = hexToRgb(color);
	return rgbToHsl(rgb.r,rgb.g,rgb.b)[0];
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