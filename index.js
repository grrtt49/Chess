/*
TODO:
pieces taken
record same dont replace
Castling check
pins
save king from check
check with king
check by taking
Checkmate
En Passant 
Pawn Promotion other than queen
*/
var deleteLast = false;
var currentRecordNum = 0;
var moveNum = 1;
var turn = "w";
var record = [];
var castle = [true, true, true, true]; //Queenside white, kingside white, queenside black, kingside black
function getFEN() {
	var fen = "";
	var blankCount = 0;
	count = 0;
	$(".board div").each(function(){
		var src = $(this).children("img").attr("src");
		if(src === undefined) {
			blankCount++;
		} else {
			if(blankCount > 0)
				fen += blankCount;
			blankCount = 0;
			fen += (src.charAt(7) == "w") ? src.charAt(8).toUpperCase() : src.charAt(8);
		}
		count++;
		if(count%8 === 0) {
			if(blankCount > 0)
				fen += blankCount;
			blankCount = 0;
			fen += "/";
		}
	});
	return fen.substring(0, fen.length-1) + " " + turn;
}
function setFromFEN(fen) {
	$(".board div").html("");
	var pos = "a8";
	for(var x=0; x<fen.indexOf(" "); x++) {
		if(fen.charAt(x) == "P") {
			$("." + pos).append("<img src='images/wpawn.png'/>");
		} else if(fen.charAt(x) == "R") {
			$("." + pos).append("<img src='images/wrook.png'/>");
		} else if(fen.charAt(x) == "N") {
			$("." + pos).append("<img src='images/wnight.png'/>");
		} else if(fen.charAt(x) == "B") {
			$("." + pos).append("<img src='images/wbishop.png'/>");
		} else if(fen.charAt(x) == "Q") {
			$("." + pos).append("<img src='images/wqueen.png'/>");
		} else if(fen.charAt(x) == "K") {
			$("." + pos).append("<img src='images/wking.png'/>");
		}
		
		if(fen.charAt(x) == "p") {
			$("." + pos).append("<img src='images/bpawn.png'/>");
		} else if(fen.charAt(x) == "r") {
			$("." + pos).append("<img src='images/brook.png'/>");
		} else if(fen.charAt(x) == "n") {
			$("." + pos).append("<img src='images/bnight.png'/>");
		} else if(fen.charAt(x) == "b") {
			$("." + pos).append("<img src='images/bbishop.png'/>");
		} else if(fen.charAt(x) == "q") {
			$("." + pos).append("<img src='images/bqueen.png'/>");
		} else if(fen.charAt(x) == "k") {
			$("." + pos).append("<img src='images/bking.png'/>");
		}
		
		if(!isNaN(fen.charAt(x))) {
			pos = addX(pos, parseInt(fen.charAt(x)));
			continue;
		}
		
		if(fen.charAt(x) == "/") {
			pos = addY("a" + pos.charAt(1), -1);
			continue;
		}
		pos = addX(pos, 1);
	} 
	turn = fen.charAt(fen.indexOf(" ") + 1);
}
function addRecord(src, pos, prevPos, capt="") {
	if(deleteLast) {
		record.splice(currentRecordNum-1, record.length-currentRecordNum+1);
		deleteLast = false;
	}
	$(".record").html("");
	var p = src.charAt(8).toUpperCase();
	record.push({prevPosition: prevPos, color: src.charAt(7), piece: ((p != "P") ? p : ""), position: pos, captured: capt, fen: getFEN()});
	for(var newest=0; newest<record.length; newest++) {
		if(record[newest].piece === "" && record[newest].captured == "x")
			$(".record").append("<div class='record"+ newest +"'>" + ((newest%2===0) ? (newest/2+1)+"." : "") + record[newest].prevPosition.charAt(0) + record[newest].captured + record[newest].position + " </div>");
		else
			$(".record").append("<div class='record"+ newest +"'>" + ((newest%2===0) ? (newest/2+1)+"." : "") + record[newest].piece + record[newest].captured + record[newest].position + " </div>");
	}
	$(".record div").removeClass("highlight-record");
	$(".record div:last-child").addClass("highlight-record");
	moveNum += (record[record.length-1].color == "w") ? 1 : 0;
}
function resetDrag() {
	$(".board img").draggable({
		containment: $(".board"),
		revert: true,
		zIndex: 5000,
	});
}
function getChar(num) {
	if(num < 0)
		return "z";
	return String.fromCharCode(97 + num);
}
function addX(pos, add) {
	newStr = getChar(pos.charCodeAt(0)-97+add) + pos.substring(1);
	return newStr;
}
function addY(pos, add) {
	newStr = pos.charAt(0) + (parseInt(pos.charAt(1))+add);
	return newStr;
}
function colorPiece(pos) {
	if($("." + pos + " img").attr("src") !== undefined)
		return $("." + pos + " img").attr("src").charAt(7);
	return " ";
}
function removeIllegal(srcColor, legals) {
	for(var x=0; x<legals.length; x++) {
		if(colorPiece(legals[x]) == srcColor) {
			legals.splice(x, 1);
			x--;
		}
	}
	return legals;
}
function removeCheckIllegals(color, legals) {
	var illegals = findCheck(color);
	for(var x=0; x<legals.length; x++) {
		if(illegals.includes(legals[x])) {
			legals.splice(x,1);
			x--;
		}
	}
	return legals;
}
function getDiagLegals(src, pos) {
	var multipliers = [[1,1], [1,-1], [-1,1], [-1,-1]];
		legals = [];
		for(var m=0; m<4; m++) {
			for(var i=1; i<8; i++) {
				var check = addY(addX(pos,i*multipliers[m][0]),i*multipliers[m][1]);
				if(colorPiece(check) != " ") {
					if(colorPiece(check) != src.charAt(7))
						legals.push(check);
					break;
				}
				legals.push(check);
			}
		}
		return legals;
}
function getCrossLegals(src, pos) {
	var multipliers = [[1,0], [-1,0], [0,1], [0,-1]];
		legals = [];
		for(var m=0; m<4; m++) {
			for(var i=1; i<8; i++) {
				var check = addY(addX(pos,i*multipliers[m][0]),i*multipliers[m][1]);
				if(colorPiece(check) != " ") {
					if(colorPiece(check) != src.charAt(7))
						legals.push(check);
					break;
				}
				legals.push(check);
			}
		}
		return legals;
}
function castleLegals(src, pos) {
	var legals = [];
	var index = (src.charAt(7) == "w") ? 0 : 2;
	var row = (src.charAt(7) == "w") ? 1 : 8;
	if(castle[index] && colorPiece("b" + row) == " " && colorPiece("c" + row) == " " && colorPiece("d" + row) == " ") {
		legals.push(addX(pos, -2));
	}
	if(castle[index+1] && colorPiece("f" + row) == " " && colorPiece("g" + row) == " ") {
		legals.push(addX(pos, 2));
	}
	return legals;
}
function checkLegal(src, pos) {
	var piece = src.charAt(8);
	var legals = [];
	if(piece == 'k') {
		legals = removeCheckIllegals(src.charAt(7), removeIllegal(src.charAt(7), [addX(pos, 1), addX(pos, -1), addY(pos, 1), addY(pos, -1), addX(addY(pos, 1), 1), addX(addY(pos, -1), 1), addX(addY(pos, 1), -1), addX(addY(pos, -1), -1)]));
		legals = legals.concat(castleLegals(src, pos));
		return legals;
	} else if(piece == 'p') {
		var legals = [];
		var direction = (src.charAt(7) == "w") ? 1 : -1;
		var diagonals = [addY(addX(pos, 1), 1*direction), addY(addX(pos, -1), 1*direction)];
		for(var x=0; x<diagonals.length; x++) {
			if(colorPiece(diagonals[x]) != src.charAt(7) && colorPiece(diagonals[x]) != " ") 
				legals.push(diagonals[x]);
		}
		var forwardMoves = [addY(pos, 1*direction)];
		if((pos.charAt(1) == '2' || pos.charAt(1) == '7') && colorPiece(addY(pos, 1*direction)) == " ") 
			forwardMoves.push(addY(pos, 2*direction));
		for(var x=0; x<forwardMoves.length; x++) {
			if(colorPiece(forwardMoves[x]) != src.charAt(7) && colorPiece(forwardMoves[x]) != " ") {
				forwardMoves.splice(x, 1);
				x--;
			}
		}
		return legals.concat(removeIllegal(src.charAt(7), forwardMoves));
	
	} else if(piece == 'n') {
		return removeIllegal(src.charAt(7), [addX(addY(pos,2),1), addX(addY(pos,2),-1), addX(addY(pos,1),2), addX(addY(pos,1),-2), addX(addY(pos,-1),2), addX(addY(pos,-1),-2), addX(addY(pos,-2),1), addX(addY(pos,-2),-1)]);
	
	} else if(piece == 'b') {
		return getDiagLegals(src, pos);
	
	} else if(piece == 'r') {
		return getCrossLegals(src, pos);
	
	} else if(piece == 'q') {
		return getCrossLegals(src, pos).concat(getDiagLegals(src, pos));
	}
}
function findKing(color) {
	var k = "KING NOT FOUND";
	$(".board div").each(function(){
		var src = $(this).children("img").attr("src");
		if(src !== undefined) {
			if(src.substring(7,9) == color + "k") {
				k = $(this).attr("class").substring(8,10);
			}
		}
	});
	return k;
}
function findCheck(color) {
	var illegals = [];
	$(".board div").each(function(){
		var enemy = $(this).children("img").attr("src");
		if(enemy !== undefined) {
			if(enemy.charAt(7) != color && enemy.charAt(8) != "k") {
				enemy = enemy.substring(0, 7) + color + enemy.substring(8);
				illegals = illegals.concat(checkLegal(enemy, $(this).attr("class").substring(8,10)));
			}
		}
	});
	return illegals;
}
function setBoard() {
	setFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w");
}
function dropper(e, ui) {
	$(".board div").removeClass("selected1");
	$(".board div").removeClass("selected2");
	var piece = ui.draggable.attr("src");
	var thisPos = ui.draggable.parent().attr("class").substring(8,10);
	if(piece.charAt(7) == turn) {
		var legals = checkLegal(piece, thisPos);
		if(legals.includes(this.className.substring(8,10))) {
			if(piece.charAt(8) == "r") {
				var index = 0;
				if(piece.charAt(7) == "b")
					index += 2;
				if(thisPos.charAt(0) == "h")
					index += 1;
				castle[index] = false;
			}
			if(piece.charAt(8) == "k") {
				var row = (piece.charAt(7) == "w") ? 1 : 8;
				if(this.className.substring(8,10) == addX(thisPos, -2)) {
					$(".a" + row).html("");
					$(".d" + row).append("<img src='images/" + turn + "rook.png'/>");
				}
				if(this.className.substring(8,10) == addX(thisPos, 2)) {
					$(".h" + row).html("");
					$(".f" + row).append("<img src='images/" + turn + "rook.png'/>");
				}
				if(piece.charAt(7) == "w") {
					castle[0] = false;
					castle[1] = false;
				} else {
					castle[2] = false;
					castle[3] = false;
				}
			}
			if(piece.charAt(8) == "p" && (this.className.charAt(9) == "8" || this.className.charAt(9) == "1")) {
				piece = "images/" + turn + "queen.png";
			}
			var capture = ($(this).html() !== "") ? true : false;
			$(this).html(ui.draggable.remove().html());
			$(this).append("<img src='" + piece + "'/>");
			resetDrag();
			turn = (turn == "w") ? "b" : "w";
			currentRecordNum++;
			if(capture)
				addRecord(piece, this.className.substring(8,10), thisPos, "x");
			else
				addRecord(piece, this.className.substring(8,10), thisPos);
			highlightPrev(record.length-1);
		}
	}
}
function startWhite(white) {
	for (var y = 0; y < 8; y++) {
	  for (var x = 0; x < 8; x++) {
	  	className = (white) ? getChar(x) + (7 - y + 1) : getChar(7 - x) + (y + 1);
	  	var num = ((x + y % 2) % 2 + 1);
	    var d = document.createElement('div');
	    $(d).addClass("square" + num)
	      .addClass(className)
	      .appendTo($(".board"))
	      .droppable({
		      drop: dropper
		    });
	  }
	}
	setBoard();
	//setFromFEN("7k/P7/R7/8/8/8/7p/K7 w");
}
function highlight(img) {
	if(img.attr("src").charAt(7) == turn) {
		$(".board div").removeClass("selected1");
		$(".board div").removeClass("selected2");
		var legals = checkLegal(img.attr("src"), img.parent().attr("class").substring(8,10));
		var str = "";
		for(var x=0; x<legals.length; x++) {
			str += "." + legals[x] + ",";
		}
		str = str.substring(0, str.length-1);
		$(str).each(function(){
			if($(this).attr("class").charAt(6) == "1")
				$(this).addClass("selected1");
			else
				$(this).addClass("selected2");
		});
	}
}
function highlightPrev(recordNum) {
	$(".board div").removeClass("highlightPrev1");
	$(".board div").removeClass("highlightPrev2");
	var pos = record[recordNum].position;
	var prevPos = record[recordNum].prevPosition;
	if($("." + pos).attr("class").charAt(6) == "1")
		$("." + pos).addClass("highlightPrev1");
	else
		$("." + pos).addClass("highlightPrev2");
		
	if($("." + prevPos).attr("class").charAt(6) == "1")
		$("." + prevPos).addClass("highlightPrev1");
	else
		$("." + prevPos).addClass("highlightPrev2");
}
startWhite(true);
resetDrag();

$(".board div").click(function() {
	$(".board div").removeClass("selected1");
	$(".board div").removeClass("selected2");
});
$(".board").on("mousedown", "img", function(){
	highlight($(this));
});
$(".record").on("click", "div", function(){
	currentRecordNum = parseInt($(this).attr("class").substring(6));
	setFromFEN(record[currentRecordNum].fen);
	highlightPrev(currentRecordNum);
	resetDrag();
	$(".record div").removeClass("highlight-record");
	$(this).addClass("highlight-record");
	deleteLast = true;
});
$(".set").on("click", function() {
	$(".inp").val(getFEN());
	resetDrag();
});
$(".get").on("click", function(){
	setFromFEN($(".inp").val());
});
$(".left").on("click", function(){
	if(currentRecordNum > 1) {
		currentRecordNum--;
		setFromFEN(record[currentRecordNum-1].fen);
		highlightPrev(currentRecordNum-1);
		resetDrag();
		$(".record div").removeClass("highlight-record");
		$(".record" + (currentRecordNum-1)).addClass("highlight-record");
		deleteLast = true;
	}
});
$(".right").on("click", function(){
	if(currentRecordNum < record.length) {
		currentRecordNum++;
		setFromFEN(record[currentRecordNum-1].fen);
		highlightPrev(currentRecordNum-1);
		resetDrag();
		$(".record div").removeClass("highlight-record");
		$(".record" + (currentRecordNum-1)).addClass("highlight-record");
		deleteLast = true;
	}
});