import sha1 from "crypto-js/sha1";
import Hex from "crypto-js/enc-hex";

function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

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
    return `BlockType.${this.type}`;
  }
}

class Block {
  constructor(type, prevHash, timestamp, nonce, body) {
    this.type = type; // Helper variable for simulation implementation
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.body = body;
    this.maxNonce = 1000000;
  }

  changeType(type) {
    return new Block(
      type,
      this.prevHash,
      this.timestamp,
      this.nonce,
      this.body
    );
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
  tryMine(difficulty) {
    let nonce = getRandomInt(this.maxNonce);
    let hash = this.hash(nonce);

    // SHA1 algorithm has size of 160 bits.
    // The difficulty level is the amount of zeros
    // starting at the most significant bit.
    // The difference between SHA1 hash bit count
    // and the difficulty level is the position of the
    // first non-zero bit starting from the most significant one
    // TODO: change 160 to const
    if (hex2bin(hash).length > 160 - difficulty) {
      hash = "";
    }

    return { nonce: nonce, hash: hash };
  }
}

// TODO:
// nonce and prevHash on genesis
class Blockchain {
  constructor(blocks) {
    if (blocks === undefined) {
      this.blocks = [new Block(BlockType.Genesis, 0, Date.now(), 0, "genesis")];
    } else this.blocks = blocks;
  }

  // Make every block an orphan starting from
  // an unverified block
  orphanBlock(prevHash) {
    let newBlocks = this.blocks;

    // Find block with specified previous hash
    let index = newBlocks.findIndex((block) => block.prevHash === prevHash);

    if (newBlocks[index].type !== BlockType.Genesis) {
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
    }

    return new Blockchain(newBlocks);
  }

  clearOrphans() {
    return new Blockchain(
      this.blocks.filter((block) => block.type !== BlockType.Orphan)
    );
  }

  getChildren(block) {
    return this.blocks.filter(
      (tempBlock) => block.hash(tempBlock.nonce) === tempBlock.prevHash
    );
  }

  // Return array of blocks user can add new blocks to
  getHead() {
    // Return genesis if the length of the blockchain
    // with orphans excluded == 1 (only genesis remains)
    if (
      this.blocks.filter((block) => block.type !== BlockType.Orphan).length == 1
    ) {
      return [this.blocks[0]];
    }

    let head = [];
    for (const block of this.blocks) {
      if (block.type === BlockType.Orphan) {
        continue;
      }

      // For every child of the current block,
      // if child doesn't have children, remove it
      // from the list
      let children = this.getChildren(block);
      for (const child of children) {
        if (this.getChildren(child).length === 0) {
          children = children.filter((c) => c.prevHash !== child.prevHash);
        }
      }

      // If the list of children isn't empty
      // then some of them contain children of
      // their own, hence you can't add blocks
      // to the current block
      if (children.length === 0) {
        head.push(block);
      }
    }

    return head;
  }

  addBlock(block) {
    return new Blockchain([...this.blocks, block]);
  }
}

export { Blockchain, Block, BlockType };
