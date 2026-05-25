# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

GRID_SIZE = 4

class Game2048(gl.Contract):
    grid: str
    score: u256
    game_over: bool
    won: bool
    moves: u256

    def __init__(self):
        self.grid = "0,0,0,0;0,0,0,0;0,0,0,0;0,0,0,0"
        self.score = u256(0)
        self.game_over = False
        self.won = False
        self.moves = u256(0)

    def _parse(self, s: str) -> list:
        rows = s.split(";")
        g = []
        for r in rows:
            parts = r.split(",")
            row = []
            for p in parts:
                row.append(int(p))
            g.append(row)
        return g

    def _stringify(self, g: list) -> str:
        parts = []
        for r in range(GRID_SIZE):
            row_str = ",".join(str(g[r][c]) for c in range(GRID_SIZE))
            parts.append(row_str)
        return ";".join(parts)

    def _slide(self, row: list) -> list:
        tiles = [v for v in row if v != 0]
        merged = []
        skip = False
        for i in range(len(tiles)):
            if skip:
                skip = False
                continue
            if i + 1 < len(tiles) and tiles[i] == tiles[i + 1]:
                merged.append(tiles[i] * 2)
                skip = True
            else:
                merged.append(tiles[i])
        while len(merged) < GRID_SIZE:
            merged.append(0)
        return merged

    def _reverse(self, g: list) -> list:
        return [r[::-1] for r in g]

    def _transpose(self, g: list) -> list:
        return [list(r) for r in zip(*g)]

    @gl.public.write
    def init_game(self) -> str:
        g = self._parse(self.grid)
        g[0][0] = 2
        g[1][1] = 2
        self.grid = self._stringify(g)
        self.score = u256(0)
        self.game_over = False
        self.won = False
        self.moves = u256(0)
        return "Game initialized"

    @gl.public.write
    def move(self, direction: str) -> None:
        if self.game_over:
            raise Exception("Game already over")

        grid = self._parse(self.grid)
        score = int(self.score)

        if direction == "left":
            new_grid = [self._slide(row) for row in grid]
        elif direction == "right":
            new_grid = self._reverse([self._slide(r[::-1]) for r in grid])
        elif direction == "up":
            t = self._transpose(grid)
            moved = [self._slide(row) for row in t]
            new_grid = self._transpose(moved)
        elif direction == "down":
            t = self._transpose(grid)
            moved = self._reverse([self._slide(r[::-1]) for r in t])
            new_grid = self._transpose(moved)
        else:
            raise Exception("Invalid direction")

        if new_grid == grid:
            raise Exception("No tiles moved")

        for r in range(GRID_SIZE):
            for c in range(GRID_SIZE):
                if new_grid[r][c] != grid[r][c] and new_grid[r][c] > grid[r][c]:
                    score += new_grid[r][c]

        won = False
        for r in range(GRID_SIZE):
            for c in range(GRID_SIZE):
                if new_grid[r][c] >= 2048:
                    won = True

        self.grid = self._stringify(new_grid)
        self.score = u256(score)
        self.won = won
        self.moves = u256(int(self.moves) + 1)

    @gl.public.view
    def get_state(self) -> dict:
        return {
            "grid": self._parse(self.grid),
            "score": int(self.score),
            "game_over": self.game_over,
            "won": self.won,
            "moves": int(self.moves),
        }

    @gl.public.view
    def get_grid(self) -> list:
        return self._parse(self.grid)
