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
  let pendingExperience = null;
  let qTable = {};
  const qTableKey = 'mohammed-profile-chess-qtable-v1';
  const learningRate = 0.22;
  const discount = 0.88;
  const exploration = 0.18;

  function loadQTable() {
    try { qTable = JSON.parse(window.localStorage.getItem(qTableKey) || '{}'); } catch (error) { qTable = {}; }
  }

  function saveQTable() {
    const keys = Object.keys(qTable);
    if (keys.length > 3200) keys.slice(0, keys.length - 3200).forEach(function (key) { delete qTable[key]; });
    try { window.localStorage.setItem(qTableKey, JSON.stringify(qTable)); } catch (error) { /* private browsing */ }
  }

  function stateKey() { return chess.fen().split(' ').slice(0, 4).join(' '); }
  function actionKey(move) { return move.from + move.to + (move.promotion || ''); }
  function qValue(state, action) { return qTable[state] && typeof qTable[state][action] === 'number' ? qTable[state][action] : 0; }

  function materialScore() {
    const values = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };
    let score = 0;
    chess.board().forEach(function (row) { row.forEach(function (piece) {
      if (piece) score += (piece.color === 'b' ? 1 : -1) * values[piece.type];
    }); });
    return score;
  }

  function updateExperience(nextState, terminal) {
    if (!pendingExperience) return;
    const oldScore = pendingExperience.material;
    const newScore = materialScore();
    let reward = Math.max(-1, Math.min(1, (newScore - oldScore) / 5));
    if (terminal) reward = isCheckmate() ? (chess.turn() === 'w' ? 1 : -1) : 0;
    const nextMoves = terminal ? [] : chess.moves({ verbose: true });
    const nextBest = nextMoves.reduce(function (best, move) { return Math.max(best, qValue(nextState, actionKey(move))); }, 0);
    const state = pendingExperience.state;
    if (!qTable[state]) qTable[state] = {};
    const oldValue = qValue(state, pendingExperience.action);
    qTable[state][pendingExperience.action] = oldValue + learningRate * (reward + (terminal ? 0 : discount * nextBest) - oldValue);
    pendingExperience = null;
    saveQTable();
  }

  function chooseRlMove(moves) {
    const state = stateKey();
    if (Math.random() < exploration) return moves[Math.floor(Math.random() * moves.length)];
    let best = -Infinity;
    let candidates = [];
    moves.forEach(function (move) {
      const value = qValue(state, actionKey(move));
      if (value > best) { best = value; candidates = [move]; }
      else if (value === best) candidates.push(move);
    });
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

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
  function isCheckmate() { return chess.isCheckmate ? chess.isCheckmate() : chess.in_checkmate(); }

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
    lastMove = move; selected = null;
    if (pendingExperience) updateExperience(stateKey(), isGameOver());
    render();
    if (!isGameOver()) window.setTimeout(makeComputerMove, 320);
  }

  function makeComputerMove() {
    if (isGameOver() || chess.turn() !== 'b') return;
    const moves = chess.moves({ verbose: true });
    const beforeState = stateKey();
    const beforeMaterial = materialScore();
    const move = chess.move(chooseRlMove(moves));
    lastMove = move; render();
    pendingExperience = { state: beforeState, action: actionKey(move), material: beforeMaterial };
    if (isGameOver()) updateExperience(stateKey(), true);
  }

  function startGame() {
    loadChess().then(function () { chess = new window.Chess(); selected = null; lastMove = null; pendingExperience = null; loadQTable(); render(); }).catch(function () { statusEl.textContent = 'Chess could not load'; });
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
