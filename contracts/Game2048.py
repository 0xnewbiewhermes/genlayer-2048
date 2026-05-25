# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

GRID_SIZE = 4

@allow_storage
@dataclass
class GameState:
    grid: str
    score: u256
    game_over: bool
    won: bool
    player: str
    game_id: str
    moves: u256

class Game2048(gl.Contract):
    games: TreeMap[str, GameState]
    high_scores: TreeMap[Address, u256]
    game_counter: u256

    def __init__(self):
        self.game_counter = u256(0)

    def _create_empty_grid(self) -> list:
        return [[0] * GRID_SIZE for _ in range(GRID_SIZE)]

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

    def _reverse_rows(self, g: list) -> list:
        return [r[::-1] for r in g]

    def _transpose(self, g: list) -> list:
        return [list(r) for r in zip(*g)]

    def _grid_str(self, g: list) -> str:
        return str(g)

    def _parse_grid(self, s: str) -> list:
        return eval(s)

    @gl.public.write
    def init_game(self) -> str:
        sender = gl.message.sender_address
        game_id = "2048_" + sender.as_hex[:8] + "_" + str(int(self.game_counter) + 1)

        g = self._create_empty_grid()
        g[0][0] = 2
        g[1][1] = 2

        state = GameState(
            grid=self._grid_str(g),
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
        if game_id not in self.games:
            raise Exception("Game not found")

        state = self.games[game_id]
        if gl.message.sender_address.as_hex != state.player:
            raise Exception("Not your game")
        if state.game_over:
            raise Exception("Game already over")

        grid = self._parse_grid(state.grid)
        score = int(state.score)

        if direction == "left":
            new_grid = [self._slide(row) for row in grid]
        elif direction == "right":
            new_grid = self._reverse_rows([self._slide(r[::-1]) for r in grid])
        elif direction == "up":
            t = self._transpose(grid)
            moved = [self._slide(row) for row in t]
            new_grid = self._transpose(moved)
        elif direction == "down":
            t = self._transpose(grid)
            moved = self._reverse_rows([self._slide(r[::-1]) for r in t])
            new_grid = self._transpose(moved)
        else:
            raise Exception("Invalid direction. Use: left, right, up, down")

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

        state.grid = self._grid_str(new_grid)
        state.score = u256(score)
        state.won = won
        state.moves = u256(int(state.moves) + 1)
        self.games[game_id] = state

        if score > int(self.high_scores.get(gl.message.sender_address, 0)):
            self.high_scores[gl.message.sender_address] = u256(score)

    @gl.public.view
    def get_game(self, game_id: str) -> dict:
        if game_id not in self.games:
            return {"error": "Game not found"}
        state = self.games[game_id]
        return {
            "grid": self._parse_grid(state.grid),
            "score": int(state.score),
            "game_over": state.game_over,
            "won": state.won,
            "player": state.player,
            "game_id": state.game_id,
            "moves": int(state.moves),
        }

    @gl.public.view
    def get_high_score(self, player: str) -> int:
        return int(self.high_scores.get(Address(player), 0))
