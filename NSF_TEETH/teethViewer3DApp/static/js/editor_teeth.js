var rotationState = "enabled";
var getPointValMode = "disabled";
var angleBtnMode = "disabled";
var pointsPicked = [];
var pointsPickedCounter = -1;
var polyCounter = -1;
var polyPointsPicked = [];
var polyPointsPickedCounter = -1;
var selectedPoint;
var selectedLine = [];
var selectedLineVertexIndex = [];
var org_selectedPoint;
var lastSelected;
var markedPointIds = [];
var hoverPoint;
var shiftKeyPressed = false;

// default rotation control is on, set cursor
$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');


$('#rotationControl').click(
	enableRotationMode
);

$("#anglebtn").click(
	enableAngleMode
);

function enableAngleMode(){
	rotationState = "disabled";
	angleBtnMode = "enabled";
	$("#polyPointsPickedInfo").show();
	$("#pointPickerDiv").show();
	$("#rotationControl span:first").addClass("icon-disabled");
	$("#anglebtn span:first").removeClass("icon-disabled");
	cameraControls.noRotate = true;
	cameraControls.noPan = true;
	$('html,body').css('cursor','default');
	// hideObject("pointsObj");
	//showObject("angleObj");
	// getPointValMode = "disabled";
	// $("#pointsPickedInfo").hide();
	//$("#polyPointsPickedInfo3D").show();
}

function enableRotationMode(){
	rotationState = "enabled";
	angleBtnMode = "disabled";
	$("#polyPointsPickedInfo").hide();
	$("#pointPickerDiv").hide();
	$("#rotationControl span:first").removeClass("icon-disabled");
	$("#anglebtn span:first").addClass("icon-disabled");
	cameraControls.noRotate = false;
	cameraControls.noPan = false;
	$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');
	//$("#polyPointsPickedInfo3D").hide();
	//hideObject("angleObj");
	// showObject("pointsObj");
}

function toggleRotationAngleMode(){
	if(rotationState == "enabled"){
		enableAngleMode();
	}
	else if(rotationState == "disabled"){
		enableRotationMode();
	}
}


function onContainerDBLClick(event){
	if(angleBtnMode == "enabled"){
		//console.log("close area");
		var intersects = getRayCastIntersects(event.clientX, event.clientY);
		if (intersects.length < 1) return;
		result = getIntersectInfo(intersects);
		var pointId = result.pointId;

		if(pointId == undefined) return;
		else if(pointId == polyPointsPickedCounter &&
		        polyPointsPickedCounter > 1)
		{
			closePolygon();
		}
	}
}

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



$("#polyPoints2DCheck").change(function(){
	//$("#polyPoints3DCheck").prop("checked", !$("#polyPoints3DCheck").prop("checked"));
	//toggle2DInfo(this.checked);
	if(this.checked)
		show2DInfo(false, false);
	else
		hide2DInfo();
});

$("#polyPoints3DCheck").change(function(){
	//$("#polyPoints2DCheck").prop("checked", !$("#polyPoints2DCheck").prop("checked"));
	toggle2DInfo();
});

function toggle2DInfo(checked){
	// console.log(state);

	var angleObj = scene.getObjectByName("angleObj");
	$.each(angleObj.children, function(index,val){
		// toggle 2D info visibility
		var infoDivClass = "." + val.name;
		$.each($(infoDivClass),function(i,v){
			$(v).toggle(checked);
		});
	});
}

function hide2DInfo(){
	var angleObj = scene.getObjectByName("angleObj");
	$.each(angleObj.children, function(index,val){
		// toggle 2D info visibility
		var infoDivClass = "." + val.name;
		$.each($(infoDivClass),function(i,v){
			$(v).hide();
		});
	});

}



document.addEventListener('mousedown', onContainerMouseDown, false );
// document.addEventListener('dblclick', onContainerDBLClick, false);
//$("#teethContainer").mousedown(onContainerMouseDown);
$("#teethContainer").dblclick(onContainerDBLClick);
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
//#("teethContainer").mousewheel
document.body.addEventListener('mousewheel', mousewheel, false );
document.body.addEventListener('DOMMouseScroll', mousewheel, false ); // firefox

function mousewheel(e){
	//check camera quat update here
	updatePointSize(false, true);
	hide2DInfo();
	$("#pointPickerDiv").hide();
	clearTimeout($.data(this, 'timer'));
	//show info
	if(!$("#polyPoints2DCheck").is(':checked')){
		return;
	}
  	$.data(this, 'timer', setTimeout(function() {
  		if(angleBtnMode == "enabled"){
  			$("#pointPickerDiv").show();
  			onDocumentMouseMove(e);
  		}
  		var obj = scene.getObjectByName("angleObj");
  		if(obj.visible)
			show2DInfo(false, false);
  	}, 250));
}





// event listener that gets x,y,z on mouse hover
function onDocumentMouseMove( event ){
	event.preventDefault();
	event.stopPropagation();


	if(outCanvas(event.clientX, event.clientY)){
		//$("#polyPointsPickedInfo").hide();
		// console.log("hide point picker");
		// $("#pointPickerDiv").hide();
		return;
	}

	// if(getPointValMode == "enabled"){
	// 	//selected point, ray cast
	// 	var intersects = getRayCastIntersects(event.clientX, event.clientY);
	// 	var intersect_Id = getIntersectId(intersects);
	// 	//console.log(intersect_Id);

	// 	if(intersect_Id > -1){
	// 		//copy the moved position to the the selected objec
	// 		if(selectedPoint){
	// 			selectedPoint.position.copy(intersects[intersect_Id].point);
	// 			//make the point selected
	// 		}
	// 	}
	// 	//console.log("Move button: ", event.button || event.which);
	// 	updateHoverStatus(intersects, intersect_Id, event);
	// }else{
	// 	$("#pointPickerDiv").hide();
	// }

	if(angleBtnMode == "enabled"){
		//selected point, ray cast
		var intersects = getRayCastIntersects(event.clientX, event.clientY);
		var result = getIntersectInfo(intersects);

		if (selectedPoint)
		{
			
			var intersect_Id = result.intersect_Id;


			//console.log(intersect_Id);
			if(intersect_Id > -1){
				//console.log(intersects[intersect_Id].point);
				//copy the moved position to the the selected objec
				selectedPoint.position.copy(intersects[intersect_Id].point);
				$.each(selectedLine,function(index,val){
					var selectedIndex = selectedLineVertexIndex[index];
					val.geometry.verticesNeedUpdate = true;
					val.geometry.vertices[selectedIndex].copy(intersects[intersect_Id].point);
				});
			}
			//console.log("Move button: ", event.button || event.which);
		}
		//TODO: combine it
		updateHoverStatus(intersects, result, event);
	}
}

// get the intersect id
// if no intersection, return -1, others return the point hit on the teeth surface
// TODO: fix this for mouse moving
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

function getIntersectInfo(intersects){
	if(intersects.length == 0) return -1;
	var intersect_Id = -1;
	var pointId = -1;
	var p_intersect_Id = -1;
	$.each(intersects, function(key, val){
		if(val.object.type == "Mesh"){
			if(val.object.pointId == undefined){
					intersect_Id = key;
					return false;
			}
			else if( val.object.pointId != undefined){
				pointId = val.object.pointId;
				p_intersect_Id = key;
			}
		}

	});
	//console.log(intersect_Id);
	return { pointId: pointId,
			 p_intersect_Id: p_intersect_Id,
		     intersect_Id:intersect_Id}

}
// event listener for mouse up event
function onDocumentMouseUp( event ){
	if($("#polyPoints2DCheck").is(':checked'))
		show2DInfo(false, true);
	if(rotationState == "enabled"){
		$('html,body').css('cursor','url("/static/css/images/webgl/rotation.png"), auto');
		return;
	}

	if(angleBtnMode == "enabled"){
		//TODO
		if(selectedPoint){
			intersects_Id = -1;
			//check if inside canvas
			if(!outCanvas(event.clientX, event.clientY)){
				var pointId = selectedPoint.pointId;
				var intersects = getRayCastIntersects(event.clientX, event.clientY);
				//intersect_Id = getIntersectId(intersects);
				var result = getIntersectInfo(intersects);
				var intersect_Id = result.intersect_Id;
				var pointId = result.pointId;
			}
			if(intersect_Id > -1 && polyPointsPickedCounter == -1){
				//console.log('polyPointsPickedCounter', polyPointsPickedCounter);
				var polyId = selectedPoint.parent.name.replace("polyObj","");
				updatePolyOnUI(selectedPoint, intersects, result, polyId);
			}
			else{
				//updateSelectedPoints();
				selectedPoint.position.copy(org_selectedPoint);
				$.each(selectedLine,function(index,val){
					var selectedIndex = selectedLineVertexIndex[index];
					val.geometry.verticesNeedUpdate = true;
					val.geometry.vertices[selectedIndex].copy(org_selectedPoint);
				});
			}
			//change selected point color
			updateSelectedPoints();
			selectedPoint = null;
		}
		$('html,body').css('cursor','auto');
		return;
	}
	// if(getPointValMode == "enabled"){
	// 	if(selectedPoint){
	// 		intersects_Id = -1;
	// 		//check if inside canvas
	// 		if(!outCanvas(event.clientX, event.clientY)){
	// 			var pointId = selectedPoint.pointId;
	// 			var intersects = getRayCastIntersects(event.clientX, event.clientY);
	// 			intersect_Id = getIntersectId(intersects);
	// 		}
	// 		if(intersect_Id > -1){
	// 			var mCurvature = getMeanCurvature(intersects, intersect_Id);
	// 			$.each($("#pointsPickedInfo div > div"),function(key,val){
	// 				if($(val).find("button").data("id") == pointId){
	// 					if(!isNaN(mCurvature)){
	// 						updatePointsOnUI($(val), selectedPoint, pointId, mCurvature);
	// 					} else {
	// 						updatePointsOnUI($(val), selectedPoint, pointId);
	// 					}
	// 				}
	// 			});

	// 		}
	// 		else{
	// 			//updateSelectedPoints();
	// 			selectedPoint.position.copy(org_selectedPoint);
	// 		}
	// 		//change selected point color
	// 		updateSelectedPoints();
	// 		selectedPoint = null;
	// 	}
	// 	$('html,body').css('cursor','auto');
	// 	return;
	// }

}

// event listener that handles point picking using raycaster
function onContainerMouseDown( event ) {
	// cannot focus on input types because this event prohibits it, override the event
	if(event.toElement.type == "text")
		return true;
	// remove focus from all input types
	$("input[type=text]").blur();
	event.preventDefault();
	event.stopPropagation();
	if(outCanvas(event.clientX, event.clientY)){
		//$("#pointPickerDiv").hide();
		return;
	}
	hide2DInfo();
	if(rotationState == "enabled"){
		$('html,body').css('cursor','url("/static/css/images/webgl/handpress.png"), auto');
	}

	if(angleBtnMode == "enabled"){
		// if(!cameraControls.noRotate){
		// 	hide2DInfo();
		// }

		//check clientX, clientY inside polygon
		if(isInPolygons(event.clientX, event.clientY)) return;

		var intersects = getRayCastIntersects(event.clientX, event.clientY);
		if (intersects.length < 1) return;
		result = getIntersectInfo(intersects);
		var pointId = result.pointId;
		var intersect_Id = result.intersect_Id;


		//add point onto scene
		if(pointId == -1){
			if( (event.button || event.which) === 1){
				addPoint("angleBtnMode",intersects, intersect_Id);
			}
		}
		// else if(pointId == polyPointsPicked[polyCounter][1].pointId){
		// 	if(polyPointsPickedCounter > 1){
		// 		var poly = polyPointsPicked[polyCounter];
		// 		// calculateAngle(
		// 		// 	poly[polyPointsPickedCounter-1].coordinates,
		// 		// 	poly[polyPointsPickedCounter].coordinates,
		// 		// 	poly[polyPointsPickedCounter+1].coordinates);
		// 		closePolygon();
		// 		return;
		// 	}
		// }
		else{			
			if( (event.button || event.which) === 1){						
				selectedPoint = intersects[result.p_intersect_Id].object;				
				if(org_selectedPoint == undefined){
					org_selectedPoint = new THREE.Vector3();
				}
				org_selectedPoint.copy(selectedPoint.position);								
				var pointParent = selectedPoint.parent;
				selectedLine = [];
				selectedLineVertexIndex = [];
				pointParent.traverse( function(child) {
					if(child instanceof THREE.Line){						
						// child is a line																		
						$.each(child.geometry.vertices,function(index,val){
							if(selectedPoint.position.equals(val)){
								selectedLine.push(child);
								selectedLineVertexIndex.push(index);
							}
						});
					}
				});				
				$('html,body').css('cursor','move');
				// pass in a dummy first parameter
				// selectRow("that", pointId);
			}
			return;
		}

		// add line
		var poly = polyPointsPicked[polyCounter];
		if(polyPointsPickedCounter > 0){
			drawLineBetweenPoints(
				poly[polyPointsPickedCounter],
				poly[polyPointsPickedCounter+1]);
		}
	}

	// if(getPointValMode == "enabled"){
	// 	var intersects = getRayCastIntersects(event.clientX, event.clientY);
	// 	//return if nothing
	// 	if (intersects.length < 1) return;
	// 	var top_id = 0;
	// 	var pointId = intersects[top_id].object.pointId;
	// 	//add point onto scene
	// 	if(pointId == undefined){
	// 		if( (event.button || event.which) === 1){
	// 			addPoint("getPointValMode",intersects, top_id);
	// 		}
	// 	}
	// 	//move or delete point
	// 	else{
	// 		if( (event.button || event.which) === 1){
	// 			selectedPoint = intersects[top_id].object;
	// 			if(org_selectedPoint == undefined){
	// 				org_selectedPoint = new THREE.Vector3();
	// 			}
	// 			org_selectedPoint.copy(selectedPoint.position);
	// 			$('html,body').css('cursor','move');
	// 			// pass in a dummy first parameter
	// 			selectRow("that", pointId);
	// 		}
	// 		if(event.button === 2){
	// 			// pass in a dummy first parameter
	// 			delPoint("that",pointId);
	// 		}
	// 	}
	// }
}

//TODO : check isInPolygons
function isInPolygons(x, y){
	var isInside =false;
	return isInside;

	//http://alienryderflex.com/polygon/
}

function closePolygon(){
	drawLineBetweenPoints(
		polyPointsPicked[polyCounter][polyPointsPickedCounter+1],
		polyPointsPicked[polyCounter][1]);
	var result = calculatePolyInfo(polyCounter);
	var area = result.area;
	var center = result.center;
	var angles = result.angles;
	var angleInfo_pos = result.angleInfo_pos;
	var distance2D = result.distance2D;
	polyInfo.push({polyId: polyCounter, center: center, angleInfo_pos: angleInfo_pos});

	render2DText(polyCounter, "area", center, parseFloat(area).toFixed(2).toString());
	$.each(angleInfo_pos, function(index, val){
		render2DText(polyCounter, "v"+ index, val, parseFloat(angles[index]).toFixed(2).toString() + "&deg;");
	});

	// 2D Info Update
	$("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span> Area : " + parseFloat(area).toFixed(3) +
				"</span></div>");
	anglesStr = " ";
	var count = 1;
	$.each(angles, function(index, val){
		anglesStr += parseInt(count) + "): " +
					 parseFloat(val).toFixed(3) + ", ";
		count++;
	});

	$("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span> Angles : " + anglesStr +
				"</span></div>");

	var distance2DStr = "";
	count = 1;
	$.each(distance2D, function(index, val){
		distance2DStr += parseInt(count) + "): " +
					 parseFloat(val).toFixed(3) + ", ";
		count++;
	});

	$("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span> 2D Distances : " + distance2DStr +
				"</span></div>");

	polyPointsPickedCounter = -1;

	// 3D Info Update
	// $("#polyPointsPickedInfo3D div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
	// 			"<span> Area : " + parseFloat(area).toFixed(3) +
	// 			"</span></div>");

	// $("#polyPointsPickedInfo3D div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
	// 			"<span> Angles : " + anglesStr +
	// 			"</span></div>");
}


//with specific div
function render2DText(polyId, name, center, msg){
	//console.log('render2DText');
	var text = document.createElement('div');
	text.className = "polyObj" + polyId;
	text.id = name;
	text.style.position = 'absolute';
	if($("#polyPoints2DCheck").prop("checked"))
		text.style.display = 'block';
	else
		text.style.display = 'none';
	var fontsize = parseInt($("body").css('font-size'), 10);
	text.innerHTML = msg;
	var leftOffset = container.offset().left;
    var topOffset = container.offset().top;
    var width = container.width();
    var height = container.height();


    var leftOffset = container.offset().left;
    var topOffset = container.offset().top;
    var width = container.width();
    var height = container.height();
    var fontsize = parseInt($("body").css('font-size'), 10);

	var matrix = getViewProjectionMatrix();
	pos = toXYCoords(center, matrix, width, height, leftOffset, topOffset);

	var num_char = msg.length;

	if(msg.indexOf("&deg;") > -1) num_char -= 4;
	pos.x -= fontsize / 4 * num_char;
	pos.y -= fontsize / 2;
	//console.log(pos);
	text.style.left = pos.x + 'px' ;
	text.style.top = pos.y + 'px';
	document.body.appendChild(text);
}

function toXYCoords (pos, matrix, width, height, leftOffset, topOffset) {
		var vector = new THREE.Vector3().copy(pos);
        vector = vector.applyProjection(matrix);

        vector.x = (vector.x + 1)/2.0 * container.width() + leftOffset;
        vector.y = -(vector.y - 1)/2.0 * container.height() + topOffset;
        return vector;
}

// function onDocumentDBLClick(event){
// 	if(angleBtnMode == "enabled"){
// 		//console.log("close area");
// 		var intersects = getRayCastIntersects(event.clientX, event.clientY);
// 		if (intersects.length < 1) return;
// 		var top_id = 0;
// 		var pointId = intersects[top_id].object.pointId;

// 		if(pointId == undefined) return;
// 		else if(pointId == polyPointsPickedCounter &&
// 		        polyPointsPickedCounter > 1)
// 		{
// 			closePolygon();
// 		}

// 	}
// }

// event listener to handle keyboard (down) events
function onDocumentKeyDown(event){
	if(!shiftKeyPressed && event.shiftKey){
		shiftKeyPressed = true;
		toggleRotationAngleMode();
		return;
	}

	if(event.keyCode == 46 || event.keyCode == 8)
		deleteSelectedPoint();
}

// event listener to handle keyboard (up) events
function onDocumentKeyUp(event){
	if(shiftKeyPressed){
		shiftKeyPressed = false;
		toggleRotationAngleMode();
		// if(rotationState == "enabled" || getPointValMode == "enabled"){
		// 	$("#rotationControl").click();
		// }
		// else if(angleBtnMode == "enabled"){
		// 	cameraControls.noRotate = true;
		// 	cameraControls.noPan = true;
		// 	show2DInfo();
		// }
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

function updateHoverStatus(intersects, result, event){

	if(intersects.length == 0){
		$("#pointPickerDiv").hide();
		clearHoverPoint(hoverPoint);
		return;
	}
	//point should be the first intersect
	var pointId = result.pointId;
	var p_intersect_Id = result.p_intersect_Id;
	var intersect_Id = result.intersect_Id;
	//check if move on a point
	if(pointId != -1){
		if(hoverPoint){
			// check the intersect point is equal to hover point
			if(pointId != hoverPoint.pointId && (event.button || event.which) != 1){
				clearHoverPoint(hoverPoint);
				setHoverPoint(intersects[p_intersect_Id].object);
			}
		}
		// first time, set hover point
		else{
			setHoverPoint(intersects[p_intersect_Id].object);
		}

		//update context
		var polyNumber = hoverPoint.parent.name.replace("polyObj","");
		var uiPolyName = $("#polyTextField"+polyNumber).val();
		$("#pointPickerDiv p").html("<span> Poly : "+ uiPolyName + " Point : " + (hoverPoint.pointId+1) + ""+
									 "<br>x: " + hoverPoint.position.x +
									 "<br>y: " + hoverPoint.position.y +
									 "<br>z: " + hoverPoint.position.z);
		$("#pointPickerDiv").css({top: (event.pageY+5)+"px",left: (event.pageX+5)+"px"}).show();
	}
	else{
		if((event.button || event.which) != 1)
			clearHoverPoint(hoverPoint);
		if(intersect_Id >-1){
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
function addPoint(mode, intersects, index){
	if(index == -1) return;
	var point = intersects[index].point;
	//console.log(intersects);
	//push points on UI
	if(mode == "getPointValMode"){
		var mCurvature = getMeanCurvature(intersects, index);
		pointsPickedCounter++;
		if(!isNaN(mCurvature)){
			pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":point,"mCurvature":mCurvature});
			displayPointsOnUI(mode,point,pointsPickedCounter,mCurvature);
		}else{
			pointsPicked.push({"pointId":pointsPickedCounter,"coordinates":point});
			displayPointsOnUI(mode,point,pointsPickedCounter);
		}
	} else if (mode == "angleBtnMode"){
		var mCurvature = getMeanCurvature(intersects, index);
		if(polyPointsPickedCounter == -1){
			createPoly();
			polyPointsPicked.push([]);
			polyPointsPicked[polyCounter].push({"polyId": polyCounter});
			displayPolyOnUI();
		}
		polyPointsPickedCounter++;
		polyPointsPicked[polyCounter].push(
		    {"pointId":polyPointsPickedCounter,"coordinates":point});
		if(!isNaN(mCurvature)){
			displayPointsOnUI(mode,point,polyPointsPickedCounter, mCurvature);
		} else {
			displayPointsOnUI(mode,point,polyPointsPickedCounter);
		}
	}

	//create point
	var sphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { color: '#000', transparent: true, opacity: 1.0 } );
	var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
	sphere.position.x = point.x;
	sphere.position.y = point.y;
	sphere.position.z = point.z;

    var distance = cameraControls.object.position.distanceTo(cameraControls.target);
	if(distance > 0){
		var scaleUnit = getScaleUnit(false, true);
		var scale = (distance * scaleUnit)* orgPointScale;
		sphere.scale.x = scale;
		sphere.scale.y = scale;
		sphere.scale.z = scale;
	}


	if(mode == "getPointValMode"){
		sphere.pointId = pointsPicked[pointsPicked.length-1].pointId;
		var obj = scene.getObjectByName("pointsObj");
		obj.add(sphere);

	} else if(mode == "angleBtnMode"){
		//create new poly
		sphere.pointId =
			polyPointsPicked[polyCounter][polyPointsPickedCounter+1].pointId;

		var polyObj = scene.getObjectByName("polyObj" + polyCounter);
		//console.log(sphere.position);
		polyObj.add(sphere);
	}

}

function createPoly(){
	//add angle obj
	polyCounter++;
	var polyObj = new THREE.Object3D();
	polyObj.name = "polyObj" + polyCounter;
	var angleObj = scene.getObjectByName("angleObj");
	angleObj.add(polyObj);
}

// draw line between two points
function drawLineBetweenPoints(srcPoint, destPoint){
	// console.log(srcPoint);
	// console.log(destPoint);
	var polyObj = scene.getObjectByName("polyObj"+polyCounter);
	var material = new THREE.LineBasicMaterial({
		color: 0x000000
	});
	material.depthTest = false;
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		srcPoint.coordinates,
		destPoint.coordinates
	);
	var line = new THREE.Line( geometry, material );
	line.dynamic = true;
	polyObj.add( line );
}

function getMeanCurvature(intersects, index){
	var mCurvature = "";
	//console.log(intersects);
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

function displayPolyOnUI(){
	// 2D Info Update
	$("#polyPointsPickedInfo div:first").append(
	  "<div style='padding:5px;border-bottom:solid 1px black;'>"+
	  "<span> Poly ID :</span><input type='text' value='" + polyCounter + "' id='polyTextField" + polyCounter + "'> </div>");	

	// 3D Info Update
	$("#polyPointsPickedInfo3D div:first").append(
	  "<div style='padding:5px;border-bottom:solid 1px black;'>"+
	  "<span> Poly ID : " + polyCounter +
	  "</span></div>");
}

function displayPointsOnUI(mode,point,pointId,mCurvature){
	if(mode == "getPointValMode"){
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
	} else if(mode == "angleBtnMode"){
		if(mCurvature !== undefined){
			// 2D Info Update
			$("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
				" y : "+parseFloat(point.y).toFixed(3)+
				" z : "+parseFloat(point.z).toFixed(3)+
				"<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
				"</span></div>");

			// 3D Info Update
			$("#polyPointsPickedInfo3D div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
				" y : "+parseFloat(point.y).toFixed(3)+
				" z : "+parseFloat(point.z).toFixed(3)+
				"<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
				"</span></div>");
		} else {
			// 2D Info Update
			$("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
				" y : "+parseFloat(point.y).toFixed(3)+
				" z : "+parseFloat(point.z).toFixed(3)+
				"</span></div>");

			// 3D Info Update
			$("#polyPointsPickedInfo3D div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
				"<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
				" y : "+parseFloat(point.y).toFixed(3)+
				" z : "+parseFloat(point.z).toFixed(3)+
				"</span></div>");
		}
	}
}

function updatePolyOnUI(changedPoint, intersects, result, polyId){
	var intersect_Id = result.intersect_Id
	var pointId = result.pointId
	var mCurvature = getMeanCurvature(intersects, intersect_Id);
	var uiPolyName = $("#polyTextField"+polyId).val();
	// var result = calculatePolyInfo(polyCounter);

	// var area = result.area;
	// var center = result.center;
	// var angles = result.angles;
	// var angleInfo_pos = result.angleInfo_pos;
	// var distance2D = result.distance2D;

	// $.each(polyInfo, function(i, val){
	// 	if (val.polyId == polyId){
	// 		console.log(val);
	// 		val.center = center;
	// 		val.angleInfo_pos = angleInfo_pos;
	// 		return false;
	// 	}
	// });
	// polyInfo.push({polyId: polyCounter, center: center, angleInfo_pos: angleInfo_pos});

	// render2DText(polyCounter, "area", center, parseFloat(area).toFixed(2).toString());
	// $.each(angleInfo_pos, function(index, val){
	// 	render2DText(polyCounter, "v"+ index, val, parseFloat(angles[index]).toFixed(2).toString() + "&deg;");
	// });

	// // 2D Info Update
	// $("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
	// 			"<span> Area : " + parseFloat(area).toFixed(3) +
	// 			"</span></div>");
	// anglesStr = " ";
	// var count = 1;
	// $.each(angles, function(index, val){
	// 	anglesStr += parseInt(count) + "): " +
	// 				 parseFloat(val).toFixed(3) + ", ";
	// 	count++;
	// });

	// $("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
	// 			"<span> Angles : " + anglesStr +
	// 			"</span></div>");

	// var distance2DStr = "";
	// count = 1;
	// $.each(distance2D, function(index, val){
	// 	distance2DStr += parseInt(count) + "): " +
	// 				 parseFloat(val).toFixed(3) + ", ";
	// 	count++;
	// });

	// $("#polyPointsPickedInfo div:first").append("<div style='padding:5px;border-bottom:solid 1px black;'>"+
	// 			"<span> 2D Distances : " + distance2DStr +
	// 			"</span></div>");

	// polyPointsPickedCounter = -1;


	$.each($("#polyPointsPickedInfo div > div"),function(key,val){
		if($(val).find("input").val() == uiPolyName){
			// console.log("len", $(".polyObj"+polyNumber).length);
			// var num_vertices = $(".polyObj"+polyNumber).length - 1;
			var item = $("#polyPointsPickedInfo div > div").get(key + 1 + pointId);
			console.log(item.innerHTML);
			updatePointsOnUI(item, changedPoint.position, pointId, mCurvature);
			return false;
		}
	});
}

function updatePointsOnUI(item, point, pointId, mCurvature){
	//TODO add delete poly
	if(mCurvature !== undefined){
		item.innerHTML = "<span>" + (pointId+1) + ") x : "+parseFloat(point.x).toFixed(3)+
				   " y : "+parseFloat(point.y).toFixed(3)+
				   " z :"+parseFloat(point.z).toFixed(3)+
				   "<br>mean curvature : "+parseFloat(mCurvature).toFixed(3)+
				   "</span>";
				   // <button style='float:right' data-id="+pointId+
				   // " onclick='delPoint(this);'>Del</button>";
	}
	else{
		item.innerHTML = "<span>" + (pointId+1) + ") x : "+parseFloat(point.position.x).toFixed(3)+
			" y : "+parseFloat(point.position.y).toFixed(3)+
			" z :"+parseFloat(point.position.z).toFixed(3)+
			"</span>";
			// <button style='float:right' data-id="+pointId+
			// " onclick='delPoint(this);'>Del</button>";

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

function exportPointsToCSV(that){
	var tempArr = $(that).parent().find("div").map(function(){
					if($(this).children("input").attr("type") == "text")
						return "Poly ID : " + $(this).children("input").val();
					else
						return $(this).text();
				  }).get(); // ignore the very first value in this array	
	var exportArray = [];
	var csvContent = "";
	$.each(tempArr, function(index,val){
		if(index == 0){
			return;
		}
		if(val.indexOf("Poly") > -1){			
			csvContent += $.trim(val) + "\n";
		} else if(val.indexOf("Area") > -1){
			csvContent += $.trim(val) + "\n";
		} else if(val.indexOf("Angles") > -1){
			csvContent += "Angles" + "\n";
			var values = val.split(":");
			$.each(values, function(i,v){
				if(v.indexOf(",") > 1){
					csvContent += $.trim(v.split(",")[0]) + ",";
				}
			});
			csvContent = csvContent.slice(0,-1);
			csvContent += "\n";
		} else if(val.indexOf("2D Distances") > -1){
			csvContent += "2D Distances" + "\n";
			var values = val.split(":");
			$.each(values, function(i,v){
				if(v.indexOf(",") > 1){
					csvContent += $.trim(v.split(",")[0]) + ",";
				}
			});
			csvContent = csvContent.slice(0,-1);
			csvContent += "\n";
		} else {
			// points
			var values = val.split(":");
			$.each(values, function(i,v){
				if( i == 0)
					return;
				csvContent += $.trim(v.replace(/[A-Za-z]/g,'')) + ",";
				if(v.indexOf("curvature") > -1){
					csvContent += "mean curvature: ";
				}
			});
			csvContent = csvContent.slice(0,-1);
			csvContent += "\n";
		}
	});
	// console.log(csvContent);

	// OLD CODE SNIPPET
	// $.each(pointsPicked,function(index,val){
	// 	var pointVal = [];
	// 	if(val.hasOwnProperty('mCurvature')){
	// 		curvatureExport = true;
	// 	}
	// 	pointVal.push(val.coordinates.x);
	// 	pointVal.push(val.coordinates.y);
	// 	pointVal.push(val.coordinates.z);
	// 	if(curvatureExport){
	// 		pointVal.push(val.mCurvature);
	// 	}
	// 	exportArray.push(pointVal);
	// });
	// var csvContent;
	// if(curvatureExport){
	// 	csvContent = 'X,Y,Z,mCurvature' + "\n";
	// }else{
	// 	csvContent = 'X,Y,Z' + "\n";
	// }

	// exportArray.forEach(function(pointElements, index){
	// 	dataString = pointElements.join(",");
	// 	csvContent += dataString+ "\n";
	// });
	// OLD CODE SNIPPET ENDS


	var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
	saveAs(blob, "dataExport.csv");
}

function deleteAllPoints(that){
	// following code is for point picker mode
	// $("#pointsPickedInfo div").children().remove();
	// var pointsObj = scene.getObjectByName("pointsObj");
	// $.each(pointsPicked, function(i){
	// 	$.each(pointsObj.children, function(key, val){
	// 		if(val.pointId == pointsPicked[i].pointId){
	// 	    	pointsObj.remove(val);
	// 	    	return false;
	// 		}
	// 	});
	// });

	// pointsPickedCounter = -1;
	// pointsPicked = [];
	// markedPointIds = [];
	if($(that).parent().attr("id") == "polyPointsPickedInfo" || $(that).parent().attr("id") == "polyPointsPickedInfo3D"){
		$("#polyPointsPickedInfo div").children().remove();
		$("#polyPointsPickedInfo3D div").children().remove();
		var angleObj = scene.getObjectByName("angleObj");
		var toremove = [];
		$.each(angleObj.children, function(index,val){
			toremove.push(val.name);
			// delete info divs if any
			var infoDivClass = "." + val.name;
			$.each($(infoDivClass),function(i,v){
				$(v).remove();
			});
		});
		$.each(toremove,function(index,val){
			var objToRemove = scene.getObjectByName(val);
			angleObj.remove(objToRemove);
		});
		polyPointsPicked = [];
		polyInfo = [];
		polyPointsPickedCounter = -1;
		polyCounter = -1;
	}
}

function hideObject(objName){
	var obj = scene.getObjectByName(objName);
	obj.visible = false;
	//hide poly info
	if(objName == 'angleObj')
		updatePolyInfo('none');
}

function showObject(objName){
	var obj = scene.getObjectByName(objName);
	obj.visible = true;
	//show polyinfo
	if(objName == 'angleObj')
		updatePolyInfo('block');
}

function calculatePolyInfo(polyId){

	var xProd = 0;
	var yProd = 0;
	var poly = polyPointsPicked[polyId]
	var angles = [];
	var angleInfo_pos = [];
	var center = new THREE.Vector3();
	var poly = polyPointsPicked[polyId];
	var distance2D = [];

	$.each(poly,function(index,val){
		// the first index is poly ID
		if(index == 0) return;
		center.x += val.coordinates.x;
		center.y += val.coordinates.y;
		center.z += val.coordinates.z;

		//polyPointsPickedCounter + 1 is the last index
		var prevIndex = index == 1 ? polyPointsPickedCounter + 1 : index -1;
		var nextIndex = index == polyPointsPickedCounter + 1 ? 1 : index + 1;

		//area
		xProd = xProd +
					(poly[index].coordinates.x * poly[nextIndex].coordinates.y);
		yProd = yProd +
					(poly[index].coordinates.y * poly[nextIndex].coordinates.x);
		//angle
		var result =
			calculateAngle(poly[prevIndex].coordinates,
			               poly[index].coordinates,
			               poly[nextIndex].coordinates);
		angles.push(result.theta);
		angleInfo_pos.push(result.lerp);

		//2D distance
		var result = calculate2DDistance(poly[prevIndex].coordinates,
										 poly[index].coordinates);
		distance2D.push(result);
	});

	center.x /= (polyPointsPickedCounter + 1);
	center.y /= (polyPointsPickedCounter + 1);
	center.z /= (polyPointsPickedCounter + 1);

	var area = Math.abs((xProd-yProd)/2);

	return { area: area,
			 center: center,
			 angles: angles,
			 angleInfo_pos: angleInfo_pos,
			 distance2D: distance2D
	        };

}

function calculateAngle(p1,p2,p3){
	// console.log(v1 + " " + v2 + " " + v3);

	var v1 = new THREE.Vector3();
	v1.copy(p1).sub(p2);
	var v2 = new THREE.Vector3();
	v2.copy(p3).sub(p2);
	var theta = v1.angleTo(v2) * 180.0 / Math.PI;

	var lerp = new THREE.Vector3();
	v1.multiplyScalar(-1.0);
	v2.multiplyScalar(-1.0);
	lerp.subVectors(v2, v1).multiplyScalar(0.5).add(v1).normalize();
	var scaleUnit = getScaleUnit(false, false);
	if(distance < 0 ) return;
	var distance = cameraControls.object.position.distanceTo(cameraControls.target);
	var scale = (distance * scaleUnit)* lerp.length() * 3.0;
	lerp.x *= scale;
	lerp.y *= scale;
	lerp.add(p2);


	return {theta: theta,
			lerp: lerp};
}

function calculate2DDistance(p1,p2){
	var x = p2.x - p1.x;
	var y = p2.y - p1.y;
	var distance = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
	return distance
}


// rendering scales
function createScale(){

	var w = 500;
	var h = 310;
	var padding = 30;

	//Create SVG element
	var svg = d3.select("#tpScale")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	var yScale = d3.scale.linear()
								 .domain([1, 0])
								 .range([h - padding, padding]);

	//Define Y axis
	var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(10);


	//Create Y axis
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + padding + ",0)")
	    .call(yAxis);


	// var padding = 100;
	// var axisScale = d3.scale.linear().domain([0,1]).range([0,140]);
	// var yAxis = d3.svg.axis().scale(axisScale).orient("left");
	// var svgContainer = d3.select("#tpScale").insert("svg:svg");
	// svgContainer.append("g").attr("class", "axis").attr("transform", "translate(" + padding + ",0)").call(yAxis);

	// var xAxis = d3.svg.axis().scale(axisScale);
	// var svgContainer = d3.select("#tpScale").append("svg:svg").attr("width", 300).attr("height", 20);
	// var xAxisGroup = svgContainer.append("g").call(xAxis);

	// $("#tpScale svg").css("padding-top","10px");
	// $("#tpScale svg").css("height","500px");
}

createScale();
