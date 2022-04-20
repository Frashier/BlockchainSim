import sha1 from "crypto-js/sha1";
import Hex from "crypto-js/enc-hex";

function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Block {
  constructor(type, prevHash, timestamp, nonce, body) {
    this.type = type;
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.body = body;
    this.maxNonce = 1000000;
  }

  hash(nonce) {
    const toHash = (
      this.prevHash +
      this.timestamp +
      this.body +
      this.nonce +
      nonce
    ).toString();

    return Hex.stringify(sha1(toHash));
  }

  // TODO:
  // verify block
  // verify blockchain
  // chance to add 2 blocks
  mine(difficulty) {
    let info = { hash: "", nonce: getRandomInt(this.maxNonce) };

    while (true) {
      info.hash = this.hash(info.nonce);

      // SHA1 algorithm has size of 160 bits.
      // The difficulty level is the amount of zeros
      // starting at the most significant bit.
      // The difference between SHA1 hash bit count
      // and the difficulty level is the position of the
      // first non-zero bit starting from the most significant one
      if (hex2bin(info.hash).length <= 160 - difficulty) return info;

      info.nonce = getRandomInt(this.maxNonce);
    }
  }
}

// TODO:
// nonce and prevHash
class Blockchain {
  constructor(blocks) {
    if (blocks === undefined) {
      this.blocks = [new Block("genesis", 0, Date.now(), 0, "genesis")];
    } else this.blocks = blocks;
  }

  orphanBlock(prevHash) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    const index = newBlocks.findIndex(
      (block) => block.prevHash === prevHash && block.type !== "genesis"
    );
    newBlocks[index].type = "orphan";

    // Traverse through the rest of the blocks
    // (added chronologically to the array)
    // and delete every successor of the
    // unverified block
    let currentBlock = newBlocks[index];
    for (let i = index + 1; i < newBlocks.length; i++) {
      const block = newBlocks[i];

      if (block.type === "genesis") continue;

      if (currentBlock.hash(block.nonce) === block.prevHash) {
        block.type = "orphan";
        currentBlock = block;
      }
    }

    return new Blockchain(newBlocks);
  }

  addBlock(block) {
    return new Blockchain([...this.blocks, block]);
  }
}

export { Blockchain, Block };
