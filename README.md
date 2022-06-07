# BlockchainSim

Website simulating blockchain data structure.

Because of the decentralized nature of blockchain databases, this project's blockchain implementation is altered in such a way that an accurate enough representation of the real-life data structure is possible having in mind that in this instance it operates on a single client and every calculation is performed client-side.

## Stack

Project is written using React library for Javascript. Entirety of the data structure's graphical representation is made using Framer's Motion library for animations and gestures. Crypto-js is used for hashing purposes.

## Implementation

### Overview

Core of the blockchain implementation lays in blockchain.js, where logic for blockchain and individual blocks is defined. Classes contain little to no helpers for constructing graphical representation. The only notable exception is the weight system. The reason for it's existence being that it reduces the amount of calculations required for every task. It's implemented purely for the ease of use for users, otherwise browser would get blocked fast as data structure grows.

### Weight system

As of writting this README, every block has a "weight" property. Genesis has it's weight set to 0 and every following block has it's weight equal to it's parent's incremented by one. Blockchain has "maxWeight" property, which is equal to the biggest weight present in the blockchain. Adding blocks is only possible to blocks with weight >= maxWeight - 1. A branch is orphaned, when it's not possible to add blocks to any of it's blocks.
