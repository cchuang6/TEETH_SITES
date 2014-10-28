////////////////////////////////////////////////////////////////////////////////
// Sharp specular
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, dat, $ */
var camera, scene, renderer;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var teapotSize = 600;
var tess = -1;	// force initialization
var ambientLight, light;
var teapot;
var phongBalancedMaterial;
var container;
var editor;
var viewport;
var enableShader;


function init() {
	//editro = new Editor();

	container = $('#teethContainer');

	// CAMERA
	var canvasWidth = container.width(); 
	var canvasHeight = container.height();
	var canvasRatio = canvasWidth / canvasHeight;
	var viewAngle = 45;
	var near = 0.1;
	var far = 20000;
	camera = new THREE.PerspectiveCamera(viewAngle, canvasRatio, near, far);
	camera.position.set(0, 150, 400);
	
	// LIGHTS
	ambientLight = new THREE.AmbientLight(0xffffff); // 0.2

	light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(0, 0, 0);

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(canvasWidth, canvasHeight);

	//renderer.setClearColorHex(0xFFFFFF, 0.8);
	renderer.setClearColor(0xFFFFFF, 1.0);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;


	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0, 0, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var extension = getFileAttributes(file_url).extension;
	if(extension == 'stl')
		enableShader = true;
	else
		enableShader = false;

	if(enableShader){
		var materialColor = new THREE.Color();
		materialColor.setRGB(1.0, 1.0, 1.0);
		phongBalancedMaterial = createShaderMaterial("phongBalanced", light, ambientLight);
		phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);
		phongBalancedMaterial.side = THREE.DoubleSide;
	}

}

function loadShader(shadertype) {
  return document.getElementById(shadertype).textContent;
}

function createShaderMaterial(id, light, ambientLight) {

	var shaderTypes = {

		'phongBalanced' : {

			uniforms: {

				"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
				"uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

				"uAmbientLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

				"uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },
				"uSpecularColor":  { type: "c", value: new THREE.Color( 0xffffff ) },

				uKd: {
					type: "f",
					value: 0.1
				},
				uKs: {
					type: "f",
					value: 1.0
				},
				shininess: {
					type: "f",
					value: 80.0
				},
				uDropoff: {
					type: "f",
					value: 0.5
				}
			}
		}

	};

	var shader = shaderTypes[id];

	var u = THREE.UniformsUtils.clone(shader.uniforms);

	// this line will load a shader that has an id of "vertex" from the .html file
	var vs = loadShader("vertex");
	// this line will load a shader that has an id of "fragment" from the .html file
	var fs = loadShader("fragment");

	var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;

	material.uniforms.uAmbientLightColor.value = ambientLight.color;

	return material;

}

function setupGui() {

	effectController = {

		shininess: 128.0,
		dropoff: 0.62,
		ka: 0.92,
		kd: 0.66,
		ks: 0.5,
		metallic: false,

		hue: 0.54,
		saturation: 0.0,
		lightness: 0.65,

		lhue: 0.176,
		lsaturation: 0.21,
		llightness: 0.5,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: -0.65,
		ly: 0.43,
		lz: 0.35,
		newTess: 10
	};

	var h;

	 
	var gui = new dat.GUI({autoPlace: false});
	$('#lightControl').append(gui.domElement);
	// material (attributes)

	h = gui.addFolder("Material control");

	h.add(effectController, "shininess", 1.0, 128.0, 32.0).name("shininess");
	h.add(effectController, "dropoff", 0.0, 2.0, 0.025).name("dropoff");
	h.add(effectController, "ka", 0.0, 1.0, 0.025).name("Ka");
	h.add(effectController, "kd", 0.0, 1.0, 0.025).name("Kd");
	h.add(effectController, "ks", 0.0, 1.0, 0.025).name("Ks");
	h.add(effectController, "metallic");
	h.add(effectController, "newTess", [2,3,4,5,6,8,10,12,16,24,32] ).name("Tessellation Level");

	// material (color)

	h = gui.addFolder("Material color");

	h.add(effectController, "hue", 0.0, 1.0, 0.025).name("m_hue");
	h.add(effectController, "saturation", 0.0, 1.0, 0.025).name("m_saturation");
	h.add(effectController, "lightness", 0.0, 1.0, 0.025).name("m_lightness");

	// light (point)

	h = gui.addFolder("Light color");

	h.add(effectController, "lhue", 0.0, 1.0, 0.025).name("hue");
	h.add(effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation");
	h.add(effectController, "llightness", 0.0, 1.0, 0.025).name("lightness");

	// light (directional)

	h = gui.addFolder("Light direction");

	h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x");
	h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y");
	h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z");

}

//

function animate() {

	requestAnimationFrame(animate);
	render();

}

function render() {

	var delta = clock.getDelta();

	// cameraControls.update(delta);
	cameraControls.update();

	if (effectController.newTess !== tess ) {
		tess = effectController.newTess;

		fillScene();
	}

	if(enableShader){
		phongBalancedMaterial.uniforms.shininess.value = effectController.shininess;
		phongBalancedMaterial.uniforms.uDropoff.value = effectController.dropoff;
		phongBalancedMaterial.uniforms.uKd.value = effectController.kd;
		phongBalancedMaterial.uniforms.uKs.value = effectController.ks;

		var materialColor = new THREE.Color();
		materialColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
		phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);

		if (!effectController.metallic) {
			materialColor.setRGB(1, 1, 1);
		}
		phongBalancedMaterial.uniforms.uSpecularColor.value.copy(materialColor);

		// Ambient is just material's color times ka, light color is not involved
		ambientLight.color.setHSL(effectController.hue, effectController.saturation, effectController.lightness * effectController.ka);
		light.position.set(effectController.lx, effectController.ly, effectController.lz);
		light.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);
	}
	else
		light.position.set(effectController.lx, effectController.ly, effectController.lz);

	

	renderer.render(scene, camera);

}


// Load STL file
function loadSTL(url){
	console.log('Start loading STL file');

	var loader = new THREE.STLLoader();		
	loader.addEventListener( 'load', function ( event ) {
					
					var geometry = event.content;
					
					var mesh = new THREE.Mesh( geometry, phongBalancedMaterial );
					// mesh.name = fileName;
					mesh.name = 'teeth1';
					console.log('mesh.name: ' + mesh.name);

					//compute boundingbox
					geometry.computeBoundingBox();
					var boundingBox = geometry.boundingBox.clone();
					var c_x = (boundingBox.min.x + boundingBox.max.x)/2.0;
					var c_y = (boundingBox.min.y + boundingBox.max.y)/2.0;
					var c_z = (boundingBox.min.z + boundingBox.max.z)/2.0;
    				console.log('bounding box center: ' + 
        					'(' + c_x + ', ' + c_y + ', ' + c_z + ')');
					
					//rotate 
					mesh.rotation.y =  Math.PI;					
					mesh.position.x = -c_x;
					mesh.position.y = - boundingBox.min.y + c_y - boundingBox.min.y;
					mesh.position.z = -c_z;
					mesh.scale.x = 1.5;
					mesh.scale.y = 1.5;
					mesh.scale.z = 1.5;
					
					scene.add(mesh);

					var hex  = 0xff0000;
					
					console.log('load file successful');

				}, false );
				
	loader.load(url);

}


//Load OBJ file
function loadOBJ(url){
	//TO DO:
	console.log('Start loading OBJ file');

	// texture
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	

	var fileAttributes = getFileAttributes(url);
	var filePath = fileAttributes.filePath;
	var fileName = fileAttributes.fileName;
	var pureFileName = fileName.substring(0, fileName.lastIndexOf('.'));	
	var textureFile = filePath + pureFileName + '_color.png';




	//debug
	console.log('Texture file: ' + textureFile);
	
	// model

	var loader = new THREE.OBJLoader( manager );

	//loading
	loader.load( url, function ( object ) {
			console.log('Call load function at obj loader');
			object.traverse( function ( child ) 
			{
				if ( child instanceof THREE.Mesh ) {
					child.material.map = THREE.ImageUtils.loadTexture(textureFile);
					console.log('load texture successful');	
					child.material.needsUpdate = true;

					var geometry = child.geometry;
					geometry.computeBoundingBox();
					var boundingBox = geometry.boundingBox.clone();
					var c_x = (boundingBox.min.x + boundingBox.max.x)/2.0;
					var c_y = (boundingBox.min.y + boundingBox.max.y)/2.0;
					var c_z = (boundingBox.min.z + boundingBox.max.z)/2.0;
    				console.log('bounding box center: ' + 
     		    		'(' + c_x + ', ' + c_y + ', ' + c_z + ')');
					
					//rotate 
					child.rotation.y =  Math.PI;					
					child.position.x = -c_x;
					child.position.y = - boundingBox.min.y + c_y - boundingBox.min.y;
					child.position.z = -c_z;
					child.scale.x = 1.5;
					child.scale.y = 1.5;
					child.scale.z = 1.5;					
					
				}
			} );
					
			scene.add(object);
			console.log('load file successful');			

	});

	console.log('load file successful2');
}


function getFileAttributes(url){
	
	//Debug info
	console.log('load url file');
	console.log(url);

	var extension_array = url.split('.');
		
	if(extension_array.length < 2){
		console.log("Error: No extension!");
		return null;
	}
	else{
		var extension = extension_array.pop().toLowerCase();
		//debug info
		var fileName = url.split('/').pop();
		var filePath = url.substring(0, url.lastIndexOf('/') + 1)
		//console.log('File name: ' + fileName);		
		//console.log('File extention: ' + extension);				
		return {
			extension: extension,
			fileName: fileName,
			filePath: filePath
		};
	}
	
	return null;
	

}

function fillScene() {
	
	
	//viewport = new viewport(editor).setId('viewport');
	scene = new THREE.Scene();

	//scene.fog = new THREE.Fog(0x808080, 2000, 4000);

	scene.add(camera);
	camera.lookAt(scene.position);
	scene.add(ambientLight);
	scene.add(light);

	//Floor
	
	var helper = new THREE.GridHelper( 300, 10 );
	helper.setColors( 0x000000, 0x808080 );
	helper.position.y = - 0.5;
	scene.add( helper );
	

	//Check file extension and select coorrect loader
	console.log('start get extension');
	var extension = getFileAttributes(file_url).extension;
	console.log('finish get extension');

	if (extension == 'stl'){
		
		loadSTL(file_url);

		//debug info
		//console.log(scene);
	}
	else if (extension == 'obj'){
		
		loadOBJ(file_url);
		//debug info
		//console.log(scene);
	}
	else{
		console.log('cannot load file extension: ' + extension);
	}


}


function addToDOM() {
    // var container = document.getElementById('container');
    // var canvas = container.getElementsByTagName('canvas');
    // if (canvas.length>0) {
    //     container.removeChild(canvas[0]);
    // }    
    //container.append( editor.dom );
    container.append( renderer.domElement );
    //window.addEventListener( 'resize', onWindowResize, false );

}

// var onWindowResize = function(event){
// 	editor.signals.onWindowResize.dispatch();
// }

try {
  init();
  fillScene();
  setupGui();
  addToDOM();
//  onWindowResize();
  animate();
} catch(e) {
  var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  $('#container').append(errorReport+e);
}