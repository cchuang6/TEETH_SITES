var rotationState = "enabled";
var getPointValMode = "disabled";


// function to toggle rotation
$('#rotationControl').click(function(){ 	
	if(rotationState == "enabled"){
		cameraControls.noRotate = true;
		rotationState = "disabled";
		$('#rotationControl span:first').addClass("icon-disabled");
	}
	else if(rotationState == "disabled"){
		cameraControls.noRotate = false;
		rotationState = "enabled";	
		$('#rotationControl span:first').removeClass("icon-disabled");
		getPointValMode = "disabled";
		$('#getPointVal span:first').addClass("icon-disabled");
		$("#pointsPickedInfo").hide();
	}		
});


// function to toggle point picking
$("#getPointVal").click(function(){
	if(getPointValMode == "disabled"){
		getPointValMode = "enabled";
		$('#getPointVal span:first').removeClass("icon-disabled");
		if(rotationState == "enabled"){
			cameraControls.noRotate = true;
			rotationState = "disabled";
			$('#rotationControl span:first').addClass("icon-disabled");
		}	
		$("#pointsPickedInfo").show();	
	}
	else{
		getPointValMode = "disabled";
		$('#getPointVal span:first').addClass("icon-disabled");
		$("#pointsPickedInfo").hide();
	}		
});


document.addEventListener( 'mousedown', onDocumentMouseDown, false );

// event listener that handles point picking using raycaster
function onDocumentMouseDown( event ) {
	event.preventDefault();	
	if(getPointValMode == "enabled"){	
		var canvasWidth = container.width(); 
		var canvasHeight = container.height();	
		var camera = cameraControls.object;
		var mouseVector = new THREE.Vector3(2*(event.clientX/canvasWidth)-1, 1-2*(event.clientY/canvasHeight));
		var projector = new THREE.Projector();
		projector.unprojectVector(mouseVector,camera);		
		var raycaster = new THREE.Raycaster(camera.position,mouseVector.sub(camera.position).normalize());		
		var intersects = raycaster.intersectObjects(scene.children,true);		
		if(intersects.length > 0){
			// console.log(intersects[0].point);			
			displayPointsOnUI(intersects[0].point);
			var sphereGeometry = new THREE.SphereGeometry( 0.4, 32, 32 );
			var sphereMaterial = new THREE.MeshBasicMaterial( { color: '#'+Math.random().toString(16).substr(-6), shading: THREE.FlatShading } );
			// intersects[0].object.material.color.setRGB(Math.random(),Math.random(),Math.random());
			var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);				
			sphere.position.x = intersects[0].point.x;
			sphere.position.y = intersects[0].point.y;
			sphere.position.z = intersects[0].point.z;			
			scene.add(sphere);
		}
	}	
}

function displayPointsOnUI(point){
	$("#pointsPickedInfo div:first").append("<div style='padding:5px;'><span>x : "+parseFloat(point.x).toFixed(3)+" y : "+parseFloat(point.y).toFixed(3)+" z :"+parseFloat(point.z).toFixed(3)+"</span><button style='float:right' onclick='delPoint(this);'>Del</button></div>");
}

function delPoint(that){
	$(that).parent().remove();
}
