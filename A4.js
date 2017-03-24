/***
 * Created by Glen Berseth March 22, 2017
 * Created for Assignment 4 of CPSC426.
 */

// Build a visual axis system
function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

}
var currentShip=0;
var length = 100.0;
// Build axis visuliaztion for debugging.
x_axis = buildAxis(
	    new THREE.Vector3( 0, 0, 0 ),
	    new THREE.Vector3( length, 0, 0 ),
	    0xFF0000,
	    false
	)
y_axis = buildAxis(
	    new THREE.Vector3( 0, 0, 0 ),
	    new THREE.Vector3( 0, length, 0 ),
	    0x00ff00,
	    false
	)
z_axis = buildAxis(
	    new THREE.Vector3( 0, 0, 0 ),
	    new THREE.Vector3( 0, 0, length ),
	    0x0000FF,
	    false
	)
	
// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}
//ASSIGNMENT-SPECIFIC API EXTENSION
// For use with matrix stack
THREE.Object3D.prototype.setMatrixFromStack = function() {
  this.matrix=mvMatrix;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}

// Data to for the camera view
var mouseX = 0, mouseY = 0;
var windowWidth, windowHeight;
var backgroundColour = 0.2;
var views = [
	{
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 1.0,
		background: new THREE.Color().setRGB( backgroundColour, backgroundColour, backgroundColour ),
		eye: [ 80, 20, 80 ],
		up: [ 0, 1, 0 ],
		fov: 45,
		updateCamera: function ( camera, scene, mouseX, mouseY ) {
		  // camera.position.x += mouseX * 0.05;
		  // camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
		}
	}
];


var STATE = {
		  World_Control : {value: 1, name: "World_Control"}, 
		  Relative_Control: {value: 2, name: "Relative_Control"}, 
		  GeoSync_Control : {value: 3, name: "GeoSync_Control"}
		};

//SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
// renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement);

// Creating the camera and adding them to the scene.
var view = views[0];
camera_MotherShip = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
camera_MotherShip.position.x = view.eye[ 0 ];
camera_MotherShip.position.y = view.eye[ 1 ];
camera_MotherShip.position.z = view.eye[ 2 ];
camera_MotherShip.up.x = view.up[ 0 ];
camera_MotherShip.up.y = view.up[ 1 ];
camera_MotherShip.up.z = view.up[ 2 ];
camera_MotherShip.lookAt( scene.position );
camera_MotherShip.lookAtPoint = scene.position.clone(); 
view.camera = camera_MotherShip;
scene.add(view.camera);


// Adding the axis debug visualizations
scene.add(x_axis);
scene.add(y_axis);
scene.add(z_axis);


// ADAPT TO WINDOW RESIZE
function resize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
  renderer.setSize(window.innerWidth,window.innerHeight);
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () 
{
     window.scrollTo(0,0);
}

// var ambientLight = new THREE.AmbientLight( 0x000000 );
var ambientLight = new THREE.AmbientLight( 0x555555 );
scene.add( ambientLight );


var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );

// SETUP HELPER GRID
// Note: Press Z to show/hide
var gridGeometry = new THREE.Geometry();
var i;
for(i=-50;i<51;i+=2) {
    gridGeometry.vertices.push( new THREE.Vector3(i,0,-50));
    gridGeometry.vertices.push( new THREE.Vector3(i,0,50));
    gridGeometry.vertices.push( new THREE.Vector3(-50,0,i));
    gridGeometry.vertices.push( new THREE.Vector3(50,0,i));
}

var gridMaterial = new THREE.LineBasicMaterial({color:0xBBBBBB});
var grid = new THREE.Line(gridGeometry,gridMaterial,THREE.LinePieces);

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

function resetCameras()
{
	var view = views[0];
	camera_MotherShip.position.x = view.eye[ 0 ];
	camera_MotherShip.position.y = view.eye[ 1 ];
	camera_MotherShip.position.z = view.eye[ 2 ];
	camera_MotherShip.up.x = view.up[ 0 ];
	camera_MotherShip.up.y = view.up[ 1 ];
	camera_MotherShip.up.z = view.up[ 2 ];
	camera_MotherShip.lookAt( scene.position );
	scene.add(view.camera);
	camera_MotherShip.updateProjectionMatrix();

}

var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {

	console.log( item, loaded, total );

};

var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};

var onError = function ( xhr ) 
{
};

var motherShip;

// TO-DO: INITIALIZE THE REST OF YOUR MATRICES 
// Note: Use of parent attribute IS allowed.
// Hint: Keep hierarchies in mind!   



// Create pivot point for obstacles
var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
generateVertexColors( geometry );
var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
var sun = new THREE.Mesh( geometry, material );
scene.add( sun );


var planets = [];
var obstacles = [];
var planet_info = [
{
	name: 'Mercury',
	color: 0x00aa44,
	size: 0.5
},
{
	name: 'Venus',
	color: 0xaaaa44,
	size: 0.8
},
{
	name: 'Earth',
	color: 0x0044aa,
	size: 1.2
},
{
	name: 'Mars',
	color: 0xdd4444,
	size: 0.81
},
{
	name: 'Jupiter',
	color: 0xddaa00,
	size: 2.2
},
{
	name: 'Saturn',
	color: 0xffaa44,
	size: 1.8
},
{
	name: 'Uranus',
	color: 0x7777dd,
	size: 1.0
},
{
	name: 'Neptune',
	color: 0x0000cc,
	size: 0.8
}
 ];

var dist_ = 7.0;
var dist_adjust=10.0;
for (p=0; p < planet_info.length; p++)
{
	var planet_i = planet_info[p];
	var dist_tmp = (dist_ * p) + dist_adjust;
	var geometry = new THREE.SphereGeometry( planet_i.size, 32, 32 );
	// generateVertexColors( geometry );
	var material = new THREE.MeshLambertMaterial( {color: planet_i.color} );
	var mercury = new THREE.Mesh( geometry, material );
	planets.push(mercury);
	obstacles.push(new THREE.Vector3(0,0,0));

	sun.add( mercury );
}


var clock = new THREE.Clock(true);

var animate = true; // animate?
var orbit_distance= 4.0;

var sim_time = 0.0;

function updateSystem() 
{
	// Animate your solar system here.
	if (!animate)
	{
		return;
	}
  var num_planents = planets.length;
  var time = clock.getElapsedTime(); // t seconds passed since the clock started.
  sim_time = sim_time+0.02;
  var dist_scale=dist_;
  var rot_scale=0.8;
  for (p=0; p < num_planents; p++)
  {
	  var roation = (sim_time/(p+1.0)) % (Math.PI*2.0);
	  var rotationM = new THREE.Matrix4().makeRotationY(roation );
	  var transM = new THREE.Matrix4().makeTranslation( dist_adjust + (p*dist_scale), 0, 0);
	  var posV = new THREE.Vector3(0,0,0);
	  var finalM = new THREE.Matrix4().multiplyMatrices(rotationM, transM);
	  posV.applyMatrix4(finalM);
	  planets[p].setMatrix(finalM);
	  obstacles[p] = posV;
  }
  flock.run();
  
}

// LISTEN TO KEYBOARD
// Hint: Pay careful attention to how the keys already specified work!
var keyboard = new THREEx.KeyboardState();
var grid_state = false;
var key;
var camera;
var old_ModelView;
var CONTROL_STATE = STATE.World_Control;
var step_size = 1.0;
var mouseMove__=0;
var startDrag_=0;


function onMouseDrag(event)
{
	if ( startDrag_ == 1 && (CONTROL_STATE.value == STATE.GeoSync_Control.value))
	{
		var delta = event.pageY - mouseY;
		geoSynchronousOrbitAdjust(camera, step_size*delta);
		mouseY = event.pageY;
	}
	else if ( startDrag_ == 1 )
	{
		var deltaY = event.pageY - mouseY;
		var deltaX = event.pageX - mouseX;
		var mI = camera.matrixWorld;
		var scaling = 0.001;
		// Pitch
		  var rotationX = new THREE.Matrix4().makeRotationX(-step_size*deltaY*scaling);
		  mI.multiplyMatrices(mI, rotationX);
	      // Yaw
		  var rotationY = new THREE.Matrix4().makeRotationY(-step_size*deltaX*scaling);
		  mI.multiplyMatrices(mI, rotationY);
		  camera.setMatrix(mI);
		  mouseX = event.pageX;
		  mouseY = event.pageY;
	  
	}
}


function onMouseUp( event ) {

	if ( event.button === THREE.MOUSE.LEFT && ((CONTROL_STATE.value == STATE.Relative_Control.value) ||
			(CONTROL_STATE.value == STATE.GeoSync_Control.value)) )
	{
		startDrag_=0;
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mousemove', onMouseDrag, false );
	}
}


function onMouseDown(event)
{

	if ( event.button === THREE.MOUSE.LEFT && ((CONTROL_STATE.value == STATE.Relative_Control.value) ||
			(CONTROL_STATE.value == STATE.GeoSync_Control.value)) )
	{
		startDrag_=1;
		mouseX = event.pageX;
		mouseY = event.pageY;
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', onMouseDrag);
	}

}

document.addEventListener( 'mousedown', onMouseDown, false );

function onMouseMove(event)
{
	if ( (mouseMove__ == 1) )
	{ // only way to get initial mouse position.
		mouseX = event.pageX;
		mouseY = event.pageY;
		mouseMove__ = 2;
		return;
	}
	else if ( mouseMove__ == 2 )
	{
		var delta = event.pageY - mouseY;
		  var mI = camera.matrixWorld;
		  var rotationM = new THREE.Matrix4().makeTranslation(0,0,step_size*delta);
		  mI.multiplyMatrices(mI, rotationM);
		  camera.setMatrix(mI);
		  mouseY = event.pageY;
	}
}

function onKeyUp(event)
{
  if ( keyboard.eventMatches(event,'t') )
  {    
     mouseMove__=0;
     keyboard.domElement.removeEventListener( 'keyup', onKeyUp, false );
     keyboard.domElement.removeEventListener( 'mousemove', onMouseMove, false );
  }

}
		
function onKeyDown(event)
{
	// TO-DO: BIND KEYS TO YOUR CONTROLS	  
  if(keyboard.eventMatches(event,"shift+g"))
  {  // Reveal/Hide helper grid
    grid_state = !grid_state;
    grid_state? scene.add(grid) : scene.remove(grid);
  }   
  else if(keyboard.eventMatches(event,"space"))
  {    
    animate = !animate;
  }
  else if(keyboard.eventMatches(event,"t") && (!event.repeat) && 
		  (CONTROL_STATE.value == STATE.Relative_Control.value) )
  {    
    mouseMove__=1;
    keyboard.domElement.addEventListener('keyup', onKeyUp);
    keyboard.domElement.addEventListener('mousemove', onMouseMove);
  }
  
}
keyboard.domElement.addEventListener('keydown', onKeyDown );
		

// SETUP UPDATE CALL-BACK
// Hint: It is useful to understand what is being updated here, the effect, and why.
function update() {
  updateSystem();
  requestAnimationFrame(update);
  
  // UPDATES THE MULTIPLE CAMERAS IN THE SIMULATION
  for ( var ii = 0; ii < views.length; ++ii ) 
  {

		view = views[ii];
		camera_ = view.camera;

		view.updateCamera( camera_, scene, mouseX, mouseY );

		var left   = Math.floor( windowWidth  * view.left );
		var bottom = Math.floor( windowHeight * view.bottom );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );
		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.enableScissorTest ( true );
		renderer.setClearColor( view.background );

		camera_.aspect = width / height;
		camera_.updateProjectionMatrix();

		renderer.render( scene, camera_ );
	}
}

var flock;

function setup() {

  flock = new Flock();
  // Add an initial set of boids into the system
  var width = 25;
  var height = 25;
  var depth = 25;
  for (var i = 0; i < 150; i++) 
  {
	  var _boid = new Boid(width, height, depth);
	  flock.addBoid(_boid);
  }
}
setup();

function draw() {
  background(50);
  flock.run();
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function Boid(x,y, z) {
	/// Assume box around these numbers
	this.maxX = x;
	this.maxY = y;
	this.maxZ = z;
  this.acceleration = new THREE.Vector3( 0, 0, 0);
  x = x * ((1-(-1)) * Math.random());
  y = y * ((1-(-1)) * Math.random());
  z = z * ((1-(-1)) * Math.random());
  console.log("Random Position: (" + x + ", " + y + ", " + z + ")")
  
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.position = new THREE.Vector3(x, y, z);
  this.r = 2.0;
  /// Maximum speed
  this.maxspeed = 0.4; 
  /// Maximum steering force
  this.maxforce = 0.03; 
  /// Create Geometry
  var geometry = new THREE.ConeGeometry( 0.6, 2, 8 );
  var material = new THREE.MeshPhongMaterial( {
		color: 0x156289,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		shading: THREE.FlatShading
	} );
  var geom = new THREE.Mesh( geometry, material );
  
  this.geom = geom;
  scene.add( this.geom );

  this.run = function(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }


  /// Accumulate a new acceleration each time based on rules
  this.flock = function(boids) 
  {
    
  }

  /// Update new location by integrating the velocity
  this.update = function() 
  {

  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED - VELOCITY
  this.seek = function(target) 
  {

  }

  /// Render the location of the boid agent
  this.render = function() 
  {

  }

  /// If an agent leaves the area wrap it arround back into the other side of the box
  this.borders = function() {
    if (this.position.x < (-this.r + - this.maxX))  this.position.x = this.maxX + this.r;
    if (this.position.y < (-this.r + - this.maxY))  this.position.y = this.maxY + this.r;
    if (this.position.z < (-this.r + - this.maxZ))  this.position.z = this.maxZ + this.r;
    if (this.position.x > this.maxX + this.r) this.position.x = (-this.r + - this.maxX);
    if (this.position.y > this.maxY + this.r) this.position.y = (-this.r + - this.maxY);
    if (this.position.z > this.maxZ + this.r) this.position.z = (-this.r + - this.maxZ);
  }

  // Separation
  // Method checks for nearby boids and steers away
  this.separate = function(boids) 
  {
   
  }
  
  //Separation for Obstacles
  // Method checks for nearby obstacles and steers strongly away
  this.separateObs = function(obs) 
  {
	  
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  this.align = function(boids) {

  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  this.cohesion = function(boids) {

  }
}





// The Flock (a list of Boid agents)

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array

  this.run = function() {
    for (var i = 0; i < this.boids.length; i++) {
      this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
    }
  }

  this.addBoid = function(b) {
    this.boids.push(b);
  }
}


update();