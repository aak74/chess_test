var
	game = new Chess(),
	
	figures = document.querySelectorAll('.contentFigure'),
	dragged,
	
	captivesW = document.querySelector('#captivesW'),
	captivesB = document.querySelector('#captivesB');


var removeGreySquares = function() {
	//������ ��������� � ������
	
	var squaresLegalW = document.querySelectorAll('.whiteCageLegal');
	var squaresLegalB = document.querySelectorAll('.blackCageLegal');
	
	for (var i=0; i<=squaresLegalW.length-1; i++) {
		squaresLegalW[i].classList.remove('whiteCageLegal');
	}
	for (var j=0; j<=squaresLegalB.length-1; j++) {
		squaresLegalB[j].classList.remove('blackCageLegal');
	}
};

var greySquare = function(square) {
	//��������� ������, �� ������� ����� ��������
	var squareLegal = document.getElementById('cage-' + square);
	var background = 'whiteCageLegal';
	if (squareLegal.classList.contains('blackCage')) {
		background = 'blackCageLegal';
	}
	squareLegal.classList.add(background);
};

var addCageMouseOver = function (figure) {
	//��� ��������� �� ������ �������� ������� ��������� ��������� ��� ����������� �������
	figure.addEventListener("mouseover", function() {
	
		var square = event.target.parentNode.dataset.square;
		
		// get list of possible moves for this cage
		var moves = game.moves({
			square: square,
			verbose: true
		});
		
		// exit if there are no moves available for this square
		if (moves.length === 0) return;
		
		// highlight the square they moused over
		greySquare(square);
		
		// highlight the possible squares for this piece
		for (var i = 0; i < moves.length; i++) {
			greySquare(moves[i].to);
		}
  });
};

var addCageMouseOut = function (figure) {
	//��� ����� ������� � ������, �� ������� ������, ������� �������� ��������� ������
	figure.addEventListener("mouseout", function() {
		removeGreySquares();
	});
};



var addFigureDragStart = function (figure) {
	figure.addEventListener("dragstart", function() {	
		var piece = event.target.dataset.piece;
		
		// do not pick up pieces if the game is over
		// or if it's not that side's turn
		if (game.game_over() === true ||
			(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
			return false;
		}
		else {
			dragged = event.target;
			event.target.style.opacity = 0.1;
		}
	});
};


document.addEventListener("dragend", function(evt) {
	// reset the transparency
	evt.target.style.opacity = "";
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function(evt) {
	// prevent default to allow drop
	evt.preventDefault();
}, false);


document.addEventListener("drop", function(evt) {
	// prevent default action (open as link for some elements)
	evt.preventDefault();
	
	//evt.target.style.opacity = "";
	removeGreySquares();
	
	var toCage = evt.target;
	if ( ~evt.target.className.indexOf("contentFigure")) {
		toCage = evt.target.parentNode;
	}	
	// see if the move is legal
	var move = game.move({
		from: dragged.parentNode.dataset.square,
		to: toCage.dataset.square,
		promotion: 'q' // NOTE: always promote to a queen for example simplicity
	});

	// illegal move
	if (move === null) {
	}
	else {
		// move dragged elem to the selected drop target	
		if ( ~evt.target.className.indexOf("contentFigure")) {
			//���� � ������, � ������� ����� �������������, ���� ������, ����� � ��������� � ��������������� �����
			toCage.removeChild(evt.target);
			//� ����� ������� � game.move ��� ��� ������ � ������� ���������� ������, �� �� ��� ������������� ������
			if (game.turn() === game.BLACK) {
				captivesB.appendChild(evt.target);
			}
			else {
				captivesW.appendChild(evt.target);
			}
			evt.target.classList.add('captiveFigure');
		}
		dragged.parentNode.removeChild(dragged);
		toCage.appendChild(dragged);
		
		if (move.san.indexOf('=Q') !== -1) {
		//���� ����� ����� �� ����, ������� � �� �����
			if (game.turn() === game.BLACK) {
				dragged.classList.remove('figurePawnWhite');
				dragged.classList.add('figureQueenWhite');
			}
			else {
				dragged.classList.remove('figurePawnBlack');
				dragged.classList.add('figureQueenBlack');
			}
		}
		
		if (move.san.indexOf('O-O-O') !== -1) {
		//���� ������� ���������
			if (game.turn() === game.BLACK) {
				var tempFigure = document.querySelector('#figureRook1White');
				var tempCage = document.querySelector('#cage-d1');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCage.appendChild(tempFigure);
			}
			else {
				var tempFigure = document.querySelector('#figureRook1Black');
				var tempCage = document.querySelector('#cage-d8');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCage.appendChild(tempFigure);
			}
		}
		else if (move.san.indexOf('O-O') !== -1) {
			//���� �������� ���������
			if (game.turn() === game.BLACK) {
				var tempFigure = document.querySelector('#figureRook2White');
				var tempCage = document.querySelector('#cage-f1');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCage.appendChild(tempFigure);
			}
			else {
				var tempFigure = document.querySelector('#figureRook2Black');
				var tempCage = document.querySelector('#cage-f8');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCage.appendChild(tempFigure);
			}
		}
		
		updateStatus();
	}
}, false);

var updateStatus = function() { //���������� �������
	var status = '';
	var moveColor = '�����';
	setCookie(game.fen());
	if (game.turn() === game.BLACK) {
		moveColor = '������';
	}
	if (game.in_checkmate() === true) { //���
		status = '��� ����, ' + moveColor + ' �������� ���';
		/*-----------------------------------------------------------------------*/
		/*�������� �������� cookie - �������� ������ ������*/
		/*-----------------------------------------------------------------------*/
		alert(status);
	}
	else if (game.in_draw() === true) { //�����
		status = '��� ����, �����';
		/*-----------------------------------------------------------------------*/
		/*�������� �������� cookie - �������� ������ ������*/
		/*-----------------------------------------------------------------------*/
		alert(status);
	}
	else {
		status = moveColor + ' ����� ������';
		if (game.in_check() === true) { //���
			status += ', ' + moveColor + ' ��� �����';
		}
	}
};


for (var i = 0; i < figures.length; i++) {
	addCageMouseOver(figures[i]);
	addCageMouseOut(figures[i]);
	addFigureDragStart(figures[i]);
}