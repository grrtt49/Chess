//var piece = new ChessPiece("#board", "/images/bking.png");

var board = new ChessBoard("#board", 60);
board.drawBoard();

$(document).ready(function() {
	$(document).on("mousedown", ".draggable", function() {
		$(".square").removeClass("selected1").removeClass("selected2");
		let pos = {
			"x": parseInt($(this).parent().attr("data-x")), 
			"y": parseInt($(this).parent().attr("data-y"))
		};
		if(board.pieceAtPos(pos).color == board.getTurn() && !board.showingPawnPromotion) {
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
});