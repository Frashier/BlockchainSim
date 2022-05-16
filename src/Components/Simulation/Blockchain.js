import sha1 from "crypto-js/sha1";
import Hex from "crypto-js/enc-hex";

function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function sha1HexHash(toHash) {
  return Hex.stringify(sha1(toHash));
}

const SHA1_LENGTH = 160;
const MAX_NONCE = 1000000;
const BLOCK_SIZE = 5;

// Enum representing all possible block types.
// Block types are used as a helper variable in
// Block instances to determine what kind of
// interactions are possible with them
class BlockType {
  static Orphan = new BlockType("orphan");
  static Genesis = new BlockType("genesis");
  static Regular = new BlockType("regular");

  constructor(type) {
    this.type = type;
  }

  valueOf() {
    return this.type;
  }

  toString() {
    return `${this.type}`;
  }
}

class Transaction {
  constructor(index, timestamp) {
    this.index = index;
    this.timestamp = timestamp;
    this.hash = sha1HexHash(this.index + this.timestamp);
  }

  static generateRandomTransactions(n) {
    let txArray = [];
    for (let i = 0; i < n; i++) {
      txArray.push(new Transaction(i, Date.now()));
    }
    return txArray;
  }

  toString() {
    return `${this.index}.\n${this.timestamp}\n${this.hash}`;
  }
}

class Block {
  constructor(
    type,
    prevHash,
    timestamp,
    nonce,
    miner,
    weight = 0,
    transactions
  ) {
    this.type = type; // Helper variable for simulation implementation
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.miner = miner;
    this.weight = weight;

    // Don't generate txs for genesis.
    // Generate txs for block if txs
    // haven't been passed in constructor.
    if (type === BlockType.Genesis) {
      this.transactions = [];
    } else {
      this.transactions = transactions
        ? transactions
        : Transaction.generateRandomTransactions(BLOCK_SIZE);
    }
  }

  changeType(type) {
    if (this.type === BlockType.Genesis) {
      return this;
    }

    return new Block(
      type,
      this.prevHash,
      this.timestamp,
      this.nonce,
      this.miner,
      // The bigger the difference betwen block's weight
      // and max blockchain weight, the more fundamented
      // the block in blockchain is
      this.weight,
      this.transactions
    );
  }

  hash(nonce) {
    const toHash = (
      this.prevHash +
      this.timestamp +
      this.transactions +
      this.nonce +
      nonce
    ).toString();

    return sha1HexHash(toHash);
  }

  tryMine(difficulty) {
    let nonce = getRandomInt(MAX_NONCE);
    let hash = this.hash(nonce);

    // SHA1 algorithm has size of 160 bits.
    // The difficulty level is the amount of zeros
    // starting at the most significant bit.
    // The difference between SHA1 hash bit count
    // and the difficulty level is the position of the
    // first non-zero bit starting from the most significant one
    if (hex2bin(hash).length > SHA1_LENGTH - difficulty) {
      hash = "";
    }

    return { nonce: nonce, hash: hash };
  }
}

class Blockchain {
  static blockDifficultyInterval = 5;

  constructor(difficulty, blocks) {
    if (blocks === undefined) {
      this.blocks = [new Block(BlockType.Genesis, 0, Date.now(), 0, "genesis")];
    } else this.blocks = blocks;

    this.difficulty = difficulty;
  }

  get maxWeight() {
    return Math.max(...this.blocks.map((block) => block.weight));
  }

  // Make every block an orphan starting from
  // an unverified block
  orphanBlock(block) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    let index = newBlocks.findIndex((b) => b.prevHash === block.prevHash);

    // Mark every child of the unverified block as orphan
    // TODO: change to use children of
    let nextBlocks = [newBlocks[index]];
    while (nextBlocks.length !== 0) {
      for (const possibleOrphan of newBlocks) {
        if (
          nextBlocks[0].hash(possibleOrphan.nonce) === possibleOrphan.prevHash
        ) {
          nextBlocks.push(possibleOrphan);
        }
      }

      index = newBlocks.findIndex(
        (block) => block.prevHash === nextBlocks[0].prevHash
      );
      newBlocks[index] = newBlocks[index].changeType(BlockType.Orphan);
      nextBlocks.shift();
    }

    return new Blockchain(this.difficulty, newBlocks);
  }

  clearOrphans() {
    return new Blockchain(
      this.difficulty,
      this.blocks.filter((block) => block.type !== BlockType.Orphan)
    );
  }

  findOrphans() {
    let newBlockchain = this;

    for (const block of newBlockchain.blocks) {
      if (this.longestBranchWeight(block) < this.maxWeight - 1) {
        newBlockchain.orphanBlock(block);
      }
    }

    return newBlockchain;
  }

  longestBranchWeight(block) {
    let blockStack = [block];
    let maxWeight = block.weight;

    while (blockStack.length != 0) {
      const currentBlock = blockStack.shift();
      const children = this.childrenOf(currentBlock);
      blockStack = children.concat(blockStack);

      if (children.length === 0 && currentBlock.weight > maxWeight) {
        maxWeight = currentBlock.weight;
      }
    }

    return maxWeight;
  }

  childrenOf(block) {
    return this.blocks.filter(
      (tempBlock) => block.hash(tempBlock.nonce) === tempBlock.prevHash
    );
  }

  addBlock(block) {
    let difficulty = this.difficulty;
    if (
      this.longestBranchWeight(this.blocks[0]) %
        Blockchain.blockDifficultyInterval ===
      0
    ) {
      difficulty++;
    }

    let newBlockchain = new Blockchain(difficulty, [...this.blocks, block]);
    newBlockchain = newBlockchain.findOrphans();

    return newBlockchain;
  }
}

export { Blockchain, Block, BlockType };
