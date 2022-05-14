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
  static Head = new BlockType("head");

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
    transactions,
    branchable = true
  ) {
    this.type = type; // Helper variable for simulation implementation
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.miner = miner;
    this.branchable = branchable;

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
      this.transactions,
      type === BlockType.Orphan ? false : this.branchable
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

  // TODO:
  // verify block
  // verify blockchain
  tryMine(difficulty) {
    let nonce = getRandomInt(MAX_NONCE);
    let hash = this.hash(nonce);

    // SHA1 algorithm has size of 160 bits.
    // The difficulty level is the amount of zeros
    // starting at the most significant bit.
    // The difference between SHA1 hash bit count
    // and the difficulty level is the position of the
    // first non-zero bit starting from the most significant one
    // TODO: change 160 to const
    if (hex2bin(hash).length > SHA1_LENGTH - difficulty) {
      hash = "";
    }

    return { nonce: nonce, hash: hash };
  }
}

// TODO:
// nonce and prevHash on genesis
class Blockchain {
  constructor(difficulty, blocks) {
    if (blocks === undefined) {
      this.blocks = [new Block(BlockType.Genesis, 0, Date.now(), 0, "genesis")];
    } else this.blocks = blocks;

    this.difficulty = difficulty;
  }

  // Make every block an orphan starting from
  // an unverified block
  orphanBlock(prevHash) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    let index = newBlocks.findIndex((block) => block.prevHash === prevHash);

    // Mark every child of the unverified block as orphan
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

  childrenOf(block) {
    return this.blocks.filter(
      (tempBlock) => block.hash(tempBlock.nonce) === tempBlock.prevHash
    );
  }

  // In order to calculate main branch length it is necessary to
  // not count orphans and branchable blocks, as
  // max amount of branches at the time of writting this comment
  // is not defined
  // To the length 2 is added because at every point in time
  // at least 2 blocks are branchable even when there is only one
  // branch
  get mainBranchLength() {
    return (
      this.blocks.filter(
        (block) => !block.branchable && block.type !== BlockType.Orphan
      ).length + 2
    );
  }

  addBlock(block) {
    const tempBlock = this.blocks.find(
      (b) => block.prevHash === b.hash(block.nonce)
    );
    const unheadedBlock = this.blocks.find(
      (b) => tempBlock.prevHash === b.hash(tempBlock.nonce)
    );

    let newBlocks = this.blocks.map((b) => {
      if (b.prevHash === unheadedBlock?.prevHash) {
        let temp = unheadedBlock.changeType(BlockType.Regular);
        temp.branchable = false;
        return temp;
      }
      return b;
    });
    newBlocks = [...newBlocks, block];

    let difficulty = this.difficulty;
    if ((this.mainBranchLength + 1) % 5 === 0) {
      difficulty++;
    }
    console.log(this.mainBranchLength);

    return new Blockchain(difficulty, newBlocks);
  }
}

export { Blockchain, Block, BlockType };
