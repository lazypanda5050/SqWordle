import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const ANSWER = 'SQUIRTLE';
const MAX_GUESSES = 6;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function scoreGuess(guess) {
  const result = Array(ANSWER.length).fill('absent');
  const remaining = {};

  for (let i = 0; i < ANSWER.length; i += 1) {
    if (guess[i] === ANSWER[i]) {
      result[i] = 'correct';
    } else {
      remaining[ANSWER[i]] = (remaining[ANSWER[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < ANSWER.length; i += 1) {
    if (result[i] === 'correct') continue;

    if (remaining[guess[i]]) {
      result[i] = 'present';
      remaining[guess[i]] -= 1;
    }
  }

  return result;
}

function getKeyStatuses(guesses) {
  const rank = { absent: 1, present: 2, correct: 3 };
  const statuses = {};

  guesses.forEach((guess) => {
    scoreGuess(guess).forEach((status, index) => {
      const letter = guess[index];
      if (!statuses[letter] || rank[status] > rank[statuses[letter]]) {
        statuses[letter] = status;
      }
    });
  });

  return statuses;
}

function App() {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('Guess the only 8-letter answer that matters.');

  const won = guesses.includes(ANSWER);
  const lost = guesses.length === MAX_GUESSES && !won;
  const gameOver = won || lost;
  const keyStatuses = getKeyStatuses(guesses);

  function submitGuess() {
    if (gameOver) return;

    if (currentGuess.length !== ANSWER.length) {
      setMessage(`Squirtle needs ${ANSWER.length} letters.`);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === ANSWER) {
      setMessage('It was Squirtle. Of course it was Squirtle.');
    } else if (nextGuesses.length === MAX_GUESSES) {
      setMessage('The answer was SQUIRTLE. It was always SQUIRTLE.');
    } else {
      setMessage('Not Squirtle enough. Try again.');
    }
  }

  function addLetter(letter) {
    if (gameOver || currentGuess.length >= ANSWER.length) return;
    setCurrentGuess((guess) => guess + letter);
  }

  function backspace() {
    if (gameOver) return;
    setCurrentGuess((guess) => guess.slice(0, -1));
  }

  function resetGame() {
    setCurrentGuess('');
    setGuesses([]);
    setMessage('Guess the only 8-letter answer that matters.');
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Enter') {
        submitGuess();
        return;
      }

      if (event.key === 'Backspace') {
        backspace();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        addLetter(event.key.toUpperCase());
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver, guesses]);

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const committedGuess = guesses[rowIndex];
    const rowGuess = committedGuess || (rowIndex === guesses.length ? currentGuess : '');
    const rowScore = committedGuess ? scoreGuess(committedGuess) : [];

    return Array.from({ length: ANSWER.length }, (_, tileIndex) => ({
      letter: rowGuess[tileIndex] || '',
      status: rowScore[tileIndex] || '',
    }));
  });

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">SqWordle</p>
        <h1>Wordle, but damp.</h1>
        <p className="intro">Six chances, eight letters, one tiny turtle wearing sunglasses in spirit.</p>
      </section>

      <section className="board" aria-label="SqWordle board">
        {rows.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((tile, tileIndex) => (
              <div className={`tile ${tile.status}`} key={tileIndex}>
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </section>

      <p className="message" role="status">{message}</p>

      <section className="keyboard" aria-label="Keyboard">
        <div className="key-row">
          {'QWERTYUIOP'.split('').map((letter) => (
            <button className={`key ${keyStatuses[letter] || ''}`} key={letter} onClick={() => addLetter(letter)}>
              {letter}
            </button>
          ))}
        </div>
        <div className="key-row middle">
          {'ASDFGHJKL'.split('').map((letter) => (
            <button className={`key ${keyStatuses[letter] || ''}`} key={letter} onClick={() => addLetter(letter)}>
              {letter}
            </button>
          ))}
        </div>
        <div className="key-row">
          <button className="key wide" onClick={submitGuess}>Enter</button>
          {'ZXCVBNM'.split('').map((letter) => (
            <button className={`key ${keyStatuses[letter] || ''}`} key={letter} onClick={() => addLetter(letter)}>
              {letter}
            </button>
          ))}
          <button className="key wide" onClick={backspace}>Delete</button>
        </div>
      </section>

      {gameOver && <button className="reset" onClick={resetGame}>Play again</button>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
