class MoveTranslator {
	moves;
	currentMove;
	
	constructor() {
		this.moves = [];
		this.currentMove = -1;
	}

	addMove(oldPos, newPos, piece, captured, castle, promote, check, ambiguous, fen) {
		console.log("length: " + (this.moves.length - 1) + ", current: " + this.currentMove);
		if(this.currentMove != this.moves.length - 1) {
			//for some reason sees it as a string??? need to parse it
			this.resetFromMove(parseInt(this.currentMove) + 1);
		}
		this.moves.push(new Move(oldPos, newPos, piece, captured, castle, promote, check, ambiguous, fen));
		this.currentMove = this.moves.length - 1;
	}

	//used when going back to a previous move. If another move is made during that, it will reset all moves after it
	setFromMove(index) {
		this.currentMove = index;
		return this.moves[index].fen;
	}
	
	resetFromMove(index) {
		console.log(index);
		this.moves.splice(index);
	}

	getHTML() {
		var html = "";
		for(let i = 0; i < this.moves.length; i += 2) {
			let selectedStr = (i == this.currentMove ? "selected-move" : "");  
			
			html += "<div class='move-col-1'>" + Math.ceil((i + 1)/2) + "</div>" +
					"<div class='move-col-2 "+selectedStr+"' data-index='"+i+"'>" + this.moves[i].toString() + "</div>";

			if(i + 1 < this.moves.length) {
				let selectedStr = (i + 1 == this.currentMove ? "selected-move" : "");
				html += "<div class='move-col-2 "+selectedStr+"' data-index='"+(i + 1)+"'>" + this.moves[i + 1].toString() + "</div>";
			}
		}
		return html;
	}

	getFullMovesCount() {
		return Math.ceil((this.moves.length + 1) / 2);
	}

	getHalfmoveClock() {
		var count = 0;
		for(let i = this.moves.length - 1; i >= 0; i--) {
			if(this.moves[i].piece instanceof Pawn || this.moves[i].captured != null) {
				return count;
			}
			count++;
		}
		return count;
	}
}

$(document).ready(function(){
	$(document).on("click", ".move-col-2", function() {
		let index = $(this).attr("data-index");
		board.setFromMove(index);
		highlightPrevious();
	});
});

let columns = {
	0: "a",
	1: "b",
	2: "c",
	3: "d",
	4: "e",
	5: "f",
	6: "g",
	7: "h",
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

class Move {
	oldPos;
	newPos;
	piece;
	captured;
	castle;
	promote;
	check;
	ambiguous;
	fen;
	
	constructor(oldPos, newPos, piece, captured, castle, promote, check, ambiguous, fen) {
		this.oldPos = oldPos;
		this.newPos = newPos;
		this.piece = piece;
		this.captured = captured;
		this.castle = castle;
		this.promote = promote;
		this.check = check;
		this.ambiguous = ambiguous;
		this.fen = fen;
	}

	toString() {
		if(this.castle) {
			if(this.newPos.x == 2) return "0-0-0";
			return "0-0";
		}
		var str = this.getAmbiguousPieceStr(this.piece) + this.getCapturedStr() + columns[this.newPos.x] + (8 - this.newPos.y) + this.promoteString() + this.checkString();
		return str;
	}

	getAmbiguousPieceStr(piece) {
		let pieceStr = this.getPieceStr(this.piece);
		let columnStr = columns[this.oldPos.x];
		if(this.piece instanceof Pawn) {
			columnStr = "";
			pieceStr = "";
		}
		if(this.ambiguous == "") return pieceStr;
		if(this.ambiguous == "f") return pieceStr + columnStr;
		if(this.ambiguous == "r") return pieceStr + (8 - this.oldPos.y);
		if(this.ambiguous == "fr") return pieceStr + columnStr + (8 - this.oldPos.y);
	}

	getPieceStr(piece) {
		if(piece instanceof Pawn) {
			return columns[this.oldPos.x];
		}
		else if(piece instanceof Knight) {
			return "N";
		} 
		else if(piece instanceof Bishop) {
			return "B";
		} 
		else if(piece instanceof Rook) {
			return "R";
		} 
		else if(piece instanceof Queen) {
			return "Q";
		} 
		else if(piece instanceof King) {
			return "K";
		} 
	}

	getCapturedStr() {
		if(this.captured == null) return "";
		if(this.piece instanceof Pawn) return this.getPieceStr(this.piece) + "x";
		return "x";
	}

	promoteString() {
		if(this.promote == null) return "";
		return this.getPieceStr(this.promote);
	}

	checkString() {
		if(this.check == "") return "";
		if(this.check == "check") return "+";
		if(this.check == "checkmate") return "#";
	}
}