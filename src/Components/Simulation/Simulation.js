import styles from "./Simulation.module.css";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain } from "./Blockchain";

function BlockComponent(props) {
  // Block fill based on block type
  let color = "white";
  if (props.type === "genesis") color = "#a23ad6";
  else if (props.type === "orphan") color = "#929dac";

  return (
    <motion.g className={styles.simulation_scene_block}>
      <motion.rect
        width={props.blockWidth}
        height={props.blockHeight}
        x={props.x}
        y={props.y}
        fill={color}
        stroke="black"
        strokeWidth="5px"
      ></motion.rect>
      <foreignObject
        onClick={() => props.handleClick(props.prevHash)}
        width="176"
        height="135"
        x={props.x + 2}
        y={props.y}
        color="black"
        fontSize="10"
        className={styles.simulation_scene_block_text}
      >
        <div className={styles.simulation_scene_block_header}>
          {props.prevHash} <br /> {props.timestamp}
          <br /> {props.nonce}
        </div>
        <hr style={{ border: "1px solid black" }} />
        <div className={styles.simulation_scene_block_body}>{props.body}</div>
      </foreignObject>
    </motion.g>
  );
}

function BlockchainComponent(props) {
  const blockWidth = "180";
  const blockHeight = "180";

  // The algorithm below loops through the whole blockchain twice
  // assigning coordinates to corresponding blocks by increasing
  // the coordinates of the previous block by a fixed amount
  //
  // Everytime the inner loop finds a corresponding block
  // the y coordinate gets increased as every block found
  // after the first one indicates branching took place

  let blocksAndCoords = [{ block: props.blockchain.blocks[0], x: 0, y: 0 }];
  const blocks = props.blockchain.blocks.slice();

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocksAndCoords.find(
      (object) => object.block.prevHash === blocks[i].prevHash
    );
    let tempY = currentBlock.y;

    for (let j = 1; j < blocks.length; j++) {
      const possibleBlock = blocks[j];

      if (
        currentBlock.block.hash(possibleBlock.nonce) === possibleBlock.prevHash
      ) {
        blocksAndCoords.push({
          block: possibleBlock,
          x: currentBlock.x + 2 * blockWidth,
          y: tempY,
        });
        tempY += 2 * blockHeight;
      }
    }
  }

  /*
  let tempBlocks = props.blockchain.blocks.slice();
  let divsToRender = [];

  let currentBlock = tempBlocks[0];
  divsToRender.push(
    <motion.g key={currentBlock.prevHash}>
      <BlockComponent
        {...currentBlock}
        handleClick={props.handleClick}
        blockWidth={blockWidth}
        blockHeight={blockHeight}
        x="0"
        y="0"
      />
    </motion.g>
  );
  tempBlocks.splice(0, 1);

  let x = 2 * blockWidth;
  let y = 0;
  let guard = 0;
  while (tempBlocks.length > 0) {
    console.log(tempBlocks);
    for (let i = 0; i < tempBlocks.length; i++) {
      const block = tempBlocks[i];

      if (currentBlock.hash(block.nonce) === block.prevHash) {
        divsToRender.push(
          <motion.g key={block.prevHash}>
            <BlockComponent
              {...block}
              handleClick={props.handleClick}
              blockWidth={blockWidth}
              blockHeight={blockHeight}
              x={x}
              y={y}
            />
            <motion.line
              x1={x}
              y1={blockHeight / 2}
              x2={x - blockWidth}
              y2={blockHeight / 2}
              stroke="black"
              strokeWidth="5px"
            />
          </motion.g>
        );
        x += 2 * blockWidth;
        tempBlocks.splice(i--, 1);
        currentBlock = block;
      }
    }

    y += 2 * blockHeight;
    if (guard++ > 10) break;
  }
*/
  return (
    <motion.g drag dragConstraints={props.constraintRef}>
      {blocksAndCoords.map((blockAndCoords) => {
        return (
          <BlockComponent
            key={blockAndCoords.block.prevHash}
            {...blockAndCoords.block}
            handleClick={props.handleClick}
            blockWidth={blockWidth}
            blockHeight={blockHeight}
            x={blockAndCoords.x}
            y={blockAndCoords.y}
          />
        );
      })}
    </motion.g>
  );
}

function Simulation() {
  // Value stored by the difficulty variable determines
  // how many zeros must be at the start of the SHA1 160 bit hash
  // in binary representation
  const [difficulty, setDifficulty] = useState(2);
  const [blockchain, setBlockchain] = useState(new Blockchain());
  const [orphanMode, setOrphanMode] = useState(false);

  // The block we are pointing at
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);

  const constraintRef = useRef(null);
  const blockBodyRef = useRef(null);

  // Method passed to each block
  // if orphan mode, then orphan the block
  // else, select it
  const handleClick = (prevHash) => {
    if (orphanMode) {
      setOrphanMode(false);
      setBlockchain(blockchain.orphanBlock(prevHash));
      return;
    }

    setBlockSelected(
      blockchain.blocks.find((block) => block.prevHash === prevHash)
    );
  };

  // 10% chance of blockchain creating a
  // concurrent path
  const doesBranch = () => Math.random() < 0.1;

  // Proccess of adding a block is as follows:
  // 1. Get hash of the block we are pointing at
  // accompanied by the nonce based on the difficulty
  // (by default block added last is selected)
  // 2. Add the block to temporary array
  // 3. Randomly decide whether a new concurrent block
  // should be added, if so then repeat 1. and 2. on it
  // 4. Create a new blockchain by appending existing blocks
  // and temporary blocks
  const handleAddBlock = (event) => {
    event.preventDefault();

    const mineInfo = blockSelected.mine(difficulty);
    let blocksToAdd = [
      new Block(
        "normal",
        mineInfo.hash,
        Date.now(),
        mineInfo.nonce,
        blockBodyRef.current.value
      ),
    ];

    if (doesBranch()) {
      const concurrentMineInfo = blockSelected.mine(difficulty);

      blocksToAdd.push(
        new Block(
          "normal",
          concurrentMineInfo.hash,
          Date.now(),
          concurrentMineInfo.nonce,
          blockBodyRef.current.value
        )
      );
    }

    // Change selection to block added last
    setBlockSelected(blocksToAdd[blocksToAdd.length - 1]);

    setBlockchain(new Blockchain([...blockchain.blocks, ...blocksToAdd]));
  };

  return (
    <>
      <div className={styles.simulation_toolbar}>
        <form className={styles.simulation_toolbar_body}>
          <input
            type="text"
            ref={blockBodyRef}
            id="body"
            name="body"
            placeholder="Block's body"
          />
          <input type="submit" value="Add block" onClick={handleAddBlock} />
        </form>
        <button onClick={() => setOrphanMode(true)}>Orphan block</button>
        <form className={styles.simulation_toolbar_difficulty}>
          <label for="difficulty">Difficulty:</label>
          <input
            min="0"
            max="10"
            placeholder="2"
            type="number"
            id="difficulty"
            name="difficulty"
            onChange={(event) => {
              setDifficulty(event.target.value);
            }}
            required
          />
        </form>
      </div>
      <div className={styles.simulation_scene}>
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100vw 100vh"
          initial="hidden"
          animate="visible"
          style={{ objectFit: "fill" }}
          ref={constraintRef}
        >
          <BlockchainComponent
            constraintRef={constraintRef}
            blockchain={blockchain}
            handleClick={handleClick}
          />
        </motion.svg>
      </div>
    </>
  );
}

export default Simulation;
