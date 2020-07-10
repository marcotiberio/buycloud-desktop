/*
 loads images not detached fom velocity
*/

// directory where images of Clouds are
var assetDirectory = '../img/';

// all names of cloud image files
var assets = [
	'Cumulus-Mediocris.png',
	'cloud.png',
	'Altocumulus-Castellanus.png',
];

var buyClouds = {
	'targetElementId' : 'p5', // Container element id for p5 canvas (now: 'div#p5')
	'backgroundColor' : '#4467A7', // Background color
	'quantity' : 30, // The amount of Clouds to be drawn
	'radius' : 10, // Radius of Clouds
	'velocityScale' : 1, // Max. initial velocity (px/frame)
	'expectedVmax' : 2, 
	'safeareaFactor' : 1.4, // How far the clouds can drift off-screen, before returning to the oppposite side (recommended values between 1.4 and 2.0)
	'hitzoneDisplay' : false, // For debugging: dipslay ellipse geometry [true | false]

	'targetElement' : function(){ return document.getElementById(this.targetElementId) },
	'targetElementDimensions' : function(){ return [this.targetElement().clientWidth, this.targetElement().clientHeight] },
	'Clouds' : [], // Cloud objects
	'newClouds' : [], // temporary array, this is where new Clouds are born
	'images' : [], // This is where all the image() objects are stored
};

function setup() {
	createCanvas( buyClouds.targetElementDimensions()[0], buyClouds.targetElementDimensions()[1] ).parent(buyClouds.targetElementId);

	// Ready the images
	assets.map( asset => {
		var path = assetDirectory.concat(asset); // Get the paths
		var image = loadImage(path); // Load the image temporarily
		buyClouds.images.push( image ); // Push them to the images array
	});

	// Initialize the Clouds
	for( var i = 0; i < buyClouds.quantity; i++ ) {
		var location = createVector( random(0, width), random(0, height) );
		var velocity = createVector( random(-buyClouds.velocityScale, buyClouds.velocityScale), random(-buyClouds.velocityScale, buyClouds.velocityScale) );
		var radius = buyClouds.radius * random(0.97, 1.03);
		var image = buyClouds.images[i % buyClouds.images.length];

		buyClouds.Clouds.push( new Cloud( location, velocity, radius, image) );
		
	}
	
}

function draw() {
	background( buyClouds.backgroundColor);

	var i = 0;
	while ( i < buyClouds.Clouds.length ) {
		var wolkje_1 = buyClouds.Clouds[i];

		var j = i + 1;
		while ( j < buyClouds.Clouds.length ) {
			var wolkje_2 = buyClouds.Clouds[j];
			var deltaVector = createVector(wolkje_1.location.x - wolkje_2.location.x, wolkje_1.location.y - wolkje_2.location.y );	
			var distance = deltaVector.mag();

			function returnLargest(array) {
				var values = [ array[0].radius, array[1].radius ];
				var value = max(values);
				
				return array[ values.indexOf(value) ];
			}

			if ( distance < (wolkje_1.radius + wolkje_2.radius) && distance !== 0 ){
				var newLocation = createVector( (wolkje_1.location.x + wolkje_2.location.x)*0.5, (wolkje_1.location.y + wolkje_2.location.y)*0.5 );
				var newVelocity = createVector( (wolkje_1.velocity.x + wolkje_2.velocity.x)*1, (wolkje_1.velocity.y + wolkje_2.velocity.y)*1 );
				var newRadius = wolkje_1.radius + wolkje_2.radius;

				var largestCloud = returnLargest([ wolkje_1, wolkje_2]);	
				var newImage = largestCloud.imageObj; // Keeps 'first' image

				buyClouds.newClouds.push(new Cloud(newLocation, newVelocity, newRadius, newImage ));

				buyClouds.Clouds.splice(j, 1);
				buyClouds.Clouds.splice(i, 1);
			}

			j++;
		}
		
		i++;
	}

	buyClouds.newClouds.map( newCloud => {
		buyClouds.Clouds.push(newCloud);
	})
	buyClouds.newClouds = [];
	
	buyClouds.Clouds.map( cloud => {
		cloud.update();
		cloud.display();
	})
}

function windowResized() {
	resizeCanvas( buyClouds.targetElementDimensions()[0], buyClouds.targetElementDimensions()[1] );
}

/*
Make cloud appear on mouse click
function mousePressed() {
	var location = createVector(mouseX, mouseY);
	var velocity = createVector(random(-buyClouds.velocityScale, buyClouds.velocityScale), random(-buyClouds.velocityScale, buyClouds.velocityScale));
	var radius = buyClouds.radius * random(0.97, 1.03);
	var image = buyClouds.images[parseInt(Math.random()*buyClouds.images.length)];
	buyClouds.newClouds.push( new Cloud(location, velocity, radius, image) );
}
*/

class Cloud {
	constructor( location, velocity, radius, imageObj ) {
		this.location = location;
		this.velocity = velocity;
		this.radius = radius;
		this.imageObj = imageObj;

		this.update = function() {
			location.x += velocity.x;
			location.y += velocity.y;
			this.wrapEdges();
		}

		this.display = function() {
			var imgWidth = imageObj.width / 300 * radius;
			var imgHeight = imageObj.height / 300 * radius;

			// show the image
			image( imageObj, location.x - imgWidth/2, location.y - imgHeight/2, imgWidth, imgHeight);

			// show the ellipse 'hitzone' for debugging
			if ( buyClouds.hitzoneDisplay === true ) {
				fill(128);
				ellipse(location.x, location.y, radius, radius)
			};
		}

		this.wrapEdges = function() {
			var safearea = buyClouds.safeareaFactor * radius;
			if ( location.x <= 0 - safearea) {
				 location.x = width + safearea;
			}
			if ( location.x > width + safearea) {
				 location.x = 0 - safearea;
			}
			if ( location.y <= 0 - safearea) {
				 location.y = height + safearea;
			}
			if ( location.y > height + safearea) {
				 location.y = 0 - safearea;
			}
		}

		this.getLoc = function() {
			return location;
		}

		this.getVel = function() {
			return velocity;
		}
	}

}
