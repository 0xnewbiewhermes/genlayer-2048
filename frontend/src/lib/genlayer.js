const { createClient } = require("genlayer-js");
const { studionet, bradbury } = require("genlayer-js/chains");
const { ethers } = require("ethers");

const CONFIG = {
  studio: {
    chain: studionet,
    rpc: "https://studio.genlayer.com/api",
    chainId: 61999,
  },
  bradbury: {
    chain: bradbury,
    rpc: "https://rpc-bradbury.genlayer.com",
    chainId: 4221,
  },
};

class Game2048Client {
  constructor(contractAddress, network = "bradbury", accountAddress) {
    this.network = CONFIG[network] || CONFIG.bradbury;
    this.contractAddress = contractAddress;
    this.client = createClient({
      chain: this.network.chain,
      account: accountAddress,
    });
  }

  async initGame() {
    return this.client.write({
      address: this.contractAddress,
      functionName: "init_game",
      args: [],
    });
  }

  async move(gameId, direction) {
    return this.client.write({
      address: this.contractAddress,
      functionName: "move",
      args: [gameId, direction],
    });
  }

  async getGame(gameId) {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_game",
      args: [gameId],
    });
  }

  async getGrid(gameId) {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_grid",
      args: [gameId],
    });
  }

  async getScore(gameId) {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_score",
      args: [gameId],
    });
  }

  async getGameStatus(gameId) {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_game_status",
      args: [gameId],
    });
  }

  async getPlayerGames() {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_player_games",
      args: [],
    });
  }

  async getHighScore(playerAddress) {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_high_score",
      args: [playerAddress],
    });
  }

  async getLeaderboard() {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_leaderboard",
      args: [],
    });
  }
}

module.exports = { Game2048Client, CONFIG };
