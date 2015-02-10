////////////////////////////////////////////////////////////////////////////////
// Sharp specular
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, dat, $ */




var scene, renderer;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var teapotSize = 600;
var tess = -1;	// force initialization
var ambientLight, light;
var defaultCamPos;
var phongBalancedMaterial;
var container;
var editor;
var viewport;
var enableShader;
var rogress_circle;
var showCurvature;




function init() {
	//editro = new Editor();

	container = $('#teethContainer');

	// CAMERA
	var canvasWidth = container.width();
	var canvasHeight = container.height();
	console.log('width: ' + canvasWidth)
	console.log('height: ' + canvasHeight)
	var canvasRatio = canvasWidth / canvasHeight;
	var viewAngle = 30;
	var near = 0.1;
	var far = 20000;
	defaultCamPos = new THREE.Vector3(0, 0, 500)
	var camera = new THREE.PerspectiveCamera(viewAngle, canvasRatio, near, far);
	camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);

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
	//cameraControls.minPolarAngle = -1.0 * Math.PI;
	cameraControls.target.set(0, 0, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var extension = getFileAttributes(file_url).extension;
	if(extension == 'stl' || extension == 'dae')
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

		shininess: 1.0,
		dropoff: 0.0,
		ka: 0.76,
		kd: 1.0,
		ks: 1.0,
		metallic: false,

		curvature: false,
		hue: 0.11,
		saturation: 0.0,
		lightness: 0.6,

		lhue: 0.176,
		lsaturation: 0.21,
		llightness: 0.5,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.

		lx: 0.0,
		ly: 0.15,
		lz: 1.0,
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

	h.add(effectController, "curvature").name("Curvature");
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


	//test progress bar
	progress_circle = new ProgressBar.Circle('#progress', {
 		color: '#FCB03C',
 		strokeWidth: 3,
    	trailWidth: 1
     	//    text: {
     	//    	value: '0'
    	// }
    	// step: function(state, bar) {
     	//    	bar.setText((bar.value() * 100).toFixed(0));
    	// }
	});
}

//

function animate() {
	render();
	requestAnimationFrame(animate);
}

function render() {

	var delta = clock.getDelta();

	// cameraControls.update(delta);
	cameraControls.update();

	//This may cause problem of z fighting
	if (effectController.newTess !== tess ) {
		tess = effectController.newTess;
		fillScene();
	}

	updateCurvatureSettings();

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



	renderer.render(scene, cameraControls.object);

}

function updateCurvatureSettings(){
	if(effectController.curvature){

		// enable shader

		//enable material color

	}
	else{
		//disable material color

		//enable shader


	}

}

// Load STL file
function loadSTL(url){
	console.log('Start loading STL file');

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total);
	};
	var loader = new THREE.STLLoader(manager);

	//Load Event
	loader.addEventListener( 'load', function ( event ) {
		var sceneObject = new THREE.Object3D();
		sceneObject.name = "teethObj";
		var geometry = event.content;
		var mesh = new THREE.Mesh( geometry, phongBalancedMaterial );
		var centMesh = getCenteralizedMesh(mesh);
		sceneObject.add(centMesh.mesh);
		//set cmaera fov
		var camera = cameraControls.object;
		camera.fov = centMesh.fov;
		camera.updateProjectionMatrix();

		//add mesh to scene

		scene.add(sceneObject);
		showCurvature = false;
		console.log('load file successful');
		$('#progress').hide();
		$('#tpDRHeader').show();
		$('#teethContainer').show();

	}, false );
	//progress event
	loader.addEventListener( 'progress', function( event ){
		if ( $.isNumeric(event.loaded) && $.isNumeric(event.total) )
		{
			var complete = event.loaded / event.total;
			progress_circle.set(complete);
			var percentComplete = Math.round(complete * 100, 2);
			progress_circle.setText(percentComplete + '% downloaded')
			console.log( percentComplete + '% downloaded' );
		}
		else{
			console.log(event);
		}
	}, false);

	//error event
	loader.addEventListener('error', function(event){
		console.log("Load STL Error!!");
		console.log(event);
	}, false);



	loader.load(url);

}


// This is the loader which visualize curvature

function loadDAE(url){

	console.log('Start loading DAE1 file');
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total);
	};

	var onLoad = function(object){
		console.log('Call load function at DAE loader');
		daeSceneObj = object.scene;
		daeSceneObj.name = "teethObj";
		daeSceneObj.traverse( function(child) {
			if(child instanceof THREE.Mesh){
				console.log('find child as mesh');
				// // child is the mesh
				var centMesh = getCenteralizedMesh(child);
				//set cmaera fov
				var camera = cameraControls.object;
				camera.fov = centMesh.fov;
				camera.updateProjectionMatrix();
				centMesh.mesh.material = phongBalancedMaterial;
				centMesh.mesh.material.needsUpdate = true;
				centMesh.mesh.geometry.buffersNeedUpdate = true;
				centMesh.mesh.geometry.uvsNeedUpdate = true;
				centMesh.mesh.geometry.verticesNeedUpdate = true;
				centMesh.mesh.geometry.normalsNeedUpdate = true;
				centMesh.mesh.geometry.colorsNeedUpdate = true;
				showCurvature = true;
			}
		});
		//simple test
		//add scene
		scene.add(daeSceneObj);

		console.log('load file successful');

		$('#progress').hide();
		$('#tpDRHeader').show();
		$('#teethContainer').show();

	};

	var onProgress = function ( object ) {
		if ( $.isNumeric(object.loaded) && $.isNumeric(object.total) )
		{
			var complete = object.loaded / object.total;
			progress_circle.set(complete);
			var percentComplete = Math.round(complete * 100, 2);
			progress_circle.setText(percentComplete + '% downloaded')
			console.log( percentComplete + '% downloaded' );
		}
		else{
			console.log(object);
		}
	};

	var onError = function ( object ) {
		console.log("Error!");
		cosole.log(object);
	};

	//loading
	var loader = new THREE.ColladaLoader( manager );
	loader.load( url, onLoad, onProgress, onError);



}


function getCenteralizedMesh(mesh){
	//compute boundingbox
	var geometry = mesh.geometry;
	geometry.computeBoundingBox();
	var boundingBox = geometry.boundingBox.clone();
	var c_x = (boundingBox.min.x + boundingBox.max.x)/2.0;
	var c_y = (boundingBox.min.y + boundingBox.max.y)/2.0;
	var c_z = (boundingBox.min.z + boundingBox.max.z)/2.0;
	var height = boundingBox.max.y - boundingBox.min.y;
	var depth = boundingBox.max.z - boundingBox.min.z;
	// console.log('Before setting position');
 //    console.log('bounding box center: ' +
 //       		'(' + c_x + ', ' + c_y + ', ' + c_z + ')');

	//rotate
	mesh.rotation.y =  Math.PI;

	//set position
	mesh.position.x = -c_x;
	mesh.position.y = -c_y - height / 8.0;
	mesh.position.z = c_z/2.0;

	//scale mesh
	mesh.scale.x = 0.6;
	mesh.scale.y = 0.6;
	mesh.scale.z = 0.6;
	//set camera
	var camera = cameraControls.object;
	// defaultCamPos = new THREE.Vector3(mesh.position.x,
	// 									mesh.position.y, defaultCamPos.z)
	// camera.position.x = defaultCamPos.x
	// camera.position.y = defaultCamPos.y
	// camera.position.z = defaultCamPos.z
	var dist = Math.sqrt(Math.pow(camera.position.x, 2) +
						Math.pow(camera.position.y , 2)+
						Math.pow(camera.position.z - depth, 2));


	var fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );
	//var target = new THREE.Vector3(0, 0, -c_z/2.0);
	//cameraControls.target = target




	// add mesh into scene
	return{
		fov: fov,
		mesh: mesh
	};
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

	var mtl_url = url+'.mtl';
	console.log('mtl: ' + mtl_url)


	//debug
	console.log('Texture file: ' + textureFile);

	// model

	//var loader = new THREE.OBJMTLLoader( manager );
	//var loader = new THREE.OBJLoader( manager );
	var loader = new THREE.OBJMTLLoader( manager );

	//loading
	loader.load( url, mtl_url, function ( object ) {
			console.log('Call load function at obj loader');
			// object.traverse( function ( child )
			// {
			// 	if ( child instanceof THREE.Mesh ) {
			// 		//child.material.map = THREE.ImageUtils.loadTexture(textureFile);
			// 		//console.log('load texture successful');
			// 		//child.material.needsUpdate = true;

			// 		//compute boundingbox
			// 		var geometry = child.geometry;
			// 		geometry.computeBoundingBox();
			// 		var boundingBox = geometry.boundingBox.clone();
			// 		var c_x = (boundingBox.min.x + boundingBox.max.x)/2.0;
			// 		var c_y = (boundingBox.min.y + boundingBox.max.y)/2.0;
			// 		var c_z = (boundingBox.min.z + boundingBox.max.z)/2.0;
			// 		var height = boundingBox.max.y - boundingBox.min.y;
			// 		var depth = boundingBox.max.z - boundingBox.min.z;
   //  				console.log('bounding box center: ' +
   //      					'(' + c_x + ', ' + c_y + ', ' + c_z + ')');

			// 		//rotate
			// 		child.rotation.y =  Math.PI;
			// 		child.position.x = -c_x;
			// 		//mesh.position.y = - boundingBox.min.y + (c_y - boundingBox.min.y)/2.0;
			// 		child.position.y = -c_y - height / 8.0;
			// 		child.position.z = -c_z;

			// 		console.log('mesh x'+ child.position.y)
			// 		console.log('mesh y'+ child.position.z)
			// 		console.log('depth '+ depth);

			// 		child.scale.x = 0.6;
			// 		child.scale.y = 0.6;
			// 		child.scale.z = 0.6;

			// 		//effectController.lx = 0.0;
			// 		//effectController.ly = - boundingBox.min.y + c_y - boundingBox.min.y;
			// 		//effectController.lz = 1.0;
			// 		var dist = Math.sqrt(Math.pow(camera.position.x, 2) +
			// 							Math.pow(camera.position.y , 2)+
			// 							Math.pow(camera.position.z - depth, 2));

			// 		var fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );
			// 		camera.fov = fov;
			// 		//camera.position.y = - boundingBox.min.y + (c_y - boundingBox.min.y);
			// 		//camera.position.y = 300;
			// 		camera.updateProjectionMatrix();
			// 		scene.add(child);
			// 		console.log('load file successful');
			// 	}
			// } );

			//simple test
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
	var camera = cameraControls.object;
	scene.add(camera);
	//camera.lookAt(scene.position);
	scene.add(ambientLight);
	scene.add(light);

	//Floor

	// var helper = new THREE.GridHelper( 300, 10 );
	// helper.setColors( 0x000000, 0x808080 );
	// helper.position.y = - 0.5;
	// scene.add( helper );


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
	else if(extension == 'dae'){
		loadDAE(file_url);
	}

	else{
		console.log('cannot load file extension: ' + extension);
	}


}


function addToDOM() {
    container.append( renderer.domElement );
}

// Binary Stl converter, needs geometry
// Call as BinaryStlWriter.save(geometry,filename)

var BinaryStlWriter = (function() {
  var that = {};

  var writeVector = function(dataview, offset, vector, isLittleEndian) {
    offset = writeFloat(dataview, offset, vector.x, isLittleEndian);
    offset = writeFloat(dataview, offset, vector.y, isLittleEndian);
    return writeFloat(dataview, offset, vector.z, isLittleEndian);
  };

  var writeFloat = function(dataview, offset, float, isLittleEndian) {
    dataview.setFloat32(offset, float, isLittleEndian);
    return offset + 4;
  };

  var geometryToDataView = function(geometry) {
    var tris = geometry.faces;
    var verts = geometry.vertices;

    var isLittleEndian = true; // STL files assume little endian, see wikipedia page

    var bufferSize = 84 + (50 * tris.length);
    var buffer = new ArrayBuffer(bufferSize);
    var dv = new DataView(buffer);
    var offset = 0;

    offset += 80; // Header is empty

    dv.setUint32(offset, tris.length, isLittleEndian);
    offset += 4;

    for(var n = 0; n < tris.length; n++) {
      offset = writeVector(dv, offset, tris[n].normal, isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].a], isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].b], isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].c], isLittleEndian);
      offset += 2; // unused 'attribute byte count' is a Uint16
    }

    return dv;
  };

  var save = function(geometry, filename) {
    var dv = geometryToDataView(geometry);
    var blob = new Blob([dv], {type: 'application/octet-binary'});

    // FileSaver.js defines `saveAs` for saving files out of the browser
    saveAs(blob, filename);
  };

  that.save = save;
  return that;
}());


try {
  init();
  //fillScene();
  setupGui();
  addToDOM();
//  onWindowResize();
  animate();
} catch(e) {
  var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  $('#container').append(errorReport+e);
}


$(function(){

	//Not sure
	$('#tp3DStandardViewName0').click(function(){
		console.log("clicked tp3DStandardViewName0");

	});

	// top
	$('#tp3DStandardViewName1').click(function(){
		console.log("Rotate to top1");
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.target.set(0,0,0);
		// camera.target = new THREE.Vector3();
		//TODO: animation
		cameraControls.update();


	});


	//bottom
	$('#tp3DStandardViewName2').click(function(){
		console.log("Rotate to bottom");
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.rotateLeft(Math.PI);
		cameraControls.target.set(0,0,0);
		cameraControls.update();
	});


	//left
	$('#tp3DStandardViewName3').click(function(){
		console.log("Rotate to left");
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.rotateLeft(Math.PI/2.0);
		cameraControls.target.set(0,0,0);
		cameraControls.update();
	});


	//right
	$('#tp3DStandardViewName4').click(function(){
		console.log("Rotate to right");
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.rotateLeft(-1.0 * Math.PI/2.0);
		cameraControls.target.set(0,0,0);
		cameraControls.update();
	});


	//back
	$('#tp3DStandardViewName5').click(function(){
		console.log("Rotate to back")
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.rotateUp(-1.0 * Math.PI/2.0);
		cameraControls.target.set(0,0,0);
		cameraControls.update();
	});


	//front
	$('#tp3DStandardViewName6').click(function(){
		console.log("Rotate to front")
		var camera = cameraControls.object;
		camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
		cameraControls.rotateLeft(Math.PI);
		cameraControls.rotateUp(Math.PI/2.0);
		cameraControls.target.set(0,0,0);
		cameraControls.update();
	});

	//show curvature  showcurvaturelbtn
	$('#curvaturebtn').click(function(){
		console.log("curvature switch");
		//check if curvature can be rendered
		if (showCurvature == false)
			return;
		var className = $(this).children()[0].className;
		matched = className.match(/^on | on | on$|^off | off | off$/ );
		var switchOn = false;


		if (matched[0] == "on "){
			className = className.replace(/^on /, "off ");
			switchOn = false;
		}
		else if(matched[0] == " on "){
			className = className.replace(/ on /, " off ");
			switchOn = false;
		}
		else if(matched[0] == " on"){
			className = className.replace(/ on$/, " off");
			switchOn = false;
		}
		else if(matched[0] == "off "){
			className = className.replace(/^off /, " on");
			switchOn = true;
		}
		else if(matched[0] == " off "){
			className = className.replace(/ off /, " on ");
			switchOn = true;
		}
		else{
			className = className.replace(/ off$/, " on");
			switchOn = true;
		}
		var object = scene.getObjectByName( "teethObj" );
		//turn on vertex color
		if (switchOn){
			// show hue helper
			$("#tpHueHelp").show();
			object.traverse( function(child){
				if(child instanceof THREE.Mesh){
					console.log('find child as mesh');
					// // child is the mesh
					child.material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
					child.material.side = THREE.DoubleSide;
					//child.material.vertexColors = +THREE.VertexColors; //Ensure number
					child.material.needsUpdate = true;
					child.geometry.buffersNeedUpdate = true;
					child.geometry.uvsNeedUpdate = true;
					child.geometry.verticesNeedUpdate = true;
					child.geometry.normalsNeedUpdate = true;
					child.geometry.colorsNeedUpdate = true;
				}
			});
		}  //turn off vertex color
		else{
			// hide hue helper
			$("#tpHueHelp").hide();
			object.traverse( function(child) {
				if(child instanceof THREE.Mesh){
					console.log('find child as mesh');
					child.material = phongBalancedMaterial;
					//child.material.vertexColors = +THREE.FaceColors;
					//child.material.vertexColors = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
					child.material.needsUpdate = true;
					child.geometry.buffersNeedUpdate = true;
					child.geometry.uvsNeedUpdate = true;
					child.geometry.verticesNeedUpdate = true;
					child.geometry.normalsNeedUpdate = true;
					child.geometry.colorsNeedUpdate = true;
				}
			});
		}
		//change image
		console.log("class: " + className);
		$(this).children()[0].className = className;
	});
	// download stl click event listener
	$("#downloadstlbtn").click(function(){
		console.log("STL Downloader");
		var object = scene.getObjectByName( "teethObj" );
		object.traverse( function(child) {
			if(child instanceof THREE.Mesh){
				console.log('find child as mesh');
				var centMesh = getCenteralizedMesh(child);
				BinaryStlWriter.save(centMesh.mesh.geometry, 'export.stl');
			}
		});
	});
});
