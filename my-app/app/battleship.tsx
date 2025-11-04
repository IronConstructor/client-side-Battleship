import { useState, useEffect } from "react";
export default function BattleshipGame() {
	const [userBoard, setUserBoard] = useState(Array(16).fill(null));
	const [computerBoard, setComputerBoard] = useState(Array(16).fill(null));
	const [userShipSquares, setUserShipSquares] = useState<number[]>([]);
	const [phase, setPhase] = useState<"setup" | "battle" | "gameover">("setup");
	const [turn, setTurn] = useState<"user" | "computer">("user");

	useEffect(() => {
		if (userShipSquares.length === 3) {
			if (!isValidShipPlacement(userShipSquares)) {
				alert("Invalid ship placement! Ship must be 3 squares in a straight line.");
				setUserBoard(Array(16).fill(null));
				setUserShipSquares([]);
				return;
			}

			placeComputerShips();
			setPhase("battle");
		}
	}, [userShipSquares]);

	useEffect(() => {
		const userLost = userBoard.filter((val) => val === "ship").length === 0;
		const computerLost = computerBoard.filter((val) => val === "ship").length === 0;

		if (phase === "battle" && (userLost || computerLost)) {
			setPhase("gameover");
			alert(userLost ? "Computer Wins!" : "You Win!");
		}
	}, [userBoard, computerBoard]);

	useEffect(() => {
		if (phase !== "battle" || turn !== "computer") {
			return;
		}
		const timeout = setTimeout(() => {
			let attackIndex;

			do {
				attackIndex = Math.floor(Math.random() * 16);
			} while (userBoard[attackIndex] === "💣" || userBoard[attackIndex] === "🌊");

			const updatedBoard = [...userBoard];
			updatedBoard[attackIndex] = userBoard[attackIndex] === "ship" ? "💣" : "🌊";
			setUserBoard(updatedBoard);

			setTurn("user");
		}, 1000);
		return () => clearTimeout(timeout);
	}, [turn, phase, userBoard]);

	function isValidShipPlacement(squares: number[]): boolean {
		if (squares.length !== 3) return false;

		const sorted = [...squares].sort((a, b) => a - b);

		// Check horizontal
		const sameRow = sorted.every(
			(sq) => Math.floor(sq / 4) === Math.floor(sorted[0] / 4),
		);
		const isHorizontal =
			sameRow && sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1;

		// Check vertical
		const sameCol = sorted.every((sq) => sq % 4 === sorted[0] % 4);
		const isVertical =
			sameCol && sorted[1] === sorted[0] + 4 && sorted[2] === sorted[1] + 4;

		return isHorizontal || isVertical;
	}

	function placeComputerShips() {
		const directions = ["horizontal", "vertical"] as const;
		let shipPlaced = false;

		while (!shipPlaced) {
			const start = Math.floor(Math.random() * 16);
			const direction = directions[Math.floor(Math.random() * directions.length)];

			let shipSquares: number[] = [];

			if (direction === "horizontal") {
				// Prevent wrapping to next row
				const row = Math.floor(start / 4);
				if (start % 4 > 1) continue; // Ship would go off the right edge
				shipSquares = [start, start + 1, start + 2];

				// Make sure all squares are in the same row
				if (!shipSquares.every((sq) => Math.floor(sq / 4) === row)) {
					continue;
				}
			} else {
				// vertical
				if (start > 11) continue; // Ship would go off bottom edge
				shipSquares = [start, start + 4, start + 8];
			}

			// Check for overlap
			const overlap = shipSquares.some((i) => computerBoard[i] === "ship");
			if (overlap) continue;

			// Place the ship
			const newBoard = [...computerBoard];
			shipSquares.forEach((i) => (newBoard[i] = "ship"));
			setComputerBoard(newBoard);
			shipPlaced = true;
		}
	}

	function handleUserClick(i: number) {
		if (userShipSquares.length >= 3 || userBoard[i] === "ship") return;
		const updatedBoard = [...userBoard];
		updatedBoard[i] = "ship";

		setUserBoard(updatedBoard);
		setUserShipSquares([...userShipSquares, i]);
	}
	function handleComputerClick(i: number) {
		if (phase !== "battle" || turn !== "user") {
			return;
		}
		if (computerBoard[i] === "💣" || computerBoard[i] === "🌊") {
			return;
		}
		const updatedBoard = [...computerBoard];
		updatedBoard[i] = computerBoard[i] === "ship" ? "💣" : "🌊";
		setComputerBoard(updatedBoard);
		setTurn("computer");
	}

	return (
		<div>
			{" "}
			<h2 className="text-center underline uppercase font-bold"> {[phase]}</h2>
			<div className="grid grid-cols-2">
				<div className="flex flex-col items-center justify-center text-blue-600">
					<h1>User</h1>
					<Board board={userBoard} onSquareClick={(i) => handleUserClick(i)} />
				</div>
				<div className="flex flex-col items-center justify-center text-red-500">
					<h1>Computer</h1>
					<Board
						board={computerBoard}
						onSquareClick={(i) => handleComputerClick(i)}
						isComputerBoard={true}
					/>
				</div>
			</div>
		</div>
	);
}
type SquareProps = {
	value: string | null;
	onSquareClick: () => void;
};

type BoardProps = {
	board: (string | null)[];
	onSquareClick: (i: number) => void;
	isComputerBoard?: boolean;
};

function Board({ board, onSquareClick, isComputerBoard = false }: BoardProps) {
	return (
		<>
			{[0, 1, 2, 3].map((row) => (
				<div key={row} className="flex board-row">
					{[0, 1, 2, 3].map((col) => {
						const index = row * 4 + col;

						const value =
							isComputerBoard && board[index] === "ship"
								? null // hide the ship
								: board[index];

						return (
							<Square
								key={index}
								value={value}
								onSquareClick={() => onSquareClick(index)}
							/>
						);
					})}
				</div>
			))}
		</>
	);
}

function Square({ value, onSquareClick }: SquareProps) {
	let backgroundColor = "white";

	if (value === "💣") backgroundColor = "red";
	else if (value === "🌊") backgroundColor = "black";
	return (
		<>
			<button
				className="square"
				onClick={onSquareClick}
				style={{
					fontSize: "13px",
					backgroundColor,
					color: value === "🌊" ? "white" : "black",
				}}
			>
				{value}
			</button>
		</>
	);
}
