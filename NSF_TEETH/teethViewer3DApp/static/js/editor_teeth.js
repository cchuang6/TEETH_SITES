var rotationState = "enabled";
var getPointValMode = "disabled";
var pointsPicked = [];
var pointsPickedCounter = -1;
var selectedPoint;
var markedPointIds = [];
var hoverPoint;

// default rotation control is on, set cursor
$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');

// function to toggle rotation and point picking
$('#rotationControl').click(function(){
	if(rotationState == "enabled"){
		cameraControls.noRotate = true;
		cameraControls.noPan = true;
		rotationState = "disabled";
		getPointValMode = "enabled";
		$('#rotationControl span:first').removeClass("icon-rotate");
		$('#rotationControl span:first').addClass("icon-pointpick");		
		$('html,body').css('cursor','default');
		$('#getPointVal span:first').removeClass("icon-disabled");
		if(rotationState == "enabled"){
			cameraControls.noRotate = true;
			cameraControls.noPan = true;
			rotationState = "disabled";
			$('#rotationControl span:first').addClass("icon-disabled");
		}
		$("#pointsPickedInfo").show();
	}
	else if(rotationState == "disabled"){
		cameraControls.noRotate = false;
		cameraControls.noPan = false;
		rotationState = "enabled";
		$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');		
		$('#rotationControl span:first').removeClass("icon-pointpick");
		$('#rotationControl span:first').addClass("icon-rotate");
		getPointValMode = "disabled";		
		$("#pointsPickedInfo").hide();
	}
});


// function to toggle point picking
// $("#getPointVal").click(function(){
// 	if(getPointValMode == "disabled"){
// 		getPointValMode = "enabled";
// 		$('html,body').css('cursor','default');
// 		$('#getPointVal span:first').removeClass("icon-disabled");
// 		if(rotationState == "enabled"){
// 			cameraControls.noRotate = true;
// 			cameraControls.noPan = true;
// 			rotationState = "disabled";
// 			$('#rotationControl span:first').addClass("icon-disabled");
// 		}
// 		$("#pointsPickedInfo").show();
// 	}
// 	else{
// 		getPointValMode = "disabled";
// 		$('#getPointVal span:first').addClass("icon-disabled");
// 		$("#pointsPickedInfo").hide();
// 		$('#rotationControl').trigger("click");
// 	}
// });


document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false);
document.addEventListener( 'mouseup', onDocumentMouseUp, false);

// event listener that gets x,y,z on mouse hover
function onDocumentMouseMove( event ){
	event.preventDefault();
	event.stopPropagation();

	if(outCanvas(event.clientX, event.clientY)){
		$("#pointPickerDiv").hide();
		return;	
	} 

	if(getPointValMode == "enabled"){
		//selected point, ray cast 
		var intersects = getRayCastIntersects(event.clientX, event.clientY);
		//var intersect_Id = ((intersects.length - 1) <= 0 )? (intersects.length - 1) : 1;
		var intersect_Id = 0;
		if(intersects[intersect_Id].object.pointId != undefined)
			intersect_Id = ((intersects.length - 1) <= 0 )? (intersects.length - 1) : 1;

		//console.log("intersect_Id: ", intersect_Id);
		//console.log("intersects.length: ", intersects.length);
		//console.log(intersects[intersect_Id].object);
		if(intersect_Id > -1){
			//copy the moved position to the the selected objec
			if(selectedPoint){
				selectedPoint.position.copy(intersects[intersect_Id].point);
			}else{
				updateHoverStatus(intersects);
			}
			$("#pointPickerDiv p").html("x: " + intersects[intersect_Id].point.x + 
										"<br>y: " + intersects[intersect_Id].point.y +
										"<br>z: " + intersects[intersect_Id].point.z);
			$("#pointPickerDiv").css({top: (event.pageY+5)+"px",left: (event.pageX+5)+"px"}).show();
		}else{
			clearHoverPoint(hoverPoint);
			$("#pointPickerDiv").hide();
		}
	}else{
		$("#pointPickerDiv").hide();
	}
}

// event listener for mouse up event
function onDocumentMouseUp( event ){
	if(rotationState == "enabled"){
		$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');
		return;
	}
	if(getPointValMode == "enabled"){
		if(selectedPoint){
			var pointId = selectedPoint.pointId;
			var intersects = getRayCastIntersects(event.clientX, event.clientY);
			var mCurvature = getMeanCurvature(intersects, intersects.length - 1);
			$.each($("#pointsPickedInfo div > div"),function(key,val){			
				if($(val).find("button").data("id") == pointId){
					updatePointsOnUI($(val), selectedPoint, pointId, mCurvature);
				}			
			});
			selectedPoint = null;
		}		
		$('html,body').css('cursor','auto');
		return;
	}
}

// event listener that handles point picking using raycaster
function onDocumentMouseDown( event ) {
	event.preventDefault();

	if(outCanvas(event.clientX, event.clientY)){
		$("#pointPickerDiv").hide();
		return;	
	}

	if(rotationState == "enabled"){
		$('html,body').css('cursor','url("/static/css/images/webgl/handpress.png"), auto');
	}
	if(getPointValMode == "enabled"){
		var intersects = getRayCastIntersects(event.clientX, event.clientY);
		//return if nothing
		if (intersects.length < 1) return;
		var top_id = 0;
		var pointId = intersects[top_id].object.pointId;
		//add point onto scene
		if(pointId == undefined){
			addPoint(intersects, top_id);
		}
		//move or delete point
		else{						
			if(event.button == 0){
				selectedPoint = intersects[top_id].object;
				$('html,body').css('cursor','move');
				// pass in a dummy first parameter
				selectRow("that",pointId);
			}
			if(event.button == 2){
				// pass in a dummy first parameter
				delPoint("that",pointId);
			}
		}
	}
}

function outCanvas(x, y){
	var canvasWidth = container.width();
	var leftOffset = container.offset().left;
	var topOffset = container.offset().top;
	return (x - leftOffset < 0 ) || (x - leftOffset - canvasWidth > 0) || (y - topOffset < 0);
}

function updateHoverStatus(intersects){
	//point should be the first intersect
	var pointId = intersects[0].object.pointId;
	//check if move on a point
	if(pointId != undefined){
		if(hoverPoint){
			// check the intersect point is equal to hover point
			if(pointId != hoverPoint.pointId){
				clearHoverPoint(hoverPoint);
				setHoverPoint(intersects[0].object);	
			}
		}
		// first time, set hover point
		else{
			setHoverPoint(intersects[0].object);
		}
	}
	else
		clearHoverPoint(hoverPoint);
}

function clearHoverPoint(){
	//TODO: check logic here
	if(hoverPoint){
		//if(selectedPoint)
		var index = -1;
		hoverPoint.material.opacity = 1.0;
		hoverPoint = null;
	}
}

function setHoverPoint(point){
	hoverPoint = point;
	hoverPoint.material.opacity = 0.4;

}


function getRayCastIntersects(x, y){
	var canvasWidth = container.width();
	var canvasHeight = container.height();
	var camera = cameraControls.object;
	var leftOffset = container.offset().left;
	var topOffset = container.offset().top;
	var mouseVector = new THREE.Vector3(2*((x - leftOffset)/canvasWidth)-1, 
										1-2*((y -topOffset)/canvasHeight),
										0.5);
	var projector = new THREE.Projector();
	projector.unprojectVector(mouseVector,camera);
	var raycaster = new THREE.Raycaster(camera.position,mouseVector.sub(camera.position).normalize());
	return raycaster.intersectObjects(scene.children,true);

}

//add points into scene
function addPoint(intersects, index){
	var mCurvature = getMeanCurvature(intersects, index);
	var point = intersects[index].point;

	pointsPickedCounter++;
	if(mCurvature !== ""){
		pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":point,"mCurvature":mCurvature});
		displayPointsOnUI(point,pointsPickedCounter,mCurvature);
	}else{
		pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":point});
		displayPointsOnUI(point,pointsPickedCounter);
	}

	//create point
	var sphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { color: '#000', transparent: true, opacity: 1.0 } );
	var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
	sphere.pointId = pointsPicked[pointsPicked.length-1].pointId;
	sphere.position.x = point.x;
	sphere.position.y = point.y;
	sphere.position.z = point.z;
	scene.add(sphere);
}

function getMeanCurvature(intersects, index){
	var mCurvature = "";
	var face = intersects[index].face;
	//get curvature color
	if (face !== null){
		var faceColors = face.vertexColors;
		var vertex_hue = 0.0;
		var num_vertices = 0.0;
		for(var i in faceColors){
			vertex_hue += rgbToMeanCurvature(faceColors[i].r,
		                                     faceColors[i].g,
		                                     faceColors[i].b);
			num_vertices += 1.0;
		}
		mCurvature = vertex_hue/num_vertices;
	}
	return mCurvature;
}
function rgbToMeanCurvature(red, green, blue){
	var eps = 0.005;
	if (parseFloat(red) >= (1.0 - eps) && parseFloat(blue) <= eps){
		return parseFloat(green)/4.0;
	}
	if (parseFloat(green) >= (1.0 - eps) && parseFloat(blue) <= eps){
		return (1-parseFloat(red))/4.0 + 0.25;
	}
	if (parseFloat(red) <= eps && parseFloat(green) >= (1.0 - eps)){
		return parseFloat(blue)/4.0 + 0.5;
	}
	if (parseFloat(red) <= eps && parseFloat(blue) >= (1.0 - eps)){
		return (1-parseFloat(green))/4.0 + 0.75;
	}
}

function displayPointsOnUI(point,pointId,mCurvature){
	if(mCurvature !== undefined){
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'>"+
			"<span>x : "+parseFloat(point.x).toFixed(3)+
			" y : "+parseFloat(point.y).toFixed(3)+
			" z :"+parseFloat(point.z).toFixed(3)+
			"<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
			"</span><button style='float:right' data-id='"+pointId+
			"' onclick='delPoint(this);'>Del</button></div>");
	}else{
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'>"+
			"<span>x : "+parseFloat(point.x).toFixed(3)+
			" y : "+parseFloat(point.y).toFixed(3)+
			" z :"+parseFloat(point.z).toFixed(3)+
			"</span><button style='float:right' data-id='"+pointId+
			"' onclick='delPoint(this);'>Del</button></div>");
	}
}

function updatePointsOnUI(item, point, pointId, mCurvature){
	if(mCurvature !== undefined){
		item.html("<span>x : "+parseFloat(point.position.x).toFixed(3)+
				   " y : "+parseFloat(point.position.y).toFixed(3)+
				   " z :"+parseFloat(point.position.z).toFixed(3)+
				   "<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
				   "</span><button style='float:right' data-id="+pointId+
				   " onclick='delPoint(this);'>Del</button>");
	}
	else{
		item.html("<span>x : "+parseFloat(point.position.x).toFixed(3)+
			" y : "+parseFloat(point.position.y).toFixed(3)+
			" z :"+parseFloat(point.position.z).toFixed(3)+
			"</span><button style='float:right' data-id="+pointId+
			" onclick='delPoint(this);'>Del</button>");

	}

}

// function to select particular point
function selectRow(that,pointId){
	var selectedPointId;
	//choose from UI
	if(pointId == undefined){
		selectedPointId = $(that).find('button').data('id');
	}else//choose from viewer
	{
		selectedPointId = pointId;
	}
	//check if selected before
	var unmark_index = -1;
	while(++unmark_index < markedPointIds.length){
		if(markedPointIds[unmark_index] == selectedPointId) break;
	}

	console.log("Mousedown point id in selectRow: ", selectedPointId);
	console.log("markedPointIds length in selectRow: ", markedPointIds.length);
	console.log("unmark index in selectRow: ", unmark_index);
	$.each(scene.__webglObjects, function(key,val){
		if(val[0].object.pointId == selectedPointId){
			//already eixisted
			if(unmark_index < markedPointIds.length){
				val[0].object.material.color.setStyle("black");
				markedPointIds.splice(unmark_index, 1);
			}
			else //add into marked points
			{
				val[0].object.material.color.setStyle("red");
				markedPointIds.push(selectedPointId);	
			}
		}
	});

	if(pointId == undefined){
		$(that).toggleClass('selectedPoint');
	}else{
		$.each($("#pointsPickedInfo div > div"),function(key,val){
			if($(val).find("button").data("id") == pointId){
				$(val).toggleClass('selectedPoint');
			}
		});
	}	
}

function delPoint(that,pointId){	
	if(pointId == undefined){
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
		$.each(markedPointIds, function(i){
	    	if(markedPointIds[i].pointId === pointId) {
	        	markedPointIds.splice(i,1);
	        	return false;
	    	}
		});
	}else{
		$.each(scene.__webglObjects, function(key,val){
			if(val[0].object.pointId == pointId)
				scene.remove(val[0].object);
		});	
		$.each($("#pointsPickedInfo div > div"),function(key,val){			
			if($(val).find("button").data("id") == pointId){
				$(val).remove();
			}			
		});
		$.each(pointsPicked, function(i){
	    	if(pointsPicked[i].pointId === pointId) {
	        	pointsPicked.splice(i,1);
	        	return false;
	    	}
		});
		$.each(markedPointIds, function(i){
	    	if(markedPointIds[i].pointId === pointId) {
	        	markedPointIds.splice(i,1);
	        	return false;
	    	}
		});
	}			
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
	markedPointIds = [];
}


// rendering scales
function createScale(){	
	var axisScale = d3.scale.linear().domain([0,1]).range([0,280]);	
	var xAxis = d3.svg.axis().scale(axisScale);	
	var svgContainer = d3.select("#tpHueHelp").append("svg:svg").attr("width", 300).attr("height", 20);	
	var xAxisGroup = svgContainer.append("g").call(xAxis);
	$("#tpHueHelp svg").css("margin-top","1px");
	// $("#tpHueHelp svg").css("padding-left","10px");
	// $("#mCurvatureGradient").css("padding-left","5px");
}

createScale();