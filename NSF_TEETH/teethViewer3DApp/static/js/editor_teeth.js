var rotationState = "enabled";
var getPointValMode = "disabled";
var pointsPicked = [];
var pointsPickedCounter = -1;
var test_intersect;
// function to toggle rotation
$('#rotationControl').click(function(){
	if(rotationState == "enabled"){
		cameraControls.noRotate = true;
		rotationState = "disabled";
		$('#rotationControl span:first').addClass("icon-disabled");
		$("#getPointVal").trigger("click");
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
		$('#rotationControl').trigger("click");
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
		test_intersect = intersects;

		if(intersects.length > 0){
			// console.log(intersects[0]);
			var mCurvature = "";
			var face = intersects[0].face;
			if (face !== null){
				var faceColors = face.vertexColors;
				var vertex_hue = 0.0;
				var num_vertices = 0.0;
				for(var i in faceColors){
					vertex_hue += faceColors[i].getHSL().h;
					num_vertices += 1.0;
				}
				mCurvature = vertex_hue/num_vertices;
			}
			pointsPickedCounter++;
			if(mCurvature !== ""){
				pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":intersects[0].point,"mCurvature":mCurvature});
				displayPointsOnUI(intersects[0].point,pointsPickedCounter,mCurvature);
			}else{
				pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":intersects[0].point});
				displayPointsOnUI(intersects[0].point,pointsPickedCounter);
			}
			var sphereGeometry = new THREE.SphereGeometry( 0.4, 32, 32 );
			var sphereMaterial = new THREE.MeshBasicMaterial( { color: '#000', shading: THREE.FlatShading } );
			// intersects[0].object.material.color.setRGB(Math.random(),Math.random(),Math.random());
			var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
			sphere.pointId = pointsPicked[pointsPicked.length-1].pointId;
			sphere.position.x = intersects[0].point.x;
			sphere.position.y = intersects[0].point.y;
			sphere.position.z = intersects[0].point.z;
			scene.add(sphere);
		}
	}
}

function displayPointsOnUI(point,pointId,mCurvature){
	// console.log(colors);
	if(mCurvature !== ""){
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'><span>x : "+parseFloat(point.x).toFixed(3)+" y : "+parseFloat(point.y).toFixed(3)+" z :"+parseFloat(point.z).toFixed(3)+"<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+"</span><button style='float:right' data-id='"+pointId+"' onclick='delPoint(this);'>Del</button></div>");
	}else{
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'><span>x : "+parseFloat(point.x).toFixed(3)+" y : "+parseFloat(point.y).toFixed(3)+" z :"+parseFloat(point.z).toFixed(3)+"</span><button style='float:right' data-id='"+pointId+"' onclick='delPoint(this);'>Del</button></div>");
	}
}

// function to select particular point
function selectRow(that){
	var selectedPointId = $(that).find('button').data('id');
	$.each(scene.__webglObjects, function(key,val){
		if(val[0].object.pointId == selectedPointId){
			if(val[0].object.material.color.getStyle() == 'rgb(0,0,0)')
				val[0].object.material.color.setStyle("red");
			else if(val[0].object.material.color.getStyle() == 'rgb(255,0,0)')
				val[0].object.material.color.setStyle("black");
		}
	});
	$(that).toggleClass('selectedPoint');
}

function delPoint(that){
	$.each(scene.__webglObjects, function(key,val){
		if(val[0].object.pointId == $(that).data('id'))
			scene.remove(val[0].object);
	});
	$(that).parent().remove();
	$.each(pointsPicked, function(i){
	    if(pointsPicked[i].pointId === $(that).data('id')) {
	        pointsPicked.splice(i,1);
	        return false;
	    }
	});
	// pointsPickedCounter--;
}

function exportPointsToCSV(){
	// console.log(pointsPicked);
	var colorExport = false;
	var exportArray = [];
	$.each(pointsPicked,function(index,val){
		var pointVal = [];
		if(val.hasOwnProperty('mCurvature')){
			curvatureExport = true;
		}
		pointVal.push(val.coordinates.x);
		pointVal.push(val.coordinates.y);
		pointVal.push(val.coordinates.z);
		if(curvatureExport){
			pointVal.push(val.mCurvature);
		}
		exportArray.push(pointVal);
	});
	var csvContent;
	if(curvatureExport){
		csvContent = 'X,Y,Z,mCurvature' + "\n";
	}else{
		csvContent = 'X,Y,Z' + "\n";
	}

	exportArray.forEach(function(pointElements, index){
		dataString = pointElements.join(",");
		csvContent += dataString+ "\n";
	});
	var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
	saveAs(blob, "pointsExport.csv");
}

function deleteAllPoints(){
	$("#pointsPickedInfo div").children().remove();
	$.each(scene.__webglObjects, function(key,val){
		$.each(pointsPicked, function(i){
		    if(val[0].object.pointId == pointsPicked[i].pointId) {
		        scene.remove(val[0].object);
		    }
		});
	});
	pointsPickedCounter = -1;
	pointsPicked = [];
}
