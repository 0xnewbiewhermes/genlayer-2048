const { createClient } = require("genlayer-js");
const { studionet, bradbury } = require("genlayer-js/chains");

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
  constructor(contractAddress, network = "studio", accountAddress) {
    this.network = CONFIG[network] || CONFIG.studio;
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

  async move(direction) {
    return this.client.write({
      address: this.contractAddress,
      functionName: "move",
      args: [direction],
    });
  }

  async getState() {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_state",
      args: [],
    });
  }

  async getGrid() {
    return this.client.read({
      address: this.contractAddress,
      functionName: "get_grid",
      args: [],
    });
  }
}

module.exports = { Game2048Client, CONFIG };
