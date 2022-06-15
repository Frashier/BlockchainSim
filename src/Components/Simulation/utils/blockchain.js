import sha1 from "crypto-js/sha1";
import Hex from "crypto-js/enc-hex";

function sha1HexHash(toHash) {
  return Hex.stringify(sha1(toHash.toString()));
}

function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const SHA1_LENGTH = 160;
const MAX_NONCE = 1000000;
const BLOCK_SIZE = 5;
const MAX_DIFFICULTY = 10;

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

    this.transactions = transactions
      ? transactions
      : Transaction.generateRandomTransactions(BLOCK_SIZE);

    this.merkleTreeRoot = this.#createMerkleTreeRoot();
  }

  // Private method used for creating merkle tree root
  #createMerkleTreeRoot() {
    let currentLevel = [...this.transactions.map((tx) => tx.hash)];
    let nextLevel = [];

    while (nextLevel.length !== 1) {
      nextLevel = [];

      const n = currentLevel.length;
      for (let i = 0; i < n; i = i + 2) {
        const hashA = currentLevel[i];
        let hashB;
        if (i + 1 === n) {
          hashB = hashA;
        } else {
          hashB = currentLevel[i + 1];
        }
        nextLevel.push(sha1HexHash(hashA + hashB));
      }

      currentLevel = [...nextLevel];
    }

    return nextLevel[0];
  }

  verify() {
    return this.merkleTreeRoot === this.#createMerkleTreeRoot();
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
      // The bigger the difference between block's weight
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
      this.nonce +
      this.merkleTreeRoot +
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
    // Guard against increasing the difficulty
    // past the maximum amount
    if (difficulty > MAX_DIFFICULTY) {
      this.difficulty = MAX_DIFFICULTY;
    } else {
      this.difficulty = difficulty;
    }

    // Create genesis
    if (blocks === undefined) {
      const dummyBlock = new Block(BlockType.Regular, 0, Date.now(), 0, "");
      let mineInfo;

      do {
        mineInfo = dummyBlock.tryMine(this.difficulty);
      } while (!mineInfo.hash);

      this.blocks = [
        new Block(BlockType.Genesis, 0, Date.now(), mineInfo.nonce, "genesis"),
      ];
    } else this.blocks = blocks;
  }

  get maxWeight() {
    return Math.max(...this.blocks.map((block) => block.weight));
  }

  // Chenge type of every child of the block
  // to orphan including the block passed
  orphanBlock(block) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    let index = newBlocks.findIndex((b) => b.prevHash === block.prevHash);

    // Orphan every child of orphaned block
    let blockStack = [newBlocks[index]];
    while (blockStack.length !== 0) {
      const currentBlock = blockStack.shift();
      const possibleOrphans = this.childrenOf(currentBlock);
      blockStack = [...possibleOrphans, ...blockStack];

      index = newBlocks.findIndex(
        (block) => block.prevHash === currentBlock.prevHash
      );
      newBlocks[index] = newBlocks[index].changeType(BlockType.Orphan);
    }

    return new Blockchain(this.difficulty, newBlocks);
  }

  // Delete orphans from a blockchain object
  clearOrphans() {
    return new Blockchain(
      this.difficulty,
      this.blocks.filter((block) => block.type !== BlockType.Orphan)
    );
  }

  // Look for blocks to be orphaned and orphan them
  findOrphans() {
    let newBlockchain = this;

    for (const block of newBlockchain.blocks) {
      if (this.longestBranchWeight(block) < this.maxWeight - 1) {
        newBlockchain.orphanBlock(block);
      }
    }

    return newBlockchain;
  }

  // Get the maximum weight of a branch
  // starting from given block
  longestBranchWeight(block) {
    let blockStack = [block];
    let maxWeight = block.weight;

    while (blockStack.length !== 0) {
      const currentBlock = blockStack.shift();
      const children = this.childrenOf(currentBlock);
      blockStack = [...children, ...blockStack];

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
    if ((this.maxWeight + 1) % Blockchain.blockDifficultyInterval === 0) {
      difficulty++;
    }

    let newBlockchain = new Blockchain(difficulty, [...this.blocks, block]);
    newBlockchain = newBlockchain.findOrphans();

    return newBlockchain;
  }
}

export { Blockchain, Block, BlockType };
