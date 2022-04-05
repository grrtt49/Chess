//var piece = new ChessPiece("#board", "/images/bking.png");
var board = null;
function startGame() {
	let gameOption = $("#game-option").val();
	let timeOption = $("#time-option").val();

	if(timeOption == "real-time") {
		let minutes = $("#minuteRange").val();
		let increment = $("#incrementRange").val();
		board = new ChessBoard("#board", 60, minutes, increment);
	}
	else {
		board = new ChessBoard("#board", 60);
	}

	if(gameOption == "custom") {
		let newFEN = $("#start-fen-input").val();
		if(validateFEN(newFEN)) {
			console.log("Valid FEN");
			board.setFromFEN(newFEN);
		}
	}

	$("#options_container").hide();
	$("#chess-container").show();
	board.drawBoard();
}

$(document).ready(function() {
	$(document).on("mousedown", ".draggable", function() {
		$(".square").removeClass("selected1").removeClass("selected2");
		let pos = {
			"x": parseInt($(this).parent().attr("data-x")), 
			"y": parseInt($(this).parent().attr("data-y"))
		};
		if(board.pieceAtPos(pos).color == board.getTurn() && !board.showingPawnPromotion && board.moves.currentMove == board.moves.moves.length - 1) {
			let available = board.getAvailableAtPos(pos);
			for(let i = 0; i < available.length; i++) {
				if(available[i].x % 2 == available[i].y % 2) {
					$(".pos" + available[i].x + "-" + available[i].y).addClass("selected1");
				}
				else {
					$(".pos" + available[i].x + "-" + available[i].y).addClass("selected2");
				}
			}
		}
	});

	$(document).on("click", function() {
		$(".square").removeClass("selected1").removeClass("selected2");
	});

	$("#minuteRange").on("input", function(){
		$("#minuteValue").text($(this).val());
	});

	$("#incrementRange").on("input", function(){
		$("#incrementValue").text($(this).val());
	});

	$("#game-option").change(function(){
		if($(this).val() == "custom") {
			$("#start-fen").show();
		}
		else {
			$("#start-fen").hide();
		}
	});

	$("#time-option").change(function(){
		if($(this).val() == "real-time") {
			$(".slidecontainer").show();
		}
		else {
			$(".slidecontainer").hide();
		}
	});
});

function validateFEN(fen) {
	console.log("Validating FEN");
	const regexp = /\s*([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw-]\s(([a-hkqA-HKQ]{1,4})|(-))\s(([a-h][36])|(-))\s\d+\s\d+\s*/;
	if(!fen.match(regexp)) return false;		   
	
	let colorIndex = fen.indexOf(" ") + 1;
	//if indexOf was not valid
	if(colorIndex - 1 == -1) return false;
	
	let enPassantIndex = fen.indexOf(" ", colorIndex + 1) + 1;
	if(enPassantIndex - 1 == -1) return false;
	
	let castleIndex = fen.indexOf(" ", enPassantIndex + 1) + 1;
	if(castleIndex - 1 == -1) return false;
	
	let halfmoveClockIndex = fen.indexOf(" ", castleIndex + 1) + 1;
	if(halfmoveClockIndex - 1 == -1) return false;
	
	let wholeMovesIndex = fen.indexOf(" ", halfmoveClockIndex + 1) + 1;
	if(wholeMovesIndex - 1 == -1) return false;

	let pieces = fen.substr(0, colorIndex - 1);
	let color = fen.substr(colorIndex, enPassantIndex - colorIndex - 1);
	let enPassant = fen.substr(enPassantIndex, castleIndex - enPassantIndex - 1);
	let castle = fen.substr(castleIndex, halfmoveClockIndex - castleIndex - 1);
	let halfmoveClock = fen.substr(halfmoveClockIndex, wholeMovesIndex - halfmoveClockIndex - 1);
	let wholeMoves = fen.substr(wholeMovesIndex);

	/*var x = 0;
	var y = 0;
	var newBoard = [[]];
	for(let i = 0; i < pieces.length; i++) {
		if(x > 8 || y > 8) return false;
		
		let checkChar = pieces.charAt(i);
		//if char is number
		if(!isNaN(checkChar)) {
			for(var j = 0; j < parseInt(checkChar); j++) {
				newBoard[y].push(null);
			}
			x += parseInt(checkChar);
		}
		else if(checkChar == "/"){
			y++;
			x = 0;
			newBoard.push([]);
		}
		else {
			//newBoard[y].push(this.createPieceFromStr(checkChar));
		}
	}
	//this.board = newBoard;
	//this.setTurn(color);
	if(enPassant != "-") {
		//create an InvisiPawn™ with color opposite of whos turn it is
		//this.setInvisiPawnFromStr(enPassant, color == "w" ? "b" : "w");
	}*/
	
	return true;
}