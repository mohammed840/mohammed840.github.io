(function () {
  const signal = document.querySelector('.signal-rule');
  if (!signal) return;

  const seenKey = 'mohammed-profile-reward-signal-seen';
  try {
    if (!window.localStorage.getItem(seenKey)) {
      signal.classList.add('signal-play');
      window.localStorage.setItem(seenKey, '1');
    }
  } catch (error) {
    signal.classList.add('signal-play');
  }
})();

(function () {
  const launcher = document.querySelector('.chess-launcher');
  const widget = document.querySelector('.chess-widget');
  if (!launcher || !widget) return;

  const boardEl = widget.querySelector('.chess-board');
  const statusEl = widget.querySelector('.chess-status');
  const closeButton = widget.querySelector('.chess-close');
  const newButton = widget.querySelector('.chess-new');
  const pieceSymbols = { w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' }, b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' } };
  let chess = null;
  let selected = null;
  let lastMove = null;
  let loading = false;

  function loadChess() {
    if (window.Chess) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loading;
  }

  function squareName(row, col) { return String.fromCharCode(97 + col) + (8 - row); }

  function isGameOver() { return chess.isGameOver ? chess.isGameOver() : chess.game_over(); }
  function isDraw() { return chess.isDraw ? chess.isDraw() : chess.in_draw(); }

  function render() {
    boardEl.innerHTML = '';
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const square = squareName(row, col);
        const button = document.createElement('button');
        const piece = chess.get(square);
        button.className = 'chess-square ' + ((row + col) % 2 ? 'dark' : 'light');
        button.type = 'button';
        button.dataset.square = square;
        button.setAttribute('role', 'gridcell');
        button.setAttribute('aria-label', square + (piece ? ' ' + piece.color + ' ' + piece.type : ' empty'));
        if (selected === square) button.classList.add('selected');
        if (lastMove && (lastMove.from === square || lastMove.to === square)) button.classList.add('last-move');
        if (piece) {
          button.textContent = pieceSymbols[piece.color][piece.type];
          button.classList.add(piece.color === 'w' ? 'piece-white' : 'piece-black');
        }
        button.addEventListener('click', onSquareClick);
        boardEl.appendChild(button);
      }
    }
    statusEl.textContent = isGameOver() ? (isDraw() ? 'Draw' : 'Game over') : (chess.turn() === 'w' ? 'Your move' : 'Thinking…');
  }

  function onSquareClick(event) {
    if (!chess || isGameOver() || chess.turn() !== 'w') return;
    const square = event.currentTarget.dataset.square;
    const piece = chess.get(square);
    if (!selected) {
      if (piece && piece.color === 'w') { selected = square; render(); }
      return;
    }
    if (piece && piece.color === 'w') { selected = square; render(); return; }
    const move = chess.move({ from: selected, to: square, promotion: 'q' });
    if (!move) { statusEl.textContent = 'That move is not legal'; return; }
    lastMove = move; selected = null; render();
    if (!isGameOver()) window.setTimeout(makeComputerMove, 320);
  }

  function makeComputerMove() {
    if (isGameOver() || chess.turn() !== 'b') return;
    const moves = chess.moves({ verbose: true });
    moves.sort(function (a, b) { return (b.captured ? 10 : 0) - (a.captured ? 10 : 0) + Math.random() - 0.5; });
    const move = chess.move(moves[0]);
    lastMove = move; render();
  }

  function startGame() {
    loadChess().then(function () { chess = new window.Chess(); selected = null; lastMove = null; render(); }).catch(function () { statusEl.textContent = 'Chess could not load'; });
  }

  launcher.addEventListener('click', function () {
    const open = !widget.hidden;
    widget.hidden = open;
    launcher.setAttribute('aria-expanded', String(!open));
    if (!open && !chess) startGame();
  });
  closeButton.addEventListener('click', function () { widget.hidden = true; launcher.setAttribute('aria-expanded', 'false'); });
  newButton.addEventListener('click', startGame);
})();
