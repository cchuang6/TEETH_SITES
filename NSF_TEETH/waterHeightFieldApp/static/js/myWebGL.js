/**
 * @author Yusuke
 */

var nRenderedFrames = 0;

function LoadWebGL() {
	console.log('call loadwebgl');
	var RTTWidth = 128;
	var RTTHeight = 128;
	var sceneRTT = new THREE.Scene();

	var plane = new THREE.PlaneGeometry(1.0, 1.0);
	var planeMaterial = new THREE.ShaderMaterial({
		uniforms : {
			time : {
				type : "f",
				value : 0.0
			},
			uSampler : {
				type : "t",
				value : null
			},
			delta : {
				type : "v2",
				value : new THREE.Vector2(1 / RTTWidth, 1 / RTTHeight)
			}
		},
		vertexShader : document.getElementById('vertexShader').textContent,
		fragmentShader : document.getElementById('fragment_shader_water').textContent
	});

	var addDropMaterial = new THREE.ShaderMaterial({
		uniforms : {
			uSampler : {
				type : "t",
				value : null
			},
			delta : {
				type : "v2",
				value : new THREE.Vector2(1 / RTTWidth, 1 / RTTHeight)
			},
			center : {
				type : "v2",
				value : new THREE.Vector2(0.7, 0.7)
			},
			strength : {
				type : "f",
				value : 5.0
			}
		},
		vertexShader : document.getElementById('vertexShader').textContent,
		fragmentShader : document.getElementById('fragment_shader_addDrop').textContent
	});

	//add mirror
	quad = new THREE.Mesh(plane, planeMaterial);
	quad.position.x += 0.5;
	quad.position.y += 0.5;
	quad.position.z = -100;
	sceneRTT.add(quad);

	// Note the sign left, right, "top", "bottom". Not "bottom", "top"
	cameraRTT = new THREE.OrthographicCamera(-0.0, 1.0, 1.0, -0.0, -10000, 10000);
	cameraRTT.position.z = 100;

	// render to texture here..
	// var rtTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
	var rtTexture = new THREE.WebGLRenderTarget(RTTWidth, RTTHeight, {// first two arguments seems to determine the number of texels
		//minFilter : THREE.LinearFilter,
		//magFilter : THREE.NearestFilter,
		format : THREE.RGBAFormat,
		type : THREE.FloatType
	});

	var rtTexture2 = new THREE.WebGLRenderTarget(RTTWidth, RTTHeight, {// first two arguments seems to determine the number of texels
		//minFilter : THREE.LinearFilter,
		//magFilter : THREE.NearestFilter,
		format : THREE.RGBAFormat,
		type : THREE.FloatType
	});

	// render to texture up to here..

	var cameraAR = 16.0 / 9.0;
	var cameraNear = 0.1;

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(90, cameraAR, cameraNear, 1000);
	var renderer = new THREE.WebGLRenderer();
	//renderer.setSize(window.innerWidth, window.innerHeight); // corresponds to glViewport

	var path = "/static/texture/";
	var format = '.jpg';
	var urls = [path + 'px' + format, path + 'nx' + format, path + 'py' + format, path + 'ny' + format, path + 'pz' + format, path + 'nz' + format];

	var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
	reflectionCube.format = THREE.RGBFormat;

	// var refractionCube = new THREE.Texture(reflectionCube.image, new THREE.CubeRefractionMapping());
	// refractionCube.format = THREE.RGBFormat;

	var groundTexture = THREE.ImageUtils.loadTexture("/static/texture/wood.jpg");

	var borderTexture = THREE.ImageUtils.loadTexture("/static/texture/marble_black.jpg");
	borderTexture.anisotropy = 10;
	borderTexture.wrapS = borderTexture.wrapT = THREE.RepeatWrapping;
	borderTexture.repeat.set(10.0, 2.0);

	// one vertex corresponds to one pixel in RTT
	//THREE.CubeGeometry(1, 1, 1);
	// var material = new THREE.MeshBasicMaterial({
	// color : 0x00ff00
	// });
	// var material = new THREE.MeshBasicMaterial({
	// 	color : 0xffffff,
	// 	map : rtTexture
	// });

	var renderingMaterial = new THREE.ShaderMaterial({
		uniforms : {
			uSampler : {
				type : "t",
				value : null
			},
			cubeTexture : {
				type : "t",
				value : reflectionCube
			},
			groundSampler : {
				type : "t",
				value : groundTexture
			},
			borderSampler : {
				type : "t",
				value : borderTexture
			},
			delta : {
				type : "v2",
				value : new THREE.Vector2(1 / RTTWidth, 1 / RTTHeight)
			}
		},
		vertexShader : document.getElementById('vertexShader_rendering').textContent,
		fragmentShader : document.getElementById('fragment_shader_rendering').textContent
	});

	// var targetRectangle = new THREE.Mesh(geometry, material);

	var waterSurface = new THREE.Mesh(new THREE.PlaneGeometry(20, 5, RTTWidth, RTTHeight), renderingMaterial);

	waterSurface.name = "waterSurface";
	//waterSurface.position = 0.0;
	waterSurface.position.y = -3;
	waterSurface.position.z = -5;
	waterSurface.rotation.x += Math.PI * -0.5;
	scene.add(waterSurface);

	var borderGeometry = new THREE.CubeGeometry(20.0, 2.6, 0.5, 2, 2, 2);
	// var borderMaterial = new THREE.MeshBasicMaterial({
	// color : 0xffffff,
	// map : borderTexture,
	// //envMap : reflectionCube
	// });

	var borderMaterial = new THREE.ShaderMaterial({
		uniforms : {
			uSampler : {
				type : "t",
				value : null
			},
			cubeTexture : {
				type : "t",
				value : reflectionCube
			},
			borderSampler : {
				type : "t",
				value : borderTexture
			},
			delta : {
				type : "v2",
				value : new THREE.Vector2(1 / RTTWidth, 1 / RTTHeight)
			}
		},
		vertexShader : document.getElementById('vertexShader').textContent,
		fragmentShader : document.getElementById('fragment_shader_border').textContent
	});

	var borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);

	borderMesh.position.y = -3.8;
	borderMesh.position.z = -7.75;
	scene.add(borderMesh);

	var borderLeftMesh = new THREE.Mesh(borderGeometry, borderMaterial);
	borderLeftMesh.rotation.y = Math.PI * -0.5;
	borderLeftMesh.position.x = -10.25;
	borderLeftMesh.position.y = -3.8;
	borderLeftMesh.position.z = 2.0;
	scene.add(borderLeftMesh);

	borderRightMesh = new THREE.Mesh(borderGeometry, borderMaterial);
	borderRightMesh.rotation.y = Math.PI * -0.5;
	borderRightMesh.position.x = 10.25;
	borderRightMesh.position.y = -3.8;
	borderRightMesh.position.z = 2.0;
	scene.add(borderRightMesh);

	// var borderTopTexture = THREE.ImageUtils.loadTexture("texture/marble.jpg");
	// borderTopTexture.anisotropy = 10;
	// borderTopTexture.wrapS = borderTexture.wrapT = THREE.RepeatWrapping;
	// borderTopTexture.repeat.set(10.0, 20.0);
	//
	// var borderTopGeometry = new THREE.CylinderGeometry(0.25, 0.25, 20.0, 72, 2, false);
	// var borderTopMaterial = new THREE.MeshBasicMaterial({
	// color : 0xffffff,
	// map : borderTopTexture,
	// //envMap : reflectionCube
	// });
	//
	// //	var borderTopMaterial =  new THREE.MeshPhongMaterial( { map : borderTexture, ambient: 0x050505, color: 0xffffff, specular: 0x555555, shininess: 300 } );
	//
	// var borderTopMesh = new THREE.Mesh(borderTopGeometry, borderTopMaterial);
	// borderTopMesh.rotation.z = Math.PI * -0.5;
	// borderTopMesh.position.y = -2.0;
	// borderTopMesh.position.z = -8.0;
	//
	// scene.add(borderTopMesh);

	var backgroundTexture = THREE.ImageUtils.loadTexture("/static/texture/background.jpg");
	var backgroundMaterial = new THREE.MeshBasicMaterial({
		color : 0xffffff,
		map : backgroundTexture
	});

	var backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(330, 110), backgroundMaterial);

	backgroundMesh.position.x = 2.0;
	backgroundMesh.position.y = 25.0;
	backgroundMesh.position.z = -50.0;
	scene.add(backgroundMesh);

	// debug mouse picking
	// marker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({
	// color : 0xff0000
	// }));
	// scene.add(marker);

	document.addEventListener('click', onDocumentMouseClick, false);
	document.body.appendChild(renderer.domElement);

	// var stats = new Stats();
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.top = '0px';
	// stats.domElement.style.zIndex = 100;
	// document.body.appendChild(stats.domElement);

	// var element = document.getElementsByTagName("canvas");
	// var rect = element.getBoundingClientRect();
	// console.log(rect.top, rect.right, rect.bottom, rect.left);

	var canvas = document.getElementsByTagName('canvas');
	var width = canvas.width;
	var height = canvas.height;
	//console.log(width, height);

	var path = 0;

	var raycaster = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var directionVector = new THREE.Vector3();

	function onDocumentMouseClick(event) {

		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		// mouse picking from http://jensarps.de/2013/10/29/mouse-picking-collada-models-with-three-js-part-ii/
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		var curCanvasWidth = parseInt($("canvas").css("width"));
		var curCanvasHeight = parseInt($("canvas").css("height"));

		var mouseNormalizedXCoord = (event.clientX / curCanvasWidth) * 2 - 1;
		var mouseNormalizedYCoord = ((curCanvasHeight - event.clientY) / curCanvasHeight) * 2 - 1;

		directionVector.set(mouseNormalizedXCoord, mouseNormalizedYCoord, 1);

		projector.unprojectVector(directionVector, camera);
		directionVector.sub(camera.position);
		directionVector.normalize();

		raycaster.set(camera.position, directionVector);

		var intersects = raycaster.intersectObjects(scene.children, false);

		if (intersects.length && intersects[0].object.name == "waterSurface") {
			var u = (intersects[0].point.x + 10.0) / 20.0;
			var v = 1.0 - (intersects[0].point.z + 7.5) / 5.0;

			// console.log("uv " + addDropMaterial.uniforms.center.value.x + " " + addDropMaterial.uniforms.center.value.y);
			AddDrop(u, v);
		}
	}

	function AddDrop(u, v) {
		addDropMaterial.uniforms.center.value.x = u;
		addDropMaterial.uniforms.center.value.y = v;

		quad.material = addDropMaterial;

		// addDropMaterial.uniforms.strength.value = 1.0*( Math.random() < 0.5 ? -1.0 : 1.0 );
		addDropMaterial.uniforms.strength.value = 0.7 * Math.random();

		if (path == 0) {
			addDropMaterial.uniforms.uSampler.value = rtTexture;
			renderer.render(sceneRTT, cameraRTT, rtTexture2, true);
			path = 1;
		} else {
			addDropMaterial.uniforms.uSampler.value = rtTexture2;
			renderer.render(sceneRTT, cameraRTT, rtTexture, true);
			path = 0;
		}
	}

	// for (var i = 0; i < 5; i++) {
	// 	AddDrop(Math.random(), Math.random());
	// }

	var render = function(isInit) {
		requestAnimationFrame(render);

		quad.material = planeMaterial;
		
		planeMaterial.uniforms.uSampler.value = rtTexture;
		renderer.render(sceneRTT, cameraRTT, rtTexture2, false);

		// renderingMaterial.uniforms.uSampler.value = rtTexture2;
		// borderMaterial.uniforms.uSampler.value = rtTexture2;

		// ping-pong here.
		// for (var i = 0; i < 1; i++) {
		// 	if (path == 0) {
		// 		planeMaterial.uniforms.uSampler.value = rtTexture;
		// 		renderer.render(sceneRTT, cameraRTT, rtTexture2, false);

		// 		renderingMaterial.uniforms.uSampler.value = rtTexture2;
		// 		borderMaterial.uniforms.uSampler.value = rtTexture2;
		// 		path = 1;
		// 	} else {
		// 		planeMaterial.uniforms.uSampler.value = rtTexture2;
		// 		renderer.render(sceneRTT, cameraRTT, rtTexture, false);

		// 		renderingMaterial.uniforms.uSampler.value = rtTexture;
		// 		borderMaterial.uniforms.uSampler.value = rtTexture;
		// 		path = 0;
		// 	}
		// }

		// var curCanvasWidth = $("canvas").css("width");
		// var curCanvasHeight = $("canvas").css("height");
		//console.log(curCanvasWidth + " " + curCanvasHeight);

		// window.outerHeight to get the application window size
		// window.innerHeight to get viewport size.
		// screen object refers to the actual monitor window or desktop size

		var canvasHeightForced = Math.max(window.innerHeight, screen.height * 0.666666) - 20;
		var canvasWidthForced = window.innerWidth - 20;

		$("canvas").css("height", String(canvasHeightForced));
		$("canvas").css("width", String(canvasWidthForced));

		// var FOVforced = (2.0 * Math.atan((0.5 * canvasHeightForced / canvasWidthForced) / (2.0 * cameraNear)) / Math.PI * 180.0);
		// camera.fov    = FOVforced;
		camera.aspect = canvasWidthForced / canvasHeightForced;
		camera.updateProjectionMatrix();

		renderer.setSize(canvasWidthForced, canvasHeightForced);

		renderer.render(scene, camera);

		// if (nRenderedFrames % 10000000 == 0 && Math.random() < 0.3) {
		// 	AddDrop(Math.random(), Math.random());
		// }

		nRenderedFrames++;
		//stats.update();
	};

	render();

}

