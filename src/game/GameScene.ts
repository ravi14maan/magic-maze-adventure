import Phaser from "phaser";
import { getCharacter, type CharacterId } from "../data/characters";

const TILE_SIZE = 40;
const OFFSET_X = 20;
const OFFSET_Y = 20;

// "." is walkable and "#" is a wall. This is a prototype level only.
const MAZE = [
  "###############",
  "#.............#",
  "###.#######.###",
  "#...#.....#...#",
  "#.###.###.###.#",
  "#.....#.......#",
  "#.###.#.#####.#",
  "#...#.#.....#.#",
  "###.#.###.#.#.#",
  "#.....#...#...#",
  "###############"
] as const;

export class GameScene extends Phaser.Scene {
  private readonly getSelectedCharacter: () => CharacterId;
  private readonly reportStatus: (message: string) => void;
  private player!: Phaser.GameObjects.Container;
  private playerColumn = 1;
  private playerRow = 1;
  private completed = false;

  constructor(
    getSelectedCharacter: () => CharacterId,
    reportStatus: (message: string) => void
  ) {
    super("MazeScene");
    this.getSelectedCharacter = getSelectedCharacter;
    this.reportStatus = reportStatus;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#fff9fc");

    MAZE.forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        const x = this.cellX(columnIndex);
        const y = this.cellY(rowIndex);
        const isExit = columnIndex === 13 && rowIndex === 9;

        if (cell === "#") {
          this.add.rectangle(x, y, TILE_SIZE - 2, TILE_SIZE - 2, 0x665477)
            .setStrokeStyle(1, 0x806c91);
        } else {
          this.add.rectangle(
            x,
            y,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
            isExit ? 0xc9efd9 : 0xffeaf3
          ).setStrokeStyle(1, 0xf5cddd);

          if (isExit) {
            this.add.text(x, y - 10, "EXIT", {
              fontFamily: "Trebuchet MS, sans-serif",
              fontSize: "12px",
              fontStyle: "bold",
              color: "#286847"
            }).setOrigin(0.5);
          }
        }
      });
    });

    this.player = this.add.container(this.cellX(1), this.cellY(1));
    this.drawPlayer();
    this.add.text(320, 480, "Reach the green EXIT tile  •  Arrow keys or W A S D", {
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "14px",
      color: "#665477"
    }).setOrigin(0.5);

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") this.move(0, -1);
      if (key === "arrowdown" || key === "s") this.move(0, 1);
      if (key === "arrowleft" || key === "a") this.move(-1, 0);
      if (key === "arrowright" || key === "d") this.move(1, 0);
    });

    this.reportStatus("Choose a character, then find your way to the exit!");
  }

  move(deltaColumn: number, deltaRow: number): void {
    if (this.completed || !this.player) return;

    const nextColumn = this.playerColumn + deltaColumn;
    const nextRow = this.playerRow + deltaRow;

    if (
      nextRow < 0 ||
      nextRow >= MAZE.length ||
      nextColumn < 0 ||
      nextColumn >= MAZE[0].length ||
      MAZE[nextRow][nextColumn] === "#"
    ) {
      return;
    }

    this.playerColumn = nextColumn;
    this.playerRow = nextRow;
    this.player.setPosition(this.cellX(nextColumn), this.cellY(nextRow));

    if (nextColumn === 13 && nextRow === 9) {
      this.completed = true;
      this.reportStatus("🌟 Maze complete! Great exploring. Press Restart to play again.");
    }
  }

  setCharacter(id: CharacterId): void {
    if (!this.player) return;
    this.player.removeAll(true);
    this.drawPlayer(id);
  }

  restart(): void {
    if (!this.player) return;
    this.playerColumn = 1;
    this.playerRow = 1;
    this.completed = false;
    this.player.setPosition(this.cellX(1), this.cellY(1));
    this.setCharacter(this.getSelectedCharacter());
    this.reportStatus("New maze started. Good luck!");
  }

  private drawPlayer(id: CharacterId = this.getSelectedCharacter()): void {
    const character = getCharacter(id);
    this.player.add(
      this.add.circle(0, 0, 15, character.colour).setStrokeStyle(3, 0xffffff),
      this.add.text(0, -1, character.token, {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff"
      }).setOrigin(0.5)
    );
  }

  private cellX(column: number): number {
    return OFFSET_X + column * TILE_SIZE + TILE_SIZE / 2;
  }

  private cellY(row: number): number {
    return OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
  }
}
