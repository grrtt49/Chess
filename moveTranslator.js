class MoveTranslator {
	moves;
	
	constructor() {
		this.moves = [];
	}
	
	addMove(oldPos, newPos, piece, captured, castle, promote, check, ambiguous) {
		this.moves.push(new Move(oldPos, newPos, piece, captured, castle, promote, check, ambiguous));
	}

	resetFromMove(index) {
		this.moves.splice(index);
	}

	getHTML() {
		var html = "";
		for(let i = 0; i < this.moves.length; i += 2) {
			html += "<div class='move-col-1'>" + Math.ceil((i + 1)/2) + "</div>" + 
					"<div class='move-col-2'>" + this.moves[i].toString() + "</div>";

			if(i + 1 < this.moves.length) {
				html += "<div class='move-col-2'>" + this.moves[i + 1].toString() + "</div>";
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

class Move {
	oldPos;
	newPos;
	piece;
	captured;
	castle;
	promote;
	check;
	ambiguous;
	
	constructor(oldPos, newPos, piece, captured, castle, promote, check, ambiguous) {
		this.oldPos = oldPos;
		this.newPos = newPos;
		this.piece = piece;
		this.captured = captured;
		this.castle = castle;
		this.promote = promote;
		this.check = check;
		this.ambiguous = ambiguous;
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