var
	game = new Chess(),
	
	figures = document.querySelectorAll('.contentFigure'),
	dragged,
	
	statusW = document.querySelector('.statusW'),
	statusB = document.querySelector('.statusB'),
	init=0,
	timelineW = document.querySelector('.timelineW'),
	timelineB = document.querySelector('.timelineB'),
	timeW = 1000,
	timeB = 1000,
	captivesW = document.querySelector('#captivesW'),
	captivesB = document.querySelector('#captivesB');


var removeGreySquares = function() {
	//������ ��������� � ������
	
	var squaresLegalW = document.querySelectorAll('.whiteCellLegal');
	var squaresLegalB = document.querySelectorAll('.blackCellLegal');
	
	for (var i=0; i<=squaresLegalW.length-1; i++) {
		squaresLegalW[i].classList.remove('whiteCellLegal');
	}
	for (var j=0; j<=squaresLegalB.length-1; j++) {
		squaresLegalB[j].classList.remove('blackCellLegal');
	}
};

var greySquare = function(square) {
	//��������� ������, �� ������� ����� ��������
	var squareLegal = document.getElementById('cell-' + square);
	var background = 'whiteCellLegal';
	if (squareLegal.classList.contains('blackCell')) {
		background = 'blackCellLegal';
	}
	squareLegal.classList.add(background);
};

var addCellMouseOver = function (figure) {
	//��� ��������� �� ������ �������� ������� ��������� ��������� ��� ����������� �������
	figure.addEventListener("mouseover", function() {
	
		var square = event.target.parentNode.dataset.square;
		
		// get list of possible moves for this cell
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

var addCellMouseOut = function (figure) {
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
	
	var toCell = evt.target;
	if ( ~evt.target.className.indexOf("contentFigure")) {
		toCell = evt.target.parentNode;
	}	
	// see if the move is legal
	var move = game.move({
		from: dragged.parentNode.dataset.square,
		to: toCell.dataset.square,
		promotion: 'q' // NOTE: always promote to a queen for example simplicity
	});

	// illegal move
	if (move === null) {
	}
	else {
		// move dragged elem to the selected drop target	
		if ( ~evt.target.className.indexOf("contentFigure")) {
			//���� � ������, � ������� ����� �������������, ���� ������, ����� � ��������� � ��������������� �����
			toCell.removeChild(evt.target);
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
		toCell.appendChild(dragged);
		
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
				var tempCell = document.querySelector('#cell-d1');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCell.appendChild(tempFigure);
			}
			else {
				var tempFigure = document.querySelector('#figureRook1Black');
				var tempCell = document.querySelector('#cell-d8');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCell.appendChild(tempFigure);
			}
		}
		else if (move.san.indexOf('O-O') !== -1) {
			//���� �������� ���������
			if (game.turn() === game.BLACK) {
				var tempFigure = document.querySelector('#figureRook2White');
				var tempCell = document.querySelector('#cell-f1');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCell.appendChild(tempFigure);
			}
			else {
				var tempFigure = document.querySelector('#figureRook2Black');
				var tempCell = document.querySelector('#cell-f8');
				tempFigure.parentNode.removeChild(tempFigure);
				tempCell.appendChild(tempFigure);
			}
		}
		
		updateStatus();
	}
}, false);

var updateStatus = function() { //���������� �������
	var status = '',
		moveColor = '�����';
	
	statusW.style.visibility = "visible";
	statusB.style.visibility = "hidden";
	
	/*---------------------------------------------*/
	/*�������� game.fen() � localstorage*/
	/*---------------------------------------------*/
	
	if (game.turn() === game.BLACK) {
		moveColor = '������';
		statusW.style.visibility = "hidden";
		statusB.style.visibility = "visible";
	}
	
	if (game.in_checkmate() === true) { //���
		status = '��� ����, ' + moveColor + ' �������� ���';
		/*------------------------------------*/
		/*������� fen �� localstorage*/
		/*------------------------------------*/
		alert(status);
	}
	else if (game.in_draw() === true) { //�����
		status = '��� ����, �����';
		/*------------------------------------*/
		/*������� fen �� localstorage*/
		/*------------------------------------*/
		alert(status);
	}
	else {
		status = moveColor + ' ����� ������';
		if (game.in_check() === true) { //���
			status += ', ' + moveColor + ' ��� �����';
		}
	}
};



function startTIME() { 
	var t = 0;
	if (game.turn() === game.BLACK) {
	//���� ������� �������� �� ����� ���� �����
		timeB += 1000;
		t = timeB;
	}
	else {
		timeW += 1000;
		t = timeW;
	}
	
	var ms = t%1000;
	
	t-=ms;
	ms=Math.floor(ms/10);
	t = Math.floor (t/1000);
	var s = t%60;
	
	t-=s;
	t = Math.floor (t/60);
	var m = t%60;
	
	t-=m;
	t = Math.floor (t/60);
	var h = t%60;
	
	//��������� ���������� ����
	if (h<10) h='0'+h;
	if (m<10) m='0'+m;
	if (s<10) s='0'+s;
	if (ms<10) ms='0'+ms;
	
	if (init==1) {
		if (game.turn() === game.BLACK) {
			timelineB.textContent = h + ':' + m + ':' + s;
		}
		else {
			timelineW.textContent = h + ':' + m + ':' + s;
		}
	}
	setTimeout("startTIME()",1000);
}

function findTIME() {
	if (init==0) {
		startTIME();
		init=1;
	}
 }


 
for (var i = 0; i < figures.length; i++) {
	addCellMouseOver(figures[i]);
	addCellMouseOut(figures[i]);
	addFigureDragStart(figures[i]);
}

statusB.style.visibility = "hidden";
findTIME(timeW);