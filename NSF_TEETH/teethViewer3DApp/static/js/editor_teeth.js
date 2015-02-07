var rotationState = "enabled";
var getPointValMode = "disabled";
var pointsPicked = [];
var pointsPickedCounter = -1;

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

//---------------Here is the code for finding vertex colors-----------------
		// try {
		// 	var face = intersects[0].face
		// 	if (face !== null){
		// 		var faceColors = face.vertexColors;
		// 		var blue = 0.0;
		// 		var green = 0.0;
		// 		var red = 0.0;
		// 		for(var i in faceColors){
		// 			blue += faceColors[i].b;
		// 			green += faceColors[i].g;
		// 			red += faceColors[i].r;
		// 		}
		// 		blue /= 3.0;
		// 		green /=3.0;
		// 		red /= 3.0;
		// 		console.log("blue: " + blue);
		// 		console.log("green: " + green);
		// 		console.log("red: " + red);
		// 	}
		// }
		// catch(e) {
		// 	var errorReport = "Have an error to find face colors";
  // 			$('#container').append(errorReport+e);
		// }

//----------------------The end of code--------------------


		if(intersects.length > 0){
			// console.log(intersects[0]);
			var colors = "";
			var face = intersects[0].face;
			if (face !== null){
				var faceColors = face.vertexColors;
				var blue = 0.0;
				var green = 0.0;
				var red = 0.0;
				for(var i in faceColors){
					blue += faceColors[i].b;
					green += faceColors[i].g;
					red += faceColors[i].r;
				}
				blue /= 3.0;
				green /=3.0;
				red /= 3.0;
				// console.log("blue: " + blue);
				// console.log("green: " + green);
				// console.log("red: " + red);
				colors = {"red":red,"green":green,"blue":blue};
			}
			pointsPickedCounter++;									
			if(colors){				
				pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":intersects[0].point,"colors":colors});	
				displayPointsOnUI(intersects[0].point,pointsPickedCounter,colors);
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

function displayPointsOnUI(point,pointId,colors){	
	// console.log(colors);
	if(typeof colors != 'undefined'){
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'><span>x : "+parseFloat(point.x).toFixed(3)+" y : "+parseFloat(point.y).toFixed(3)+" z :"+parseFloat(point.z).toFixed(3)+"<br>r : "+parseFloat(colors.red).toFixed(3)+" g : "+parseFloat(colors.green).toFixed(3)+" b :"+parseFloat(colors.blue).toFixed(3)+"</span><button style='float:right' data-id='"+pointId+"' onclick='delPoint(this);'>Del</button></div>");
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
		if(val.hasOwnProperty('colors')){
			colorExport = true;	
		}		
		pointVal.push(val.coordinates.x);
		pointVal.push(val.coordinates.y);
		pointVal.push(val.coordinates.z);
		if(colorExport){
			pointVal.push(val.colors.red);
			pointVal.push(val.colors.green);
			pointVal.push(val.colors.blue);
		}		
		exportArray.push(pointVal);
	});
	var csvContent;
	if(colorExport){
		csvContent = 'X,Y,Z,R,G,B' + "\n";
	}else{
		csvContent = 'X,Y,Z' + "\n";
	}
	
	exportArray.forEach(function(coordinatesArray, index){
		dataString = coordinatesArray.join(",");
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
