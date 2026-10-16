import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  RefreshCw,
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Check,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

// Re-export ChessApp and SudokuApp
export { ChessApp, SudokuApp } from './AppSuiteAppsBatch';

// ============================================================================
// 1. CLASSIC CHECKERS / DRAUGHTS APP
// ============================================================================

type CheckersPiece = 'r' | 'b' | 'R' | 'B' | null; // lowercase = man, uppercase = king

const INITIAL_CHECKERS: CheckersPiece[][] = [
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  ['b', null, 'b', null, 'b', null, 'b', null],
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['r', null, 'r', null, 'r', null, 'r', null],
  [null, 'r', null, 'r', null, 'r', null, 'r'],
  ['r', null, 'r', null, 'r', null, 'r', null],
];

export const CheckersApp: React.FC = () => {
  const [board, setBoard] = useState<CheckersPiece[][]>(INITIAL_CHECKERS);
  const [turn, setTurn] = useState<'red' | 'black'>('red');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState({ red: 0, black: 0 });

  const handleSquareClick = (r: number, c: number) => {
    if (selected) {
      const [fromR, fromC] = selected;
      if (fromR === r && fromC === c) {
        setSelected(null);
        return;
      }

      // Check simple move or jump
      const piece = board[fromR][fromC];
      if (!piece) return;

      const isKing = piece === 'R' || piece === 'B';
      const isRed = piece === 'r' || piece === 'R';
      const forwardDir = isRed ? -1 : 1;

      const rowDiff = r - fromR;
      const colDiff = Math.abs(c - fromC);

      // Simple 1-step diagonal move into empty square
      const isValidSimple =
        board[r][c] === null &&
        colDiff === 1 &&
        (isKing ? Math.abs(rowDiff) === 1 : rowDiff === forwardDir);

      // 2-step jump capture over opponent
      const isJump =
        board[r][c] === null &&
        colDiff === 2 &&
        (isKing ? Math.abs(rowDiff) === 2 : rowDiff === forwardDir * 2);

      const midR = (fromR + r) / 2;
      const midC = (fromC + c) / 2;
      const jumpedPiece = isJump ? board[midR][midC] : null;
      const isValidJump =
        isJump &&
        jumpedPiece !== null &&
        (isRed ? jumpedPiece.toLowerCase() === 'b' : jumpedPiece.toLowerCase() === 'r');

      if (isValidSimple || isValidJump) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[fromR][fromC] = null;

        // Check King promotion
        let finalPiece = piece;
        if (isRed && r === 0) finalPiece = 'R';
        if (!isRed && r === 7) finalPiece = 'B';
        nextBoard[r][c] = finalPiece;

        if (isValidJump) {
          nextBoard[midR][midC] = null;
          setScore(s => ({
            ...s,
            [isRed ? 'red' : 'black']: s[isRed ? 'red' : 'black'] + 1,
          }));
          toast.success(`${isRed ? 'Red' : 'Black'} captured a piece!`);
        }

        setBoard(nextBoard);
        setSelected(null);
        setTurn(t => (t === 'red' ? 'black' : 'red'));
      } else {
        // If clicking another of own pieces, change selection
        const targetPiece = board[r][c];
        if (targetPiece && (turn === 'red' ? targetPiece.toLowerCase() === 'r' : targetPiece.toLowerCase() === 'b')) {
          setSelected([r, c]);
        }
      }
    } else {
      const piece = board[r][c];
      if (piece) {
        const isRed = piece.toLowerCase() === 'r';
        if ((turn === 'red' && isRed) || (turn === 'black' && !isRed)) {
          setSelected([r, c]);
        }
      }
    }
  };

  const handleReset = () => {
    setBoard(INITIAL_CHECKERS);
    setTurn('red');
    setSelected(null);
    setScore({ red: 0, black: 0 });
    toast.info('Checkers game restarted');
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Game Header */}
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={`w-3.5 h-3.5 rounded-full ${turn === 'red' ? 'bg-rose-500' : 'bg-slate-900 border border-border'}`} />
            <span>Turn: {turn === 'red' ? 'Red' : 'Black'}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Captured: R:{score.red} | B:{score.black}
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold text-foreground transition-colors cursor-pointer"
        >
          Reset Game
        </button>
      </div>

      {/* 8x8 Checkers Board */}
      <div className="p-3 bg-stone-900 rounded-3xl shadow-xl border-4 border-stone-800">
        <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden border border-stone-700">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selected?.[0] === r && selected?.[1] === c;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleSquareClick(r, c)}
                  className={`w-10 h-10 sm:w-13 sm:h-13 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/80 ring-2 ring-amber-400'
                      : isDark
                      ? 'bg-stone-800'
                      : 'bg-stone-200'
                  }`}
                >
                  {piece && (
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-transform ${
                        piece.toLowerCase() === 'r'
                          ? 'bg-rose-600 border-rose-400 text-white shadow-rose-900/50'
                          : 'bg-slate-950 border-slate-700 text-white shadow-black/80'
                      } ${isSelected ? 'scale-110' : ''}`}
                    >
                      {piece === 'R' || piece === 'B' ? '👑' : ''}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 2. 2048 PUZZLE GAME
// ============================================================================

export const Game2048App: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(() => {
    const initial = Array(4).fill(0).map(() => Array(4).fill(0));
    initial[0][0] = 2;
    initial[1][1] = 2;
    return initial;
  });
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('tz_game_2048_best') || '0', 10);
    }
    return 0;
  });
  const [won, setWon] = useState<boolean>(false);

  const addRandomTile = (currentGrid: number[][]): number[][] => {
    const emptyCells: [number, number][] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === 0) emptyCells.push([r, c]);
      });
    });

    if (emptyCells.length === 0) return currentGrid;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const next = currentGrid.map(row => [...row]);
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
    return next;
  };

  const moveLeft = useCallback(() => {
    let moved = false;
    let addedScore = 0;
    let has2048 = false;

    const next = grid.map(row => {
      const nonZero = row.filter(v => v !== 0);
      const merged: number[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          const newVal = nonZero[i] * 2;
          merged.push(newVal);
          addedScore += newVal;
          if (newVal === 2048) has2048 = true;
          i++;
        } else {
          merged.push(nonZero[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      if (merged.some((v, idx) => v !== row[idx])) moved = true;
      return merged;
    });

    if (moved) {
      const updated = addRandomTile(next);
      setGrid(updated);
      setScore(s => {
        const nextScore = s + addedScore;
        if (nextScore > bestScore) {
          setBestScore(nextScore);
          try { localStorage.setItem('tz_game_2048_best', nextScore.toString()); } catch {}
        }
        return nextScore;
      });
      if (has2048 && !won) {
        setWon(true);
        toast.success('Congratulations! You reached 2048! 🏆');
      }
    }
  }, [grid, bestScore, won]);

  const rotateClockwise = (mat: number[][]) => {
    const n = 4;
    const res = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        res[c][n - 1 - r] = mat[r][c];
      }
    }
    return res;
  };

  const moveRight = useCallback(() => {
    let m = grid.map(r => [...r].reverse());
    // simulate left on reversed
    let addedScore = 0;
    let moved = false;
    const next = m.map(row => {
      const nonZero = row.filter(v => v !== 0);
      const merged: number[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          const newVal = nonZero[i] * 2;
          merged.push(newVal);
          i++;
        } else {
          merged.push(nonZero[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      if (merged.some((v, idx) => v !== row[idx])) moved = true;
      return merged;
    });
    const finalGrid = next.map(r => [...r].reverse());
    if (moved) {
      setGrid(addRandomTile(finalGrid));
      setScore(s => s + addedScore);
    }
  }, [grid]);

  const moveUp = useCallback(() => {
    // rotate 3 times, moveLeft, rotate 1 time
    let r1 = rotateClockwise(grid);
    let r2 = rotateClockwise(r1);
    let r3 = rotateClockwise(r2);
    // Left on r3
    let moved = false;
    let addedScore = 0;
    const next = r3.map(row => {
      const nonZero = row.filter(v => v !== 0);
      const merged: number[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          const newVal = nonZero[i] * 2;
          merged.push(newVal);
          i++;
        } else {
          merged.push(nonZero[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      if (merged.some((v, idx) => v !== row[idx])) moved = true;
      return merged;
    });
    const finalGrid = rotateClockwise(next);
    if (moved) {
      setGrid(addRandomTile(finalGrid));
      setScore(s => s + addedScore);
    }
  }, [grid]);

  const moveDown = useCallback(() => {
    let r1 = rotateClockwise(grid);
    let moved = false;
    let addedScore = 0;
    const next = r1.map(row => {
      const nonZero = row.filter(v => v !== 0);
      const merged: number[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          const newVal = nonZero[i] * 2;
          merged.push(newVal);
          i++;
        } else {
          merged.push(nonZero[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      if (merged.some((v, idx) => v !== row[idx])) moved = true;
      return merged;
    });
    let r2 = rotateClockwise(next);
    let r3 = rotateClockwise(r2);
    const finalGrid = rotateClockwise(r3);
    if (moved) {
      setGrid(addRandomTile(finalGrid));
      setScore(s => s + addedScore);
    }
  }, [grid]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowUp') moveUp();
      if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveUp, moveDown]);

  const handleReset = () => {
    const initial = Array(4).fill(0).map(() => Array(4).fill(0));
    initial[0][0] = 2;
    initial[1][1] = 2;
    setGrid(initial);
    setScore(0);
    setWon(false);
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-amber-100 text-stone-800';
      case 4: return 'bg-amber-200 text-stone-800';
      case 8: return 'bg-orange-400 text-white';
      case 16: return 'bg-orange-500 text-white';
      case 32: return 'bg-red-500 text-white';
      case 64: return 'bg-red-600 text-white';
      case 128: return 'bg-yellow-400 text-stone-900 shadow-md';
      case 256: return 'bg-yellow-500 text-stone-900 shadow-lg';
      case 512: return 'bg-yellow-600 text-white shadow-xl';
      case 1024: return 'bg-emerald-500 text-white shadow-xl';
      case 2048: return 'bg-indigo-600 text-white shadow-2xl';
      default: return 'bg-stone-800/20 text-transparent';
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      {/* Score Header */}
      <div className="w-full max-w-sm flex items-center justify-between gap-3">
        <h2 className="text-3xl font-black font-display text-foreground tracking-tight">2048</h2>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-center">
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Score</span>
            <span className="font-mono font-bold text-sm text-foreground">{score}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-center">
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Best</span>
            <span className="font-mono font-bold text-sm text-primary">{bestScore}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Grid Frame */}
      <div className="w-full max-w-sm aspect-square p-3 bg-stone-900 rounded-3xl shadow-xl border-4 border-stone-800 grid grid-cols-4 gap-2.5">
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-2xl flex items-center justify-center font-display font-extrabold text-xl sm:text-2xl transition-all duration-100 ${getTileColor(
                val
              )}`}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-2">
        <div />
        <button
          type="button"
          onClick={moveUp}
          className="p-3 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
        >
          ▲
        </button>
        <div />
        <button
          type="button"
          onClick={moveLeft}
          className="p-3 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={moveDown}
          className="p-3 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
        >
          ▼
        </button>
        <button
          type="button"
          onClick={moveRight}
          className="p-3 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
        >
          ▶
        </button>
      </div>
    </div>
  );
};


// ============================================================================
// 3. TIC-TAC-TOE & SMART AI
// ============================================================================

export const TicTacToeApp: React.FC = () => {
  const [board, setBoard] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [vsAi, setVsAi] = useState<boolean>(true);
  const [score, setScore] = useState({ x: 0, o: 0, ties: 0 });

  const calculateWinner = (sq: Array<'X' | 'O' | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
        return sq[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (idx: number) => {
    if (board[idx] || winner) return;

    const next = [...board];
    next[idx] = isXNext ? 'X' : 'O';
    setBoard(next);

    const win = calculateWinner(next);
    if (win) {
      setScore(s => ({ ...s, [win.toLowerCase()]: s[win.toLowerCase() as 'x' | 'o'] + 1 }));
      toast.success(`${win} wins! 🎉`);
      return;
    } else if (next.every(Boolean)) {
      setScore(s => ({ ...s, ties: s.ties + 1 }));
      toast.info("It's a draw!");
      return;
    }

    if (vsAi && isXNext) {
      setIsXNext(false);
      // Simple smart AI move
      setTimeout(() => {
        const emptyIndices = next.map((v, i) => (v === null ? i : -1)).filter(i => i !== -1);
        if (emptyIndices.length > 0) {
          const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          next[aiMove] = 'O';
          setBoard([...next]);
          const aiWin = calculateWinner(next);
          if (aiWin) {
            setScore(s => ({ ...s, o: s.o + 1 }));
            toast.error('AI Bot wins!');
          }
          setIsXNext(true);
        }
      }, 300);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Controls */}
      <div className="w-full max-w-xs flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setVsAi(!vsAi)}
          className={`px-3 py-1.5 rounded-xl border border-border font-bold transition-colors ${
            vsAi ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
          }`}
        >
          {vsAi ? 'Mode: vs AI Bot' : 'Mode: 2 Player'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 font-bold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 text-xs font-mono font-bold text-foreground">
        <span>X (You): {score.x}</span>
        <span>O ({vsAi ? 'AI' : 'P2'}): {score.o}</span>
        <span>Ties: {score.ties}</span>
      </div>

      {/* 3x3 Board */}
      <div className="p-3 bg-card border-2 border-border/80 rounded-3xl shadow-lg grid grid-cols-3 gap-2">
        {board.map((val, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(idx)}
            className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center text-4xl font-black font-display transition-all cursor-pointer ${
              val === 'X'
                ? 'bg-blue-600/10 text-blue-600'
                : val === 'O'
                ? 'bg-rose-600/10 text-rose-600'
                : 'bg-secondary/40 hover:bg-secondary/80 text-transparent'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
};


// ============================================================================
// 4. MEMORY CARD MATCH PUZZLE
// ============================================================================

const EMOJIS = ['🚀', '🎯', '⚡', '🔥', '💎', '🎉', '🌟', '🦄'];

export const MemoryMatchApp: React.FC = () => {
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);

  const initGame = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlipped([]);
        if (newCards.every(c => c.isMatched)) {
          toast.success('Congratulations! You matched all pairs! 🏆');
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      {/* Game Bar */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">Moves: {moves}</span>
        <button
          type="button"
          onClick={initGame}
          className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary font-bold text-foreground transition-colors cursor-pointer"
        >
          Restart
        </button>
      </div>

      {/* 4x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-sm">
        {cards.map(card => (
          <button
            key={card.id}
            type="button"
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-200 shadow-xs cursor-pointer border ${
              card.isFlipped || card.isMatched
                ? 'bg-primary/10 border-primary/40 rotate-y-180'
                : 'bg-card hover:bg-secondary border-border'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
};
