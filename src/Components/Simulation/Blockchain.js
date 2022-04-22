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
// nonce and prevHash on genesis
class Blockchain {
  constructor(blocks) {
    if (blocks === undefined) {
      this.blocks = [new Block("genesis", 0, Date.now(), 0, "genesis")];
    } else this.blocks = blocks;
  }

  orphanBlock(prevHash) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    let index = newBlocks.findIndex(
      (block) => block.prevHash === prevHash && block.type !== "genesis"
    );

    // Mark every successor of the unverified block as orphan
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
      newBlocks[index].type = "orphan";
      nextBlocks.shift();
    }

    return new Blockchain(newBlocks);
  }

  addBlock(block) {
    return new Blockchain([...this.blocks, block]);
  }
}

export { Blockchain, Block };
