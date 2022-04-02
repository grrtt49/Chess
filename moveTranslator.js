class MoveTranslator {
	moves;
	
	constructor() {
		this.moves = [];
	}
	
	addMove(oldPos, newPos, piece, captured, castle, promote) {
		this.moves.push(new Move(oldPos, newPos, piece, captured, castle, promote));
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
	
	constructor(oldPos, newPos, piece, captured, castle, promote) {
		this.oldPos = oldPos;
		this.newPos = newPos;
		this.piece = piece;
		this.captured = captured;
		this.castle = castle;
		this.promote = promote;
	}

	toString() {
		if(this.castle) {
			if(this.newPos.x == 2) return "0-0-0";
			return "0-0";
		}
		var str = this.getCapturedStr() + this.getPieceStr(this.piece) + columns[this.newPos.x] + (this.newPos.y + 1) + this.promoteString();
		return str;
	}

	getPieceStr(piece) {
		if(piece instanceof Pawn) {
			return "";
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
		return columns[this.oldPos.x] + "x";
	}

	promoteString() {
		if(this.promote == null) return "";
		return this.getPieceStr(this.promote);
	}
}