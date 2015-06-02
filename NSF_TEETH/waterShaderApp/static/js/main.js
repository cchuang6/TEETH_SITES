
var container;
var defaultCamPos;
var render;
var scene
var cameraControls;
var directionalLight;
var waterObj;
var waterAnimation;

function log(){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("<main.js>");
    console.log.apply(console, args);
}

function loadSky(){
    var cubeMap = THREE.ImageUtils.loadTextureCube([
        "/static/img/px.jpg",
        "/static/img/nx.jpg",
        "/static/img/py.jpg",
        "/static/img/ny.jpg",
        "/static/img/pz.jpg",
        "/static/img/nz.jpg",
    ]);

    cubeMap.format = THREE.RGBFormat;
    
    // This is for water-material-height-field
    //var cubeMap = reflectionCube;

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

        var skyBoxMaterial = new THREE.ShaderMaterial({
          fragmentShader: cubeShader.fragmentShader,
          vertexShader: cubeShader.vertexShader,
          uniforms: cubeShader.uniforms,
          depthWrite: false,
          side: THREE.BackSide
        });

        var skybox = new THREE.Mesh(
          new THREE.BoxGeometry(100000, 100000, 100000),
          skyBoxMaterial
        );
        
        scene.add(skybox);
}

function init() {
    //initialize canvas
    waterAnimation = true;
    container = $('#waterContainer');
    var canvasWidth = container.width();
    var canvasHeight = container.height();

    // Initialize Renderer, Camera, Projector and Scene

    //scene
    scene = new THREE.Scene();
    
    // RENDERER
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer( {antialias:true} );
    else{
        Detector.addGetWebGLMessage();
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(canvasWidth, canvasHeight);
    //renderer.setClearColorHex(0xFFFFFF, 0.8);
    renderer.setClearColor(0x000000, 1.0);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    container.append( renderer.domElement );


    // CAMERA
    var canvasRatio = canvasWidth / canvasHeight;
    //var viewAngle = 30.0;
    var viewAngle = 55.0;
    var near = 0.1;
    //var far = 20000;
    var far = 3000000;
    defaultCamPos = new THREE.Vector3(0.0, 0.0, 0.0)
    var camera = new THREE.PerspectiveCamera(viewAngle, canvasRatio, near, far);
    //camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
    //camera.position.set(1000, 500, -1500);
    camera.position.set(-600, 100, 300);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // LIGHTS
    //ambientLight = new THREE.AmbientLight(0xffffff); // 0.2
    var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    directionalLight.position.set(-600, 300, 600);
    scene.add(directionalLight);
    // directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    // directionalLight.position.set(0, 0, 0);

    


    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);
    loadSky();

    //add geometry
    // var geometry = new THREE.SphereGeometry(50, 128, 128); 
    // var material = new  THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) 
    // var sphere = new THREE.Mesh( geometry, material );    
    // scene.add( sphere );

    // previous water shader
    //add water surface
    // Load textures        
    //var waterNormals = new THREE.ImageUtils.loadTexture('/static/img/waternormals.jpg');
    //waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    var renderTargetLinearFloatParams = {
                minFilter:THREE.LinearFilter,
                magFilter:THREE.LinearFilter,
                wrapS:THREE.RenderTargetWrapping,
                wrapT:THREE.RenderTargetWrapping,
                format:THREE.RGBAFormat,
                stencilBuffer:false,
                depthBuffer:false,
                type:THREE.FloatType
            };
    waterNormals = new THREE.WebGLRenderTarget( 256, 256, renderTargetLinearFloatParams ); 
    
    // // Create the water effect
    waterObj = new THREE.Water(renderer, camera, scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: waterNormals,
        alpha:  1.0,
        sunDirection: directionalLight.position.normalize(),
        sunColor: 0xffffff,
        //waterColor: 0x001e0f,
        waterColor: 0x001e0f,
        betaVersion: 0,
        side: THREE.DoubleSide
    });


    //load sky
    

    //new water-height field shader
    //waterObj = new THREE.HeightFieldWater(renderer, camera, scene);
    
    //rendering material
    var waterMeshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000, 2000, 10, 10), 
        waterObj.material
    );

    waterMeshMirror.add(waterObj);
    waterMeshMirror.rotation.x = - Math.PI * 0.5;
    
    scene.add(waterMeshMirror);
 
    
    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize(){
    var camera = cameraControls.object;
    var canvasWidth = container.width();
    var canvasHeight = container.height();
    camera.aspect = canvasWidth / canvasHeight;
    renderer.setSize(canvasWidth, canvasHeight);
    //cameraControls.handleResize();
}

document.addEventListener('keydown', onDocumentKeyDown, false);

function onDocumentKeyDown(event){
    if(event.keyCode == 32){
        waterAnimation = !waterAnimation;
        return;
    }
}

function render(){
    cameraControls.update();
    waterObj.render();
    renderer.render(scene, cameraControls.object);
}

function animate(){
    if(waterAnimation){
        waterObj.material.uniforms.time.value += 1.0 / 60.0;
    }
    render();
    requestAnimationFrame(animate);
}

try {
    init();
    onWindowResize();
    animate();
    //getScaleUnit();
} catch(e) {
  var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  $('#waterContainer').append(errorReport+e);
}