/* 
TODO: 
Check after pawn promotion
*/

class ChessBoard {
	selector;
	size;
	color1;
	color2;
	board;
	turn;
	showingPawnPromotion;
	capturedPieces;
	moves;
	
	constructor(selector, size, color1, color2) {
	    this.selector = selector;
		this.size = size;
		this.color1 = color1;
		this.color2 = color2;
		this.board = this._initBoard();
		this.turn = 0;
		this.showingPawnPromotion = false;
		this.capturedPieces = [];
		this.moves = new MoveTranslator();
	}

	drawBoard() {
		//draws each square of the board. Use when board array is updated
		$(this.selector).empty();
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				$(this.selector).append(this._getSquare(x, y));
			}
		}
		this.drawCaptured();
		$("#move-container").html(this.moves.getHTML());
		$(".draggable").draggable({
			containment: $("#board"),
			revert: true,
			zIndex: 5000,
		});
	}

	drawCaptured() {
		$("#b-pieces-captured").empty();
		$("#w-pieces-captured").empty();
		let whitePieces = {
			"queens": [],
			"rooks": [],
			"bishops": [],
			"knights": [],
			"pawns": []
		};
		let blackPieces = {
			"queens": [],
			"rooks": [],
			"bishops": [],
			"knights": [],
			"pawns": []
		};
		for(var i = 0; i < this.capturedPieces.length; i++) {
			let piece = this.capturedPieces[i];
			let pieces = (piece.color == "w" ? whitePieces : blackPieces);
			if(piece instanceof Queen) {
				pieces.queens.push(piece);
			} 
			else if(piece instanceof Rook) {
				pieces.rooks.push(piece);
			} 
			else if(piece instanceof Bishop) {
				pieces.bishops.push(piece);
			} 
			else if(piece instanceof Knight) {
				pieces.knights.push(piece);
			} 
			else if(piece instanceof Pawn) {
				pieces.pawns.push(piece);
			} 
		}

		$.each(whitePieces, function(key, pieces) {
			if(pieces.length > 0) {
				$("#w-pieces-captured").append("<div class='captured-box'>" + pieces[0].getIcon() + pieces.length + "</div>");
			}
		});

		$.each(blackPieces, function(key, pieces) {
			if(pieces.length > 0) {
				$("#b-pieces-captured").append("<div class='captured-box'>" + pieces[0].getIcon() + pieces.length + "</div>");
			}
		});
	}

	_getSquare(x, y) {
		//gets the html for a square at position x, y
		var color = this.color1;
		if(x % 2 != y % 2) {
			color = this.color2;
		}
		let piece = this.board[y][x];
		let pieceImg = (piece != null ? piece.getPiece() : "");
		return $("<div class='square pos" + x + "-" + y + "' data-x='" + x + "' data-y='" + y + "' style='width: " + this.size + "px; height: " + this.size + "px; background-color: " + color + "'>" + pieceImg + "</div>").droppable({
			drop: dropper
		});
	}

	_initBoard() {
		return [
			[new Rook("b"), new Knight("b"), new Bishop("b"), new Queen("b"), new King("b"), new Bishop("b"), new Knight("b"), new Rook("b")], 
			//[new Rook("b"), null, null, null, new King("b"), null, null, new Rook("b")], 
			[new Pawn("b"), new Pawn("b"), new Pawn("b"), new Pawn("b"), new Pawn("b"), new Pawn("b"), new Pawn("b"), new Pawn("b")], 
			[null, null, null, null, null, null, null, null], 
			[null, null, null, null, null, null, null, null], 
			[null, null, null, null, null, null, null, null], 
			[null, null, null, null, null, null, null, null], 
			[new Pawn("w"), new Pawn("w"), new Pawn("w"), new Pawn("w"), new Pawn("w"), new Pawn("w"), new Pawn("w"), new Pawn("w")],
			[new Rook("w"), new Knight("w"), new Bishop("w"), new Queen("w"), new King("w"), new Bishop("w"), new Knight("w"), new Rook("w")]
			//[new Rook("w"), null, null, null, new King("w"), null, null, new Rook("w")]
		];
	}

	_includesPosInArray(pos, arr) {
		for(var i = 0; i < arr.length; i++) {
			if(arr[i].x == pos.x && arr[i].y == pos.y) {
				return true;
			}
		}
		return false;
	}

	getColorArr() {
		//used for calculating where a piece can go (because a piece can take a piece of the opposite color)
		var charArr = [];
		for(var y = 0; y < 8; y++) {
			charArr.push([]);
			for(var x = 0; x < 8; x++) {
				if(this.board[y][x] == null) {
					charArr[y].push(null);
				}
				else {
					charArr[y].push(this.board[y][x].color);
				}
			}
		}
		return charArr;
	}

	isCastleMove(oldPos, newPos) {
		let piece = this.pieceAtPos(oldPos);
		if(!(piece instanceof King)) return false;
		return !(Math.abs(oldPos.x - newPos.x) < 2);
	}

	isTwoSpacePawnMove(from, to) {
		let piece = this.pieceAtPos(from);
		if(!(piece instanceof Pawn)) return false;
		return !(Math.abs(from.y - to.y) < 2);
	}

	isPawnPromotion(pos, turn) {
		let piece = this.pieceAtPos(pos);
		return (piece instanceof Pawn && (turn == "w" ? 0 : 7) == pos.y); //and is in the correct y pos
	}

	showPawnPromotion(from, pos, turn, captured) {
		$("#pawn-promotion").html(	"<img src='images/" + turn + "queen.png' onclick='promotePiece(\"queen\", \""+turn+"\", "+from.x+", "+from.y+", "+pos.x+", "+pos.y+", "+captured+")'>" +
								  	"<img src='images/" + turn + "rook.png' onclick='promotePiece(\"rook\", \""+turn+"\", "+from.x+", "+from.y+", "+pos.x+", "+pos.y+", "+captured+")'>" +
									"<img src='images/" + turn + "bishop.png' onclick='promotePiece(\"bishop\", \""+turn+"\", "+from.x+", "+from.y+", "+pos.x+", "+pos.y+", "+captured+")'>" +
									"<img src='images/" + turn + "knight.png' onclick='promotePiece(\"knight\", \""+turn+"\", "+from.x+", "+from.y+", "+pos.x+", "+pos.y+", "+captured+")'>");
		$("#pawn-promotion").css("display", "flex");
		this.showingPawnPromotion = true;
	}
	
	movePiece(from, to) {
		if(this.isCastleMove(from, to)) {
			var multiplier = (from.x - to.x > 0 ? -1 : 1);
			let newKingPos = {"x": from.x + (2 * multiplier), "y": from.y};
			let oldRookPos = {"x": (multiplier == -1 ? 0 : 7), "y": from.y};
			let newRookPos = {"x": newKingPos.x + (multiplier * -1), "y": from.y};
			
			this.board[newKingPos.y][newKingPos.x] = this.board[from.y][from.x];
			this.board[from.y][from.x] = null;
			this.board[newKingPos.y][newKingPos.x].moved = true;

			this.board[newRookPos.y][newRookPos.x] = this.board[oldRookPos.y][oldRookPos.x];
			this.board[oldRookPos.y][oldRookPos.x] = null;
			this.board[newRookPos.y][newRookPos.x].moved = true;
			
			this.moves.addMove(from, to, this.pieceAtPos(newKingPos), null, true, null);
			return this.nextTurn();
		}
		//for handling en passante in the next turn
		if(this.isTwoSpacePawnMove(from, to)) {
			let piece = this.pieceAtPos(from);
			let multiplier = (from.y - to.y > 0 ? 1 : -1);
			this.board[to.y + multiplier][to.x] = new InvisiPawn(piece.color);
		}
		//check if capturing
		let capturedPiece = this.pieceAtPos(to);
		if(capturedPiece != null) {
			//check if pawn is an InvisiPawn™ to enforce en passante
			if(capturedPiece instanceof InvisiPawn) {
				let realPawnY = to.y + (capturedPiece.color == "w" ? -1 : 1);
				capturedPiece = this.pieceAtPos({"x": to.x, "y": realPawnY});
				this.board[realPawnY][to.x] = null;
			}
			//add piece to captured array
			this.capturedPieces.push(capturedPiece);
		}
		this.board[to.y][to.x] = this.board[from.y][from.x];
		this.board[from.y][from.x] = null;
		this.board[to.y][to.x].moved = true;
		if(this.isPawnPromotion(to, this.getTurn())) {
			this.showPawnPromotion(from, to, this.getTurn(), capturedPiece != null ? true : null);
		}
		else {
			this.moves.addMove(from, to, this.pieceAtPos(to), capturedPiece, false, null);
		}
		return this.nextTurn();
	}

	getAvailableAtPos(pos) {
		let piece = this.board[pos.y][pos.x];
		if(piece == null) {
			return [];
		}
		var available = piece.getAvailable(pos, this.getColorArr());
		if(piece instanceof King) {
			var available = available.concat(this.getCastlingAvailable(pos));
		}
		var availableConsideredCheck = [];
		
		for(var i = 0; i < available.length; i++) {
			let newPos = available[i];
			let replaced = this.board[newPos.y][newPos.x];

			//move piece to that location temporarily
			this.board[newPos.y][newPos.x] = this.board[pos.y][pos.x];
			this.board[pos.y][pos.x] = null;

			//if moving piece would not result in a check, add to list
			if(!this.isCheck(this.getTurn())) {
				availableConsideredCheck.push(newPos);
			}

			//put piece back
			this.board[pos.y][pos.x] = this.board[newPos.y][newPos.x];
			this.board[newPos.y][newPos.x] = replaced;
		}

		return availableConsideredCheck;
	}

	validateMove(oldPos, newPos) {
		//ensure it is the correct players turn and pawn promotion screen is hidden
		if(this.getTurn() != this.pieceAtPos(oldPos).color || this.showingPawnPromotion) {
			return false;
		}

		//get available spaces and ensure the new position is included
		let availableSpaces = this.getAvailableAtPos(oldPos);
		return this._includesPosInArray(newPos, availableSpaces);
	}

	pieceAtPos(pos) {
		return this.board[pos.y][pos.x];
	}

	deleteInvisiPawns(side) {
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				let checkPos = {"x": x, "y": y};
				if(this.pieceAtPos(checkPos) != null && this.pieceAtPos(checkPos).color == side && this.pieceAtPos(checkPos) instanceof InvisiPawn) {
					this.board[y][x] = null;
				}
			}
		}
	}

	getTurn(nextTurn=false) {
		//nextTurn is to get the opposite (for looking at checks)
		if(!nextTurn)
			return this.turn == 0 ? "w" : "b";
		else 
			return this.turn == 1 ? "w" : "b";
	}

	nextTurn() {
		this.turn = (this.turn + 1) % 2;
		this.deleteInvisiPawns(this.getTurn());
		return this.isCheckmate(this.getTurn());
	}

	isCheck(side) {
		var enemyMoves = [];
		var kingPos;
		let colorArr = this.getColorArr();

		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				//find all the available spaces for enemy pieces (except pawns non-attacking moves)
				if(this.board[y][x] != null && this.board[y][x].color != side) {
					let checkPos = {"x": x, "y": y};
					enemyMoves = enemyMoves.concat(this.board[y][x].getAvailable(checkPos, colorArr, true));
				}
				//find the kings position
				else if(this.board[y][x] != null && this.board[y][x].color == side && this.board[y][x] instanceof King) {
					kingPos = {"x": x, "y": y};
				}
			}
		}

		//if the king's position is in any of the attacking squares, return true
		return this._includesPosInArray(kingPos, enemyMoves);
	}

	sideHasAvailableMoves(side) {
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				let checkPos = {"x": x, "y": y};
				if(this.pieceAtPos(checkPos) != null && this.pieceAtPos(checkPos).color == side && this.getAvailableAtPos(checkPos).length > 0) {
					return true;
				}
			}
		}
		return false;
	}

	isCheckmate(side) {
		if(!this.isCheck(side)) {
			return false;
		}

		//if side has no available moves left, they are in checkmate
		return !this.sideHasAvailableMoves(side);
	}

	getKingPos(side) {
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				if(this.board[y][x] != null && this.board[y][x].color == side && this.board[y][x] instanceof King) {
					return {"x": x, "y": y};
				}
			}
		}
	}

	getUnmovedRooksPos(side) {
		var rooks = [];
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 8; x++) {
				if(this.board[y][x] != null && this.board[y][x].color == side && this.board[y][x] instanceof Rook && this.board[y][x].moved == false) {
					rooks.push({"x": x, "y": y});
				}
			}
		}
		return rooks;
	}

	getCastlingAvailable(pos) {
		let king = this.pieceAtPos(pos);
		if(king.moved) return [];
		
		let side = king.color; 
		let rooks = this.getUnmovedRooksPos(side);
		
		if(rooks.length == 0) return [];

		var castlePositions = [];
		for(var i = 0; i < rooks.length; i++) {
			//check every space between the rook and king
			var moveThroughCheck = false;
			for(var x = Math.min(pos.x, rooks[i].x) + 1; x < Math.max(pos.x, rooks[i].x); x++) {
				let newPos = {"x": x, "y": rooks[i].y};
				let replaced = this.board[newPos.y][newPos.x];

				if(this.pieceAtPos(newPos) != null) {
					moveThroughCheck = true;
				}
				
				//move piece to that location temporarily
				this.board[newPos.y][newPos.x] = this.board[pos.y][pos.x];
				this.board[pos.y][pos.x] = null;
	
				//if moving piece would result in a check, 
				if(this.isCheck(this.getTurn())) {
					moveThroughCheck = true;
				}
	
				//put piece back
				this.board[pos.y][pos.x] = this.board[newPos.y][newPos.x];
				this.board[newPos.y][newPos.x] = replaced;
			}
			
			if(!moveThroughCheck && rooks[i].x == 7) {
				castlePositions.push({"x": pos.x + 2, "y": pos.y});
				castlePositions.push(rooks[i]);
			}
			else if(!moveThroughCheck && rooks[i].x == 0) {
				castlePositions.push({"x": pos.x - 2, "y": pos.y});
				castlePositions.push(rooks[i]);
			}
		}
		return castlePositions;
	}
}

function dropper(e, ui) {
	//calculate where the pieces should go from html data
	var oldPos = {};
	var newPos = {};
	oldPos.x = parseInt(ui.draggable.parent().attr("data-x"));
	oldPos.y = parseInt(ui.draggable.parent().attr("data-y"));
	newPos.x = parseInt($(e.target).attr("data-x"));
	newPos.y = parseInt($(e.target).attr("data-y"));

	//ensure movement is valid, then update
	if(board.validateMove(oldPos, newPos)) {
		let isCheckmate = board.movePiece(oldPos, newPos);
		board.drawBoard();
		
		if(isCheckmate || board.isCheck(board.getTurn())) {
			let kingPos = board.getKingPos(board.getTurn());
			$(".pos" + kingPos.x + "-" + kingPos.y).addClass("check-square");
		}

		if(isCheckmate) {
			console.log("checkmate bois");
			$(".draggable").draggable({
				disabled: true
			});
			$("img, .square").css("pointer-events", "none");
		}
	}
}

function promotePiece(newPiece, turn, fromX, fromY, x, y, captured) {
	if(newPiece == "queen") {
		board.board[y][x] = new Queen(turn);
	}
	else if(newPiece == "rook") {
		board.board[y][x] = new Rook(turn);
	}
	else if(newPiece == "bishop") {
		board.board[y][x] = new Bishop(turn);
	}
	else if(newPiece == "knight") {
		board.board[y][x] = new Knight(turn);
	}
	
	board.moves.addMove({"x": fromX, "y": fromY}, {"x": x, "y": y}, new Pawn(), captured, false, board.board[y][x]);
	board.drawBoard();
	$("#pawn-promotion").css("display", "none");
	board.showingPawnPromotion = false;
}