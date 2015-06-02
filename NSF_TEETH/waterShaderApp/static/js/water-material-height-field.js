
THREE.ShaderLib['planeWater'] = {
  uniforms:THREE.UniformsUtils.merge([
    THREE.UniformsLib[ "fog" ], {
      "delta":            { type: "v2", value : new THREE.Vector2(1 / 512, 1 / 512)},
      "normalSampler":    { type: "t", value: null },
      "mirrorSampler":    { type: "t", value: null },
      "alpha":            { type: "f", value: 1.0 },
      "time":             { type: "f", value: 0.0 },
      "distortionScale":  { type: "f", value: 20.0 },
      "noiseScale":       { type: "f", value: 1.0 },
      "textureMatrix" :   { type: "m4", value: new THREE.Matrix4() },
      "sunColor":         { type: "c", value: new THREE.Color(0x7F7F7F) },
      "sunDirection":     { type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0) },
      "eye":              { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      "waterColor":       { type: "c", value: new THREE.Color(0x555555) }
    }
  ]),
  vertexShader:[
    'varying vec2 vUv;',
    'varying vec3 vNormal;',
    'varying vec4 vWorldPosition;',
    'void main() {',
    '  vUv = uv;',
    '  vNormal = normalMatrix * normal;',
    '  vWorldPosition = modelMatrix * vec4( position, 1.0 );',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader:[
    'varying vec2 vUv;',
    'uniform float time;',
    'uniform vec2 delta;',
    'uniform sampler2D mirrorSampler;',
    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    'void main() {',
    '  float u = vUv.x;',
    '  float v = vUv.y;',
    '  float avgNeighbor = ( texture2D(mirrorSampler, vec2(u-delta.x, v)).r + texture2D(mirrorSampler, vec2(u+delta.x, v)).r + texture2D(mirrorSampler, vec2(u, v-delta.y)).r + texture2D(mirrorSampler, vec2(u, v+delta.y)).r ) * 0.25;',
    '  float velocity = texture2D(mirrorSampler, vUv).g + avgNeighbor - texture2D(mirrorSampler, vUv).r;',
    '  velocity *= 0.995;',
    THREE.ShaderChunk[ "fog_fragment" ],
    '  gl_FragColor = vec4(texture2D(mirrorSampler, vUv).r + velocity, velocity, 0.0, 1.0);',
    '}'
  ].join('\n')
};

var reflectionCube = THREE.ImageUtils.loadTextureCube([
        "/static/img/px.jpg",
        "/static/img/nx.jpg",
        "/static/img/py.jpg",
        "/static/img/ny.jpg",
        "/static/img/pz.jpg",
        "/static/img/nz.jpg",
    ]);
reflectionCube.format = THREE.RGBFormat;

var groundTexture = THREE.ImageUtils.loadTexture("/static/img/ny.jpg");

var borderTexture = THREE.ImageUtils.loadTexture("/static/img/marble_black.jpg");
borderTexture.anisotropy = 10;
borderTexture.wrapS = borderTexture.wrapT = THREE.RepeatWrapping;
borderTexture.repeat.set(10.0, 2.0);


THREE.ShaderLib['planeWaterRendering'] = {
  uniforms:THREE.UniformsUtils.merge([
    THREE.UniformsLib[ "fog" ], {
      "delta":            { type: "v2", value : new THREE.Vector2(1 / 512, 1 / 512)},
      "normalSampler":    { type: "t", value: null },
      "mirrorSampler":    { type: "t", value: null },
      "cubeTexture":      { type: "t", value: reflectionCube},
      "groundSampler":    { type: "t", value: groundTexture},
      "borderSampler":    { type: "t", value: borderTexture},
      "alpha":            { type: "f", value: 1.0 },
      "time":             { type: "f", value: 0.0 },
      "distortionScale":  { type: "f", value: 20.0 },
      "noiseScale":       { type: "f", value: 1.0 },
      "textureMatrix" :   { type: "m4", value: new THREE.Matrix4() },
      "sunColor":         { type: "c", value: new THREE.Color(0x7F7F7F) },
      "sunDirection":     { type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0) },
      "eye":              { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      "waterColor":       { type: "c", value: new THREE.Color(0x555555) }
    }
  ]),
  vertexShader:[
    'varying vec4 vWorldPosition;',
    'varying vec2 vUv;',
    'uniform sampler2D mirrorSampler;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 curPos = position;',
    '  curPos.z = texture2D(mirrorSampler, vUv).r;',
    '  ',
    '  vWorldPosition = modelMatrix * vec4( curPos, 1.0 );',
    '',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( curPos, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader:[
      'varying vec4 vWorldPosition;',
      'varying vec2 vUv;',
      'uniform vec2 delta;',
      'uniform sampler2D mirrorSampler;',
      'uniform sampler2D groundSampler;',
      'uniform sampler2D borderSampler;',
      'uniform samplerCube cubeTexture;',
      'const float ground_level = 7.5;',
      THREE.ShaderChunk[ "common" ],
      THREE.ShaderChunk[ "fog_pars_fragment" ],
      'void main() {',
      '  vec3 du = vec3(0.15625, texture2D(mirrorSampler, vec2(vUv.x+delta.x, vUv.y)).r - texture2D(mirrorSampler, vUv).r, 0.0);',
      '  vec3 dv = vec3(0.0, texture2D(mirrorSampler, vec2(vUv.x, vUv.y+delta.y)).r - texture2D(mirrorSampler, vUv).r, -0.039);',
      '  vec3 normal = normalize( cross(du, dv) );',
      '  vec3 dirLight = normalize( vec3(0, 1, -1) );',
      '  vec3 reflectVec  = reflect( vWorldPosition.xyz, normal );',
      '  reflectVec = normalize(reflectVec);',
      '  vec4 environment;',
      '  float tx = (10.0*sign(reflectVec.x) - vWorldPosition.x) / reflectVec.x;',
      '  float tz = (-7.5                    - vWorldPosition.z) / reflectVec.z;',
      '  if(tx < tz){',
      '    vec4 border_reflect;',
      '    vec3 intersectWithBorder = vWorldPosition.xyz + reflectVec*tx;',
      '    if(intersectWithBorder.y < -2.5 && intersectWithBorder.z > -7.5){',
      '      // hit border',
      '      vec2 tex_coord_intersect;',
      '      tex_coord_intersect.x = fract( abs(intersectWithBorder.z+4.5)/1.0 );',
      '      tex_coord_intersect.y = fract( abs(intersectWithBorder.y+12.0)/2.0 );',
      '      // consider reflection on border (2nd reflection) ',
      '      reflectVec = reflect( reflectVec, vec3(-sign(reflectVec.x), 0, 0) );',
      '      environment = texture2D( borderSampler, tex_coord_intersect )*0.1 + textureCube( cubeTexture, reflectVec )*0.5;',
      '    } else {',
      '      // does not hit border',
      '      environment = textureCube( cubeTexture, reflectVec );',
      '    }',
      '  }else{',
      '    // check intersection with back wall',
      '    vec3 intersectWithBorder = vWorldPosition.xyz + reflectVec*tz;',
      '    if(intersectWithBorder.y < -2.5 && intersectWithBorder.x >= -10.0 && intersectWithBorder.x <= 10.0){',
      '      // hit border',
      '      vec2 tex_coord_intersect;',
      '      tex_coord_intersect.x = fract( abs(intersectWithBorder.x+10.0)/2.0 );',
      '      tex_coord_intersect.y = fract( abs(intersectWithBorder.y+4.5)/1.0 );',
      '      // consider reflection on border (2nd reflection) ',
      '      reflectVec = reflect( reflectVec, vec3(0, 0, 1) );',
      '      environment = texture2D( borderSampler, tex_coord_intersect )*0.1 + textureCube( cubeTexture, reflectVec )*0.5;',
      '    }else{',
      '      // does not hit border',
      '      environment = textureCube( cubeTexture, reflectVec );',
      '    }',
      '  }',
      '  // environment = textureCube( cubeTexture, reflectVec );',
      '  vec3 refractVec = refract( vWorldPosition.xyz, normal, 0.75 );',
      '  refractVec = normalize(refractVec);',
      '  vec3 t_intersect = (vec3(-10, -4.5, -7.5) - vWorldPosition.xyz) / refractVec;',
      '  if(t_intersect.x < 0.0){',
      '    // "refractVec" hits right border',
      '    t_intersect.x = (10.0-vWorldPosition.x) / refractVec.x;',
      '  }',
      '  vec2 tex_coord_intersect = vec2(0, 0);',
      '  vec4 border_refract;',
      '  if( abs(t_intersect.x) < abs(t_intersect.y) && abs(t_intersect.x) < abs(t_intersect.z) ){',
      '    // hit x side wall',
      '    tex_coord_intersect = vWorldPosition.zy + refractVec.zy*t_intersect.x;',
      '    tex_coord_intersect.x = fract( abs(tex_coord_intersect.x+4.5)/1.0 );',
      '    tex_coord_intersect.y = fract( abs(tex_coord_intersect.y+12.0)/2.0 );',
      '    ',
      '    border_refract = texture2D( borderSampler, tex_coord_intersect )*0.2;',
      '  }else if( abs(t_intersect.y) < abs(t_intersect.z) ){',
      '    // hit ground',
      '    tex_coord_intersect = vWorldPosition.xz + refractVec.xz*t_intersect.y;',
      '    tex_coord_intersect.x = fract( abs(tex_coord_intersect.x+10.0)/20.0 );',
      '    tex_coord_intersect.y = fract( abs(tex_coord_intersect.y+7.5)/5.0 );',
      '    border_refract = texture2D( groundSampler, tex_coord_intersect )*0.8;',
      '  }else{',
      '    // hit back wall',
      '    tex_coord_intersect = vWorldPosition.xy + refractVec.xy*t_intersect.z;',
      '    tex_coord_intersect.x = fract( abs(tex_coord_intersect.x+10.0)/2.0 );',
      '    tex_coord_intersect.y = fract( abs(tex_coord_intersect.y+4.5)/1.0 );',
      '    border_refract = texture2D( borderSampler, tex_coord_intersect )*0.2;',
      '  }',
      THREE.ShaderChunk[ "fog_fragment" ],
      '  gl_FragColor = environment*0.6 + border_refract;// + vec4(0, 0.01, 0.01, 1)*dot(normal, dirLight) + vec4(1.0, 1.0, 1.0, 1.0)*max( pow(dot(      reflectVec, dirLight),100.0), 0.0 );// + ground;//',
      '}',
  ].join('\n')
};




//create a water object with hieght field
// pass render, camera, scene and options

THREE.HeightFieldWater = function (renderer, camera, scene, options) {
  //create a object3D 
  THREE.Object3D.call(this);
  this.name = 'water_' + this.id;

  function optionalParameter (value, defaultValue) {
    return value !== undefined ? value : defaultValue;
  };

  options = options || {};
  
  this.matrixNeedsUpdate = true;
  
  var width = optionalParameter(options.textureWidth, 512);
  var height = optionalParameter(options.textureHeight, 512);
  this.clipBias = optionalParameter(options.clipBias, -0.0001);
  this.alpha = optionalParameter(options.alpha, 1.0);
  this.time = optionalParameter(options.time, 0.0);
  this.normalSampler = optionalParameter(options.waterNormals, null);
  this.sunDirection = optionalParameter(options.sunDirection, new THREE.Vector3(0.70707, 0.70707, 0.0));
  this.sunColor = new THREE.Color(optionalParameter(options.sunColor, 0xffffff));
  this.waterColor = new THREE.Color(optionalParameter(options.waterColor, 0x7F7F7F));
  this.eye = optionalParameter(options.eye, new THREE.Vector3(0, 0, 0));
  this.distortionScale = optionalParameter(options.distortionScale, 20.0);
  this.noiseScale = optionalParameter(options.noiseScale, 1.0);
  this.side = optionalParameter(options.side, THREE.FrontSide);
  this.fog = optionalParameter(options.fog, false);
  
  this.renderer = renderer;
  this.scene = scene;
  this.mirrorPlane = new THREE.Plane();
  this.normal = new THREE.Vector3(0, 0, 1);
  this.cameraWorldPosition = new THREE.Vector3();
  this.rotationMatrix = new THREE.Matrix4();
  this.lookAtPosition = new THREE.Vector3(0, 0, -1);
  this.clipPlane = new THREE.Vector4();
  
  if ( camera instanceof THREE.PerspectiveCamera ) {
    this.camera = camera;
  }
  else  {
    this.camera = new THREE.PerspectiveCamera();
    console.log(this.name + ': camera is not a Perspective Camera!')
  }

  this.textureMatrix = new THREE.Matrix4();

  this.mirrorCamera = this.camera.clone();
  
  this.texture = new THREE.WebGLRenderTarget(width, height);
  this.tempTexture = new THREE.WebGLRenderTarget(width, height);
  this.dummyTexture = new THREE.WebGLRenderTarget(1, 1);
  
  var mirrorShader = THREE.ShaderLib["planeWaterRendering"];
  var mirrorUniforms = THREE.UniformsUtils.clone(mirrorShader.uniforms);

  this.material = new THREE.ShaderMaterial({ 
    fragmentShader: mirrorShader.fragmentShader, 
    vertexShader: mirrorShader.vertexShader, 
    uniforms: mirrorUniforms,
    transparent: true,
    side: this.side,
    fog: this.fog
  });
  
  this.mesh = new THREE.Object3D();

  this.material.uniforms.mirrorSampler.value = this.texture;
  this.material.uniforms.textureMatrix.value = this.textureMatrix;
  this.material.uniforms.alpha.value = this.alpha;
  this.material.uniforms.time.value = this.time;
  this.material.uniforms.normalSampler.value = this.normalSampler;
  this.material.uniforms.sunColor.value = this.sunColor;
  this.material.uniforms.waterColor.value = this.waterColor;
  this.material.uniforms.sunDirection.value = this.sunDirection;
  this.material.uniforms.distortionScale.value = this.distortionScale;
  this.material.uniforms.noiseScale.value = this.noiseScale;
  
  this.material.uniforms.eye.value = this.eye;
  
  if ( !THREE.Math.isPowerOfTwo(width) || !THREE.Math.isPowerOfTwo(height) ) {
    this.texture.generateMipmaps = false;
    this.tempTexture.generateMipmaps = false;
  }

  this.updateTextureMatrix();
  this.render();
};

THREE.HeightFieldWater.prototype = Object.create(THREE.Object3D.prototype);

THREE.HeightFieldWater.prototype.renderWithMirror = function (otherMirror) {

  // update the mirror matrix to mirror the current view
  this.updateTextureMatrix();
  this.matrixNeedsUpdate = false;

  // set the camera of the other mirror so the mirrored view is the reference view
  var tempCamera = otherMirror.camera;
  otherMirror.camera = this.mirrorCamera;

  // render the other mirror in temp texture
  otherMirror.render(true);

  // render the current mirror
  this.render();
  this.matrixNeedsUpdate = true;

  // restore material and camera of other mirror
  otherMirror.camera = tempCamera;

  // restore texture matrix of other mirror
  otherMirror.updateTextureMatrix();
};

THREE.HeightFieldWater.prototype.updateTextureMatrix = function () {
  if ( this.parent !== undefined ) {
    this.mesh = this.parent;
  }
  function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

  this.updateMatrixWorld();
  this.camera.updateMatrixWorld();

  this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

  this.rotationMatrix.extractRotation(this.matrixWorld);

  this.normal = (new THREE.Vector3(0, 0, 1)).applyEuler(this.mesh.rotation);
  var cameraPosition = this.camera.position.clone().sub( this.mesh.position );
  if ( this.normal.dot(cameraPosition) < 0 ) {
    var meshNormal = (new THREE.Vector3(0, 0, 1)).applyEuler(this.mesh.rotation);
    this.normal.reflect(meshNormal);
  }

  var view = this.mesh.position.clone().sub(this.cameraWorldPosition);
  view.reflect(this.normal).negate();
  view.add(this.mesh.position);

  this.rotationMatrix.extractRotation(this.camera.matrixWorld);

  this.lookAtPosition.set(0, 0, -1);
  this.lookAtPosition.applyMatrix4(this.rotationMatrix);
  this.lookAtPosition.add(this.cameraWorldPosition);

  var target = this.mesh.position.clone().sub(this.lookAtPosition);
  target.reflect(this.normal).negate();
  target.add(this.mesh.position);

  this.up.set(0, -1, 0);
  this.up.applyMatrix4(this.rotationMatrix);
  this.up.reflect(this.normal).negate();

  this.mirrorCamera.position.copy(view);
  this.mirrorCamera.up = this.up;
  this.mirrorCamera.lookAt(target);
  this.mirrorCamera.aspect = this.camera.aspect;

  this.mirrorCamera.updateProjectionMatrix();
  this.mirrorCamera.updateMatrixWorld();
  this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

  // Update the texture matrix
  this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
              0.0, 0.5, 0.0, 0.5,
              0.0, 0.0, 0.5, 0.5,
              0.0, 0.0, 0.0, 1.0);
  this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
  this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

  // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
  // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
  this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mesh.position);
  this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

  this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

  var q = new THREE.Vector4();
  var projectionMatrix = this.mirrorCamera.projectionMatrix;

  q.x = (sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
  q.y = (sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
  q.z = -1.0;
  q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

  // Calculate the scaled plane vector
  var c = new THREE.Vector4();
  c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

  // Replacing the third row of the projection matrix
  projectionMatrix.elements[2] = c.x;
  projectionMatrix.elements[6] = c.y;
  projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
  projectionMatrix.elements[14] = c.w;
  
  var worldCoordinates = new THREE.Vector3();
  worldCoordinates.setFromMatrixPosition(this.camera.matrixWorld);
  this.eye = worldCoordinates;
  this.material.uniforms.eye.value = this.eye;
};

THREE.HeightFieldWater.prototype.render = function (isTempTexture) {

  if ( this.matrixNeedsUpdate ) {
    this.updateTextureMatrix();
  }

  this.matrixNeedsUpdate = true;

  // Render the mirrored view of the current scene into the target texture
  if ( this.scene !== undefined && this.scene instanceof THREE.Scene ) {
    // Remove the mirror texture from the scene the moment it is used as render texture
    // https://github.com/jbouny/ocean/issues/7 
    this.material.uniforms.mirrorSampler.value = this.dummyTexture;
    
    var renderTexture = (isTempTexture !== undefined && isTempTexture)? this.tempTexture : this.texture;
    this.renderer.render(this.scene, this.mirrorCamera, renderTexture, true);
    
    this.material.uniforms.mirrorSampler.value = renderTexture;
  }

};