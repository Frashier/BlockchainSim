function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

class Block {
  constructor(type, prevHash, timestamp, nonce, body) {
    this.type = type;
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.body = body;
  }

  mine(difficulty) {
    let info = { hash: "", nonce: 0 };

    while (true) {
      // Value to hash
      const toHash = (
        this.prevHash +
        this.timestamp +
        this.body +
        this.nonce
      ).toString();

      // Generate hash as hex string and convert to binary
      info.hash = Hex.stringify(sha1(toHash));

      // SHA1 algorithm has size of 160 bits.
      // The difficulty level is the amount of zeros
      // starting at the most significant bit.
      // The difference between SHA1 hash bit count
      // and the difficulty level is the position of the
      // first non-zero bit starting from the most significant one
      if (hex2bin(info.hash).length <= 160 - difficulty) return info;

      info.nonce++;

      // Guard against iterating too many times
      // TODO: remove
      if (info.nonce == 1000) {
        return null;
      }
    }
  }
}

class Blockchain {
  constructor() {
    this.blocks = Block("genesis", 0, Date.now(), 0, "genesis");
  }

  orphanBlock(prevHash) {
    let newBlocks = blocks;
    newBlocks.forEach((block) => {
      if (block.prevHash == prevHash) {
        block.type = "orphan";
      }
    });

    return newBlocks;
  }
}
