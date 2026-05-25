# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from dataclasses import dataclass
from genlayer import *
import random


GRID_SIZE = 4


@allow_storage
@dataclass
class GameState:
    grid: str              # JSON string: [[int]] 4x4
    score: u256
    game_over: bool
    won: bool
    player: str
    game_id: str
    moves: u256


class Game2048(gl.Contract):
    games: TreeMap[str, GameState]  # game_id -> GameState
    high_scores: TreeMap[Address, u256]
    game_counter: u256

    def __init__(self):
        self.game_counter = u256(0)

    # ============ GAME LOGIC ============

    def _init_grid(self) -> list:
        """Create empty 4x4 grid and add 2 random tiles."""
        grid = [[0] * GRID_SIZE for _ in range(GRID_SIZE)]

        def place_random() -> str:
            empty = []
            for r in range(GRID_SIZE):
                for c in range(GRID_SIZE):
                    if grid[r][c] == 0:
                        empty.append((r, c))
            if not empty:
                return json.dumps(grid)

            pos = random.choice(empty)
            val = 2 if random.random() < 0.9 else 4
            grid[pos[0]][pos[1]] = val
            return json.dumps(grid)

        result = json.loads(gl.eq_principle.strict_eq(place_random))
        return result

    def _slide_left(self, row: list) -> tuple:
        """Slide a single row to the left. Returns (new_row, score_gained)."""
        # Remove zeros
        tiles = [v for v in row if v != 0]
        score_gained = 0
        merged = []
        skip = False

        for i in range(len(tiles)):
            if skip:
                skip = False
                continue
            if i + 1 < len(tiles) and tiles[i] == tiles[i + 1]:
                merged.append(tiles[i] * 2)
                score_gained += tiles[i] * 2
                skip = True
            else:
                merged.append(tiles[i])

        while len(merged) < GRID_SIZE:
            merged.append(0)

        return merged, score_gained

    def _slide_right(self, row: list) -> tuple:
        rev = row[::-1]
        slid, score = self._slide_left(rev)
        return slid[::-1], score

    def _transpose(self, grid: list) -> list:
        return [list(row) for row in zip(*grid)]

    def _reverse_rows(self, grid: list) -> list:
        return [row[::-1] for row in grid]

    def _move_left(self, grid: list) -> tuple:
        """Slide entire grid left. Returns (new_grid, total_score, changed)."""
        new_grid = []
        total_score = 0
        changed = False

        for row in grid:
            slid, score = self._slide_left(row)
            new_grid.append(slid)
            total_score += score
            if slid != row:
                changed = True

        return new_grid, total_score, changed

    def _move_right(self, grid: list) -> tuple:
        new_grid = []
        total_score = 0
        changed = False

        for row in grid:
            slid, score = self._slide_right(row)
            new_grid.append(slid)
            total_score += score
            if slid != row:
                changed = True

        return new_grid, total_score, changed

    def _move_up(self, grid: list) -> tuple:
        t = self._transpose(grid)
        moved, score, changed = self._move_left(t)
        return self._transpose(moved), score, changed

    def _move_down(self, grid: list) -> tuple:
        t = self._transpose(grid)
        moved, score, changed = self._move_right(t)
        return self._transpose(moved), score, changed

    def _spawn_tile(self, grid: list) -> list:
        """Add one random tile (2 or 4) in an empty cell."""

        def pick_spot() -> str:
            flat = []
            for r in range(GRID_SIZE):
                for c in range(GRID_SIZE):
                    if grid[r][c] == 0:
                        flat.append((r, c))
            if not flat:
                return json.dumps(grid)

            pos = random.choice(flat)
            val = 2 if random.random() < 0.9 else 4
            grid[pos[0]][pos[1]] = val
            return json.dumps(grid)

        return json.loads(gl.eq_principle.strict_eq(pick_spot))

    def _check_game_over(self, grid: list) -> bool:
        """Return True if no moves possible."""
        for r in range(GRID_SIZE):
            for c in range(GRID_SIZE):
                if grid[r][c] == 0:
                    return False
                if c + 1 < GRID_SIZE and grid[r][c] == grid[r][c + 1]:
                    return False
                if r + 1 < GRID_SIZE and grid[r][c] == grid[r + 1][c]:
                    return False
        return True

    def _check_win(self, grid: list) -> bool:
        for r in range(GRID_SIZE):
            for c in range(GRID_SIZE):
                if grid[r][c] >= 2048:
                    return True
        return False

    # ============ PUBLIC FUNCTIONS ============

    @gl.public.write
    def init_game(self) -> str:
        """Start a new game. Returns game_id."""
        sender = gl.message.sender_address
        game_id = f"2048_{sender.as_hex[:8]}_{int(self.game_counter) + 1}"

        grid = self._init_grid()

        state = GameState(
            grid=json.dumps(grid),
            score=u256(0),
            game_over=False,
            won=False,
            player=sender.as_hex,
            game_id=game_id,
            moves=u256(0),
        )

        self.games[game_id] = state
        self.game_counter = u256(int(self.game_counter) + 1)

        return game_id

    @gl.public.write
    def move(self, game_id: str, direction: str) -> None:
        """Make a move. direction: 'up', 'down', 'left', 'right'."""
        if game_id not in self.games:
            raise Exception("Game not found")

        state = self.games[game_id]

        if gl.message.sender_address.as_hex != state.player:
            raise Exception("Not your game")

        if state.game_over:
            raise Exception("Game already over")

        grid = json.loads(state.grid)
        score = int(state.score)
        dir_map = {
            "left": self._move_left,
            "right": self._move_right,
            "up": self._move_up,
            "down": self._move_down,
        }

        if direction not in dir_map:
            raise Exception("Invalid direction. Use: left, right, up, down")

        move_fn = dir_map[direction]
        new_grid, gained_score, changed = move_fn(grid)

        if not changed:
            raise Exception("No tiles moved")

        score += gained_score

        # Check win before spawning
        won = self._check_win(new_grid)

        # Spawn new tile
        new_grid = self._spawn_tile(new_grid)

        # Check game over
        game_over = self._check_game_over(new_grid)

        # Update state
        state.grid = json.dumps(new_grid)
        state.score = u256(score)
        state.game_over = game_over
        state.won = won
        state.moves = u256(int(state.moves) + 1)
        self.games[game_id] = state

        # Update high score
        if score > int(self.high_scores.get(gl.message.sender_address, 0)):
            self.high_scores[gl.message.sender_address] = u256(score)

    @gl.public.view
    def get_game(self, game_id: str) -> dict:
        """Get full game state."""
        if game_id not in self.games:
            return {"error": "Game not found"}

        state = self.games[game_id]
        return {
            "grid": json.loads(state.grid),
            "score": int(state.score),
            "game_over": state.game_over,
            "won": state.won,
            "player": state.player,
            "game_id": state.game_id,
            "moves": int(state.moves),
        }

    @gl.public.view
    def get_grid(self, game_id: str) -> list:
        if game_id not in self.games:
            return []
        return json.loads(self.games[game_id].grid)

    @gl.public.view
    def get_score(self, game_id: str) -> int:
        if game_id not in self.games:
            return 0
        return int(self.games[game_id].score)

    @gl.public.view
    def get_game_status(self, game_id: str) -> dict:
        if game_id not in self.games:
            return {"error": "Not found"}
        state = self.games[game_id]
        return {
            "game_over": state.game_over,
            "won": state.won,
            "moves": int(state.moves),
        }

    @gl.public.view
    def get_player_games(self) -> list:
        """Get all game IDs for the caller."""
        sender = gl.message.sender_address.as_hex
        result = []
        for gid, state in self.games.items():
            if state.player == sender:
                result.append(gid)
        return result

    @gl.public.view
    def get_high_score(self, player: str) -> int:
        return int(self.high_scores.get(Address(player), 0))

    @gl.public.view
    def get_leaderboard(self) -> dict:
        """Returns top scores: {address: score}"""
        result = {}
        for addr, score in self.high_scores.items():
            result[addr.as_hex] = int(score)
        # Sort by score descending, take top 10
        sorted_scores = sorted(result.items(), key=lambda x: -x[1])[:10]
        return dict(sorted_scores)
