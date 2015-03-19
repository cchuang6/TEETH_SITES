var rotationState = "enabled";
var getPointValMode = "disabled";
var pointsPicked = [];
var pointsPickedCounter = -1;
var selectedPoint;
var org_selectedPoint;
var lastSelected;
var markedPointIds = [];
var hoverPoint;
var holdKey = false;

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
document.addEventListener( 'keydown', onDocumentKeyDown, false);
document.addEventListener( 'keyup', onDocumentKeyUp, false);
document.body.addEventListener( 'mousewheel', mousewheel, false );
document.body.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

function mousewheel(e){
	updatePointSize();
}

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
		var intersect_Id = getIntersectId(intersects);
		//console.log(intersect_Id);

		if(intersect_Id > -1){
			//copy the moved position to the the selected objec
			if(selectedPoint){
				selectedPoint.position.copy(intersects[intersect_Id].point);
				//make the point selected
			}
		}
		//console.log("Move button: ", event.button || event.which);
		updateHoverStatus(intersects, intersect_Id, event);
	}else{
		$("#pointPickerDiv").hide();
	}
}

// get the intersect id
// if no intersection, return -1, others return the point hit on the teeth surface
function getIntersectId(intersects){
	if (intersects.length == 0) return -1;
	var intersect_Id = 0;
	//check if it is point
	if(intersects[intersect_Id].object.pointId != undefined){
		//check if hit on the same point
		if(selectedPoint)
			if(intersects[intersect_Id].object.pointId != selectedPoint.pointId)
				return -1;
		//check if it has at least two elements
		(intersects.length > 1) ? intersect_Id = 1 : intersect_Id = -1;
		//check the second is point
		if(intersect_Id == 1)
			(intersects[intersect_Id].object.pointId != undefined) ? intersect_Id = -1 : intersect_Id = 1;
	}
	return intersect_Id;
}
// event listener for mouse up event
function onDocumentMouseUp( event ){
	if(rotationState == "enabled"){
		$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');
		return;
	}
	if(getPointValMode == "enabled"){
		if(selectedPoint){
			intersects_Id = -1;
			//check if inside canvas
			if(!outCanvas(event.clientX, event.clientY)){
				var pointId = selectedPoint.pointId;
				var intersects = getRayCastIntersects(event.clientX, event.clientY);
				intersect_Id = getIntersectId(intersects);
			}
			if(intersect_Id > -1){
				var mCurvature = getMeanCurvature(intersects, intersect_Id);
				$.each($("#pointsPickedInfo div > div"),function(key,val){
					if($(val).find("button").data("id") == pointId){
						if(!isNaN(mCurvature)){
							updatePointsOnUI($(val), selectedPoint, pointId, mCurvature);
						} else {
							updatePointsOnUI($(val), selectedPoint, pointId);
						}
					}
				});

			}
			else{
				//updateSelectedPoints();
				selectedPoint.position.copy(org_selectedPoint);
			}
			//change selected point color
			updateSelectedPoints();
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
			if( (event.button || event.which) === 1){
				addPoint(intersects, top_id);
			}
		}
		//move or delete point
		else{
			if( (event.button || event.which) === 1){
				selectedPoint = intersects[top_id].object;
				if(org_selectedPoint == undefined){
					org_selectedPoint = new THREE.Vector3();
				}
				org_selectedPoint.copy(selectedPoint.position);
				$('html,body').css('cursor','move');
				// pass in a dummy first parameter
				selectRow("that", pointId);
			}
			if(event.button === 2){
				// pass in a dummy first parameter
				delPoint("that",pointId);
			}
		}
	}
}

// event listener to handle keyboard (down) events
function onDocumentKeyDown(event){
	if(holdKey && event.keyCode == 17){
		return;
	}
	holdKey = true;
	if(event.keyCode == 46 || event.keyCode == 8)
		deleteSelectedPoint();
	if(event.keyCode == 17){
		$("#rotationControl").click();
	}
}

// event listener to handle keyboard (up) events
function onDocumentKeyUp(event){
	holdKey = false;
	if(event.keyCode == 17){
		$("#rotationControl").click();
	}
}

// function to delete point from keyboard
function deleteSelectedPoint(){
	$.each(markedPointIds, function(key, val){
			delPoint("that",val);
		});

}

function outCanvas(x, y){
	var canvasWidth = container.width();
	var leftOffset = container.offset().left;
	var topOffset = container.offset().top;
	return (x - leftOffset < 0 ) || (x - leftOffset - canvasWidth > 0) || (y - topOffset < 0);
}

function updateHoverStatus(intersects, intersect_Id, event){

	if(intersects.length == 0){
		clearHoverPoint(hoverPoint);
		return;
	}
	//point should be the first intersect
	var pointId = intersects[0].object.pointId;
	//check if move on a point
	if(pointId != undefined){
		if(hoverPoint){
			// check the intersect point is equal to hover point
			if(pointId != hoverPoint.pointId && (event.button || event.which) != 1){
				clearHoverPoint(hoverPoint);
				setHoverPoint(intersects[0].object);
			}
		}
		// first time, set hover point
		else{
			setHoverPoint(intersects[0].object);
		}
	}
	else{
		if((event.button || event.which) != 1)
			clearHoverPoint(hoverPoint);
	}

	//set the context menu
	if(hoverPoint){
		$("#pointPickerDiv p").html("<span>" + (hoverPoint.pointId+1) + ")"+
									 "<br>x: " + hoverPoint.position.x +
									 "<br>y: " + hoverPoint.position.y +
									 "<br>z: " + hoverPoint.position.z);
		$("#pointPickerDiv").css({top: (event.pageY+5)+"px",left: (event.pageX+5)+"px"}).show();
	}
	else if(intersect_Id >-1){
		//updateHoverStatus(intersects);
		$("#pointPickerDiv p").html("x: " + intersects[intersect_Id].point.x +
									"<br>y: " + intersects[intersect_Id].point.y +
									"<br>z: " + intersects[intersect_Id].point.z);
		$("#pointPickerDiv").css({top: (event.pageY+5)+"px",left: (event.pageX+5)+"px"}).show();
	}
	else{
		//clearHoverPoint(hoverPoint);
		$("#pointPickerDiv").hide();
	}
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
	//var mouseVector = new THREE.Vector3(2*((x - leftOffset)/canvasWidth)-1,
	//									1-2*((y -topOffset)/canvasHeight),
	//									0.5);
	//var projector = new THREE.Projector();
	//projector.unprojectVector(mouseVector,camera);
	//var raycaster = new THREE.Raycaster(camera.position,mouseVector.sub(camera.position).normalize());
	var mouseVector = new THREE.Vector2(2*((x - leftOffset)/canvasWidth)-1,
										1-2*((y -topOffset)/canvasHeight));
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouseVector, camera);
	return raycaster.intersectObjects(scene.children,true);

}

//add points into scene
function addPoint(intersects, index){
	var mCurvature = getMeanCurvature(intersects, index);
	var point = intersects[index].point;

	pointsPickedCounter++;
	if(!isNaN(mCurvature)){
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
	var distance = cameraControls.object.position.distanceTo(cameraControls.target);
	if(distance > 0){
		var scaleUnit = getScaleUnit();
		var scale = (distance * scaleUnit)* orgPointScale;
		sphere.scale.x = scale;
		sphere.scale.y = scale;
		sphere.scale.z = scale;
	}
	var pointsObj = scene.getObjectByName("pointsObj");
	pointsObj.add(sphere);
	scene.add(pointsObj);
}

function getMeanCurvature(intersects, index){
	var mCurvature = "";
	if(intersects.length == 0) return mCurvature;
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
			"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
			" y : "+parseFloat(point.y).toFixed(3)+
			" z :"+parseFloat(point.z).toFixed(3)+
			"<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
			"</span><button style='float:right' data-id='"+pointId+
			"' onclick='delPoint(this);'>Del</button></div>");
	}else{
		$("#pointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;' onclick='selectRow(this);'>"+
			"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
			" y : "+parseFloat(point.y).toFixed(3)+
			" z :"+parseFloat(point.z).toFixed(3)+
			"</span><button style='float:right' data-id='"+pointId+
			"' onclick='delPoint(this);'>Del</button></div>");
	}
}

function updatePointsOnUI(item, point, pointId, mCurvature){
	// var material = new THREE.MeshPhongMaterial({
 //        color: 0xdddddd
 //    });
 //    var textGeom = new THREE.TextGeometry( 'Hello World!', {
 //        font: 'helvetiker' // Must be lowercase!
 //    });
 //    var textMesh = new THREE.Mesh( textGeom, material );
 //    scene.add( textMesh );
 //    console.log(scene);
	if(mCurvature !== undefined){
		item.html("<span>" + (pointId+1) + ") x : "+parseFloat(point.position.x).toFixed(3)+
				   " y : "+parseFloat(point.position.y).toFixed(3)+
				   " z :"+parseFloat(point.position.z).toFixed(3)+
				   "<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
				   "</span><button style='float:right' data-id="+pointId+
				   " onclick='delPoint(this);'>Del</button>");
	}
	else{
		item.html("<span>" + (pointId+1) + ") x : "+parseFloat(point.position.x).toFixed(3)+
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
	$.each(scene.getObjectByName("pointsObj").children, function(key,val){
		if(val.pointId == selectedPointId){
			//already eixisted
			if(unmark_index < markedPointIds.length){
				// only deal with the events trigger from UI
				if(pointId == undefined){
					val.material.color.setStyle("black");
					markedPointIds.splice(unmark_index, 1);
				}
			}
			else //add into marked points
			{
				val.material.color.setStyle("red");
				if(pointId == undefined){
					markedPointIds.push(selectedPointId);
				}
			}
		}
	});

	if(pointId == undefined){
		$(that).toggleClass('selectedPoint');
	}
	else{
		if(unmark_index >= markedPointIds.length){
			$.each($("#pointsPickedInfo div > div"),function(key,val){
				if($(val).find("button").data("id") == pointId){
					$(val).toggleClass('selectedPoint');
				}
			});
		}
	}
}

//deal with the selected points through UI
function updateSelectedPoints(){
	if(selectedPoint == undefined){
		return;
	}

	selectedPointId = selectedPoint.pointId;
	//check if selected before
	var unmark_index = -1;
	while(++unmark_index < markedPointIds.length){
		if(markedPointIds[unmark_index] == selectedPointId) break;
	}
	//if not selected before, push into marked points
	// all color behaveiro already handled while hitting push button
	if(unmark_index >= markedPointIds.length){
		markedPointIds.push(selectedPointId);
		return;
	}

	//if selected before, check moved
	var eps = 0.0000001;
	if(Math.abs(selectedPoint.position.x - org_selectedPoint.x) > eps ||
		Math.abs(selectedPoint.position.y - org_selectedPoint.y) > eps ||
		Math.abs(selectedPoint.position.z - org_selectedPoint.z) > eps)
		return;

	//if selected before and no movement, do unselection
	if(unmark_index < markedPointIds.length){
		$.each(scene.getObjectByName("pointsObj").children, function(key,val){
			if(val.pointId == selectedPointId){
				//already eixisted
				val.material.color.setStyle("black");
				markedPointIds.splice(unmark_index, 1);
			}
		});

		$.each($("#pointsPickedInfo div > div"),function(key,val){
			if($(val).find("button").data("id") == selectedPointId){
				$(val).toggleClass('selectedPoint');
				return false;
			}
		});
	}
}

function delPoint(that,pointId){
	var pointsObj = scene.getObjectByName("pointsObj");
	if(pointId == undefined){
		$.each(pointsObj.children, function(key,val){
			if(val.pointId == $(that).data('id')){
				pointsObj.remove(val);
				return false;
			}
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
		$.each(pointsObj.children, function(key,val){
			if(val.pointId == pointId){
				pointsObj.remove(val);
				return false;
			}
		});
		$.each($("#pointsPickedInfo div > div"),function(key,val){
			if($(val).find("button").data("id") == pointId){
				$(val).remove();
				return false;
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
	//pointsPickedCounter = pointsObj.children.length -1;
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
	var pointsObj = scene.getObjectByName("pointsObj");
	$.each(pointsPicked, function(i){
		$.each(pointsObj.children, function(key, val){
			if(val.pointId == pointsPicked[i].pointId){
		    	pointsObj.remove(val);
		    	return false;
			}
		});
	});

	pointsPickedCounter = -1;
	pointsPicked = [];
	markedPointIds = [];
}


// rendering scales
function createScale(){
	// var padding = 30;
	var axisScale = d3.scale.linear().domain([0,1]).range([0,280]);
	// var yAxis = d3.svg.axis().scale(axisScale).orient("left");
	// var svgContainer = d3.select("#tpHueHelp").insert("svg:svg");
	// svgContainer.append("g").attr("class", "axis").attr("transform", "translate(" + padding + ",0)").call(yAxis);
	var xAxis = d3.svg.axis().scale(axisScale);
	var svgContainer = d3.select("#tpHueHelp").append("svg:svg").attr("width", 300).attr("height", 20);
	var xAxisGroup = svgContainer.append("g").call(xAxis);
	$("#tpHueHelp svg").css("margin-top","1px");
}

createScale();
