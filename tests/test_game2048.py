#!/usr/bin/env python3
"""Tests for Game2048 contract logic."""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# We can't actually run the contract locally since it needs genlayer VM,
# but we can test the game logic functions in isolation.


def slide_left(row):
    """Simulate the contract's _slide_left function."""
    tiles = [v for v in row if v != 0]
    merged = []
    skip = False
    score = 0

    for i in range(len(tiles)):
        if skip:
            skip = False
            continue
        if i + 1 < len(tiles) and tiles[i] == tiles[i + 1]:
            merged.append(tiles[i] * 2)
            score += tiles[i] * 2
            skip = True
        else:
            merged.append(tiles[i])

    while len(merged) < 4:
        merged.append(0)

    return merged, score


def transpose(grid):
    return [list(row) for row in zip(*grid)]


def move_left(grid):
    new_grid = []
    total_score = 0
    for row in grid:
        slid, score = slide_left(row)
        new_grid.append(slid)
        total_score += score
    return new_grid, total_score


def move_right(grid):
    new_grid = []
    total_score = 0
    for row in grid:
        slid, score = slide_left(row[::-1])
        new_grid.append(slid[::-1])
        total_score += score
    return new_grid, total_score


def move_up(grid):
    t = transpose(grid)
    moved, score = move_left(t)
    return transpose(moved), score


def move_down(grid):
    t = transpose(grid)
    moved, score = move_right(t)
    return transpose(moved), score


def check_game_over(grid):
    for r in range(4):
        for c in range(4):
            if grid[r][c] == 0:
                return False
            if c + 1 < 4 and grid[r][c] == grid[r][c + 1]:
                return False
            if r + 1 < 4 and grid[r][c] == grid[r + 1][c]:
                return False
    return True


def check_win(grid):
    for r in range(4):
        for c in range(4):
            if grid[r][c] >= 2048:
                return True
    return False


def test_slide_left_basic():
    result, score = slide_left([2, 2, 4, 4])
    assert result == [4, 8, 0, 0], f"Expected [4,8,0,0] got {result}"
    assert score == 12, f"Expected score 12 got {score}"
    print("✓ test_slide_left_basic")


def test_slide_left_no_merge():
    result, score = slide_left([2, 4, 8, 16])
    assert result == [2, 4, 8, 16]
    assert score == 0
    print("✓ test_slide_left_no_merge")


def test_slide_left_gap():
    result, score = slide_left([2, 0, 0, 2])
    assert result == [4, 0, 0, 0], f"Expected [4,0,0,0] got {result}"
    assert score == 4
    print("✓ test_slide_left_gap")


def test_slide_left_triple():
    result, score = slide_left([2, 2, 2, 0])
    assert result == [4, 2, 0, 0], f"Expected [4,2,0,0] got {result}"
    assert score == 4
    print("✓ test_slide_left_triple")


def test_move_right():
    grid = [[0, 0, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    result, score = move_right(grid)
    assert result[0] == [0, 0, 0, 4], f"Expected [0,0,0,4] got {result[0]}"
    assert score == 4
    print("✓ test_move_right")


def test_move_up():
    grid = [[2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    result, score = move_up(grid)
    assert result[0] == [4, 0, 0, 0], f"Expected [4,0,0,0] got {result[0]}"
    assert result[1] == [0, 0, 0, 0]
    assert score == 4
    print("✓ test_move_up")


def test_move_down():
    grid = [[2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    result, score = move_down(grid)
    assert result[3] == [4, 0, 0, 0], f"Expected [4,0,0,0] got {result[3]}"
    assert result[0] == [0, 0, 0, 0]
    assert score == 4
    print("✓ test_move_down")


def test_game_over_detect():
    game_over_grid = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
    ]
    assert check_game_over(game_over_grid), "Should be game over"
    print("✓ test_game_over_detect")


def test_not_game_over():
    grid = [
        [2, 4, 8, 16],
        [16, 0, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
    ]
    assert not check_game_over(grid), "Should not be game over (has 0)"
    print("✓ test_not_game_over")


def test_win():
    grid = [
        [2, 4, 8, 16],
        [16, 2048, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
    ]
    assert check_win(grid), "Should detect win"
    print("✓ test_win")


if __name__ == "__main__":
    test_slide_left_basic()
    test_slide_left_no_merge()
    test_slide_left_gap()
    test_slide_left_triple()
    test_move_right()
    test_move_up()
    test_move_down()
    test_game_over_detect()
    test_not_game_over()
    test_win()
    print("\n✅ All tests passed!")
