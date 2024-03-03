"use client";
import React, { useState, useEffect } from "react";
import Modal from "./Modal";

interface IPosition {
  x: number;
  y: number;
}

const gridSize = 18; // Defines the size of the grid (18x18)
const initialSnakeSpeed = 80; // Milliseconds between snake moves

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<IPosition[]>([{ x: 2, y: 2 }]); // Initial position of the snake
  const [food, setFood] = useState<IPosition>({ x: 5, y: 5 }); // Initial position of the food
  const [direction, setDirection] = useState<IPosition>({ x: 0, y: 1 }); // Initial movement direction (down)
  const [speed, setSpeed] = useState<number>(initialSnakeSpeed); // Speed of the snake
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("highScore") || "0");
    }
    return 0; // Default value if localStorage is not available
  });
  const [showModal, setShowModal] = useState<boolean>(false);

  // Randomly place food in an unoccupied position
  const placeFood = () => {
    let newFoodPosition: IPosition;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (
      snake.some(
        (segment) =>
          segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
      )
    );

    setFood(newFoodPosition);
  };

  // Game loop
  useEffect(() => {
    const handleMove = () => {
      if (gameOver) return;

      // Create a new head based on the current direction
      let newHead: IPosition = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
      };

      // Teleport to the opposite side if snake reaches the edge
      if (newHead.x >= gridSize) newHead.x = 0;
      else if (newHead.x < 0) newHead.x = gridSize - 1;
      if (newHead.y >= gridSize) newHead.y = 0;
      else if (newHead.y < 0) newHead.y = gridSize - 1;

      // Check for collisions with itself
      if (
        snake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        setShowModal(true);

        // Update high score if current score is higher
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem("highScore", score.toString());
        }

        return;
      }

      // Check if the snake eats food
      let newSnake = [...snake];
      if (newHead.x === food.x && newHead.y === food.y) {
        placeFood(); // Place new food
        setScore((prevScore) => prevScore + 1); // Increase score
      } else {
        // Move the snake forward
        newSnake.pop(); // Remove the tail
      }

      // Add the new head to the snake
      newSnake = [newHead, ...newSnake];
      setSnake(newSnake);
    };

    const intervalId = setInterval(handleMove, speed);

    return () => clearInterval(intervalId);
  }, [snake, direction, speed, gameOver]);

  // Handle keyboard input for snake direction
  useEffect(() => {
    const changeDirection = (e: KeyboardEvent) => {
      const key = e.key;

      // Prevent default action for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
      }

      const { x, y } = direction;
      switch (key) {
        case "ArrowUp":
          if (y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", changeDirection);

    return () => window.removeEventListener("keydown", changeDirection);
  }, [direction]);

  // Restart game
  const restartGame = () => {
    setSnake([{ x: 2, y: 2 }]);
    setFood({ x: 5, y: 5 });
    setDirection({ x: 0, y: 1 });
    setSpeed(initialSnakeSpeed);
    setGameOver(false);
    setScore(0);
    setShowModal(false);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center relative">
      <h1 className="text-3xl font-bold mb-8">🐍 Modern Snake Game 🐍</h1>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 30px)`,
          gridTemplateRows: `repeat(${gridSize}, 30px)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isSnake = snake.some(
            (segment) => segment.x === x && segment.y === y
          );
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`${
                isSnake ? "bg-slate-800" : isFood ? "bg-red-900" : "bg-gray-200"
              } rounded-md`}
            ></div>
          );
        })}
      </div>
      {showModal && (
        <Modal>
          <div className="text-center text-black">
            <p className="text-xl font-bold mb-4">Game Over!</p>
            <p className="mb-4">Your Score: {score}</p>
            <p>High Score: {highScore}</p>
            <button
              className="bg-slate-800 text-white px-4 py-2 rounded-md mt-4"
              onClick={restartGame}
            >
              Restart
            </button>
          </div>
        </Modal>
      )}
      <p className="absolute bottom-4 text-black">High Score: {highScore}</p>
      <p className="absolute bottom-12 text-black">Score: {score}</p>
    </div>
  );
};

export default SnakeGame;
