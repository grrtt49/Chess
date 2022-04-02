//var piece = new ChessPiece("#board", "/images/bking.png");

var board = new ChessBoard("#board", 60, "#eeeed2", "#769656");
board.drawBoard();

$(document).ready(function() {
	$(document).on("mousedown", ".draggable", function() {
		$(".hilighted").removeClass("hilighted");
		let pos = {
			"x": parseInt($(this).parent().attr("data-x")), 
			"y": parseInt($(this).parent().attr("data-y"))
		};
		if(board.pieceAtPos(pos).color == board.getTurn() && !board.showingPawnPromotion) {
			let available = board.getAvailableAtPos(pos);
			for(let i = 0; i < available.length; i++) {
				$(".pos" + available[i].x + "-" + available[i].y).addClass("hilighted");
			}
		}
	});

	$(document).on("click", function() {
		$(".hilighted").removeClass("hilighted");
	});
});