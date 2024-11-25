import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const API_BASE_URL = `http://localhost:5000`; // Adjust this as per your setup

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // Fetch game state on component mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/game`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setBoard(data.board);
        setIsXNext(data.isXNext);
      })
      .catch((error) => {
        console.error("Error fetching game state:", error);
      });
  }, []);

  const handleClick = async (index) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    // Save game state after each move
    try {
      await fetch(`${API_BASE_URL}/api/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: newBoard, isXNext: !isXNext }),
      });
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const status = winner ? `Congratulations: ${winner} Wins` : `Next Player: ${isXNext ? 'X' : 'O'}`;

  const handleReset = async () => {
    const initialState = { board: Array(9).fill(null), isXNext: true };
    setBoard(initialState.board);
    setIsXNext(initialState.isXNext);

    // Reset game state on the server
    try {
      await fetch(`${API_BASE_URL}/api/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialState),
      });
    } catch (error) {
      console.error("Error resetting game state:", error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Tic Tac Toe</h1>
      <div className="status">{status}</div>
      <div className="board">
        {board.map((value, index) => (
          <button key={index} className="square" onClick={() => handleClick(index)}>
            {value}
          </button>
        ))}
      </div>
      <button className="reset" onClick={handleReset}>
        Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;
