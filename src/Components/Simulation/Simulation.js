import styles from "./Simulation.module.css";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain, BlockType } from "./Blockchain";

// TODO:
// console
// alert when attempting to unverify genesis
// can branch only at the end of the branch (alert when attempting otherwise)
// change orphaning to be automatic?
// fix different animation hover when cleared orphans

function BlockComponent(props) {
  // Block fill based on block type
  let color = "white";
  if (props.type === BlockType.Genesis) color = "#a23ad6";
  else if (props.type === BlockType.Orphan) color = "#929dac";

  return (
    <motion.g
      whileHover={{ scale: 1.1 }}
      className={styles.simulation_scene_block}
    >
      <motion.rect
        width={props.blockWidth}
        height={props.blockHeight}
        x={props.x}
        y={props.y}
        fill={color}
        stroke={
          props.blockSelected?.prevHash === props.prevHash ? "green" : "black"
        }
        strokeWidth="5px"
      ></motion.rect>
      <foreignObject
        onClick={(e) => props.handleClick(e, props.prevHash)}
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

// TODO: button to see details of a block
function BlockchainComponent(props) {
  const blockWidth = 180;
  const blockHeight = 180;

  // Initiate blocksAndCoords with the genesis block
  const blocks = props.blockchain.blocks.slice();
  let blocksAndCoords = [{ block: blocks[0], x: 0, y: 0 }];

  // The algorithm below loops through the whole blockchain twice
  // assigning coordinates to corresponding blocks by increasing
  // the coordinates of the previous block by a fixed amount
  //
  // Everytime the inner loop finds a corresponding block
  // the y coordinate gets increased as every block found
  // after the first one indicates branching took place

  let yOffset = 0;
  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocksAndCoords.find(
      (object) => object.block.prevHash === blocks[i].prevHash
    );
    let yTemp = currentBlock.y;

    let isFirstInBranch = true; // Used to draw vertical lines
    for (let j = 1; j < blocks.length; j++) {
      const possibleBlock = blocks[j];

      if (
        currentBlock.block.hash(possibleBlock.nonce) === possibleBlock.prevHash
      ) {
        blocksAndCoords.push({
          block: possibleBlock,
          x: currentBlock.x + 2 * blockWidth,
          y: yTemp,
          isFirst: isFirstInBranch,
        });
        isFirstInBranch = false;
        yTemp += 2 * blockHeight;
      }
    }
  }

  return (
    <motion.g drag dragConstraints={props.constraintRef}>
      {blocksAndCoords.map((blockAndCoords) => {
        return (
          <motion.g key={blockAndCoords.block.prevHash}>
            {blockAndCoords.block.type !== BlockType.Genesis && (
              <motion.line
                x1={blockAndCoords.x}
                y1={blockAndCoords.y + blockHeight / 2}
                x2={blockAndCoords.x - blockWidth / 2}
                y2={blockAndCoords.y + blockHeight / 2}
                stroke="black"
                strokeWidth="5px"
              />
            )}
            <motion.line
              x1={blockAndCoords.x + blockWidth}
              y1={blockAndCoords.y + blockHeight / 2}
              x2={blockAndCoords.x + blockWidth * 1.5}
              y2={blockAndCoords.y + blockHeight / 2}
              stroke="black"
              strokeWidth="5px"
            />
            {!blockAndCoords.isFirst &&
              blockAndCoords.block.type !== BlockType.Genesis && (
                <motion.line
                  x1={blockAndCoords.x - blockWidth / 2}
                  y1={blockAndCoords.y + blockHeight / 2}
                  x2={blockAndCoords.x - blockWidth / 2}
                  y2={blockAndCoords.y - blockHeight * 1.5}
                  stroke="black"
                  strokeWidth="5px"
                />
              )}
            <BlockComponent
              {...blockAndCoords.block}
              blockSelected={props.blockSelected}
              handleClick={props.handleClick}
              blockWidth={blockWidth}
              blockHeight={blockHeight}
              x={blockAndCoords.x}
              y={blockAndCoords.y}
            />
          </motion.g>
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

  // The block we are pointing at
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);

  const constraintRef = useRef(null);
  const blockBodyRef = useRef(null);

  const handleClick = (e, prevHash) => {
    // If double clicked and not an orphan, select
    const tempBlock = blockchain.blocks.find(
      (block) => block.prevHash === prevHash
    );
    if (e.detail === 2 && tempBlock.type !== BlockType.Orphan) {
      setBlockSelected(tempBlock);
    }
  };

  // Proccess of adding a block is as follows:
  // 1. Check if it's possible to add block to the selected one
  // 2. Get hash of the block we are pointing at
  // accompanied by the nonce based on the difficulty
  // (by default block added last is selected)
  // 3. Create a new blockchain by adding the block
  // to the current blockchain
  const handleAddBlock = (event) => {
    event.preventDefault();

    if (blockSelected === null) return;

    // TODO:  handle
    if (
      !blockchain
        .getHead()
        .find((block) => block?.prevHash === blockSelected.prevHash)
    ) {
      return;
    }
    const mineInfo = blockSelected.mine(difficulty);
    const block = new Block(
      BlockType.Regular,
      mineInfo.hash,
      Date.now(),
      mineInfo.nonce,
      blockBodyRef.current.value
    );
    // Change selection to block added last
    setBlockSelected(block);

    setBlockchain(new Blockchain([...blockchain.blocks, block]));
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
        <button
          onClick={() => {
            setBlockchain(blockchain.orphanBlock(blockSelected.prevHash));
            setBlockSelected(null);
          }}
        >
          Unverify block
        </button>
        <button onClick={() => setBlockchain(blockchain.clearOrphans())}>
          Clear
        </button>
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
            blockSelected={blockSelected}
          />
        </motion.svg>
      </div>
    </>
  );
}

export default Simulation;
