import styles from "./Simulation.module.css";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain, BlockType } from "./Blockchain";

// TODO:
// alert when attempting to unverify genesis
// alert when branching forbidden
// change orphaning to be automatic?
// show detailed info on block click
// change body to tranasctions
// move difficulty button
// add multiple miners
// ? branches cant be longer than 1, unverifying is automatic
// increase difficulty based on main branch length
// button to reset blockchain

function BlockComponent(props) {
  // Block fill based on block type
  let color = "white";
  if (props.type === BlockType.Genesis) color = "#a23ad6";
  else if (props.type === BlockType.Orphan) color = "#929dac";
  else if (props.type === BlockType.Head) color = "#b8424d";

  return (
    <motion.g className={styles.simulation_scene_block}>
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

  // The algorithm below loops through the whole blockchain
  // assigning coordinates to corresponding blocks by increasing
  // the coordinates of the previous block by a fixed amount
  //
  // Everytime the inner loop finds a corresponding block
  // the y coordinate gets increased because every block found
  // after the first one indicates that branching took place
  //
  // In order to avoid overlap during "y" assignment, it is neccessary
  // to check if the given y value is already taken. If so, every blocksAndCoords
  // element with element's y >= given y needs to be increased by 1 level.

  const incrementYLevels = (y) => {
    for (const block of blocksAndCoords) {
      if (block.y >= y) {
        block.y += 2 * blockHeight;
      }
    }
  };

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocksAndCoords.find(
      (object) => object.block.prevHash === blocks[i].prevHash
    );
    let yTemp = currentBlock.y;
    let isFirstInBranch = false;

    for (let j = 1; j < blocks.length; j++) {
      const possibleBlock = blocks[j];

      if (
        currentBlock.block.hash(possibleBlock.nonce) === possibleBlock.prevHash
      ) {
        // Check if y is taken during branching
        if (
          yTemp !== currentBlock.y &&
          blocksAndCoords.some((block) => block.y === yTemp)
        ) {
          incrementYLevels(yTemp);
        }

        blocksAndCoords.push({
          block: possibleBlock,
          x: currentBlock.x + 2 * blockWidth,
          y: yTemp,
          parentY: currentBlock.y,
          isFirst: isFirstInBranch,
        });
        isFirstInBranch = true;
        yTemp += 2 * blockHeight;
      }
    }
  }

  return (
    <motion.g drag dragConstraints={props.constraintRef}>
      {blocksAndCoords.map((blockAndCoords) => {
        return (
          <motion.g key={blockAndCoords.block.prevHash}>
            {/* Horizontal left line */}
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
            {/* Horizontal right line */}
            <motion.line
              x1={blockAndCoords.x + blockWidth}
              y1={blockAndCoords.y + blockHeight / 2}
              x2={blockAndCoords.x + blockWidth * 1.5}
              y2={blockAndCoords.y + blockHeight / 2}
              stroke="black"
              strokeWidth="5px"
            />
            {/* Vertical line */}
            {blockAndCoords.isFirst &&
              blockAndCoords.block.type !== BlockType.Genesis && (
                <motion.line
                  x1={blockAndCoords.x - blockWidth / 2}
                  y1={blockAndCoords.y + blockHeight / 2}
                  x2={blockAndCoords.x - blockWidth / 2}
                  y2={blockAndCoords.parentY + blockHeight / 2}
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
  const [blockchain, setBlockchain] = useState(new Blockchain(2));

  // The block we are pointing at
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);

  // State storing console output
  const [consoleData, setConsoleData] = useState("");

  const svgRef = useRef(null);
  const blockBodyRef = useRef(null);
  const consoleBottomRef = useRef(null);

  // Handling double clicking on blocks
  const handleClick = (e, prevHash) => {
    if (e.detail === 2) {
      const tempBlock = blockchain.blocks.find(
        (block) => block.prevHash === prevHash
      );

      if (tempBlock.type !== BlockType.Orphan) setBlockSelected(tempBlock);
    }
  };

  // Method used for writting to console.
  // Passed to block class in order to display info about
  // mining
  const writeToConsole = (msg) => {
    const date = new Date();
    const timeString =
      ("0" + date.getHours()).slice(-2) +
      ":" +
      ("0" + date.getMinutes()).slice(-2) +
      ":" +
      ("0" + date.getSeconds()).slice(-2);

    // Used an arrow function so that the state
    // updates every time function is called
    setConsoleData((data) => data + `[${timeString}]: ${msg}\n`);

    // TODO: fix not scrolling all the way down
    consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearOrphans = () => {
    setBlockchain(blockchain.clearOrphans());
    writeToConsole("Orphans cleared.");
  };

  const handleResetBlockchain = () => {
    setBlockchain(new Blockchain(2));
    writeToConsole("Blockchain reset");
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

    if (blockSelected === null) {
      writeToConsole("No block selected.");
      return;
    }

    // TODO:  handle
    // Check if selected block is branchable
    if (
      !blockchain.head.find(
        (block) => block?.prevHash === blockSelected.prevHash
      )
    ) {
      return;
    }

    writeToConsole(`Starting mining...`);
    let mineInfo;
    let attemptNumber = 1;
    do {
      writeToConsole(`Attempt #${attemptNumber}`);
      mineInfo = blockSelected.tryMine(blockchain.difficulty);

      if (!mineInfo.hash) {
        writeToConsole(`Failure for nonce = ${mineInfo.nonce}`);
      }
      attemptNumber++;
    } while (!mineInfo.hash);
    writeToConsole(`Success for nonce = ${mineInfo.nonce}`);

    const blockAdded = new Block(
      BlockType.Regular,
      mineInfo.hash,
      Date.now(),
      mineInfo.nonce,
      blockBodyRef.current.value
    );
    setBlockSelected(blockAdded);

    // Increase difficulty every 5 blocks
    let difficulty = blockchain.difficulty;
    if ((blockchain.mainBranchLength + 1) % 5 === 0) {
      difficulty++;
      writeToConsole("Blockchain difficulty increased");
    }

    // TODO: undo button?
    setBlockchain(
      new Blockchain(difficulty, [...blockchain.blocks, blockAdded])
    );
  };

  return (
    <>
      <div className={styles.simulation_scene}>
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100vw 100vh"
          initial="hidden"
          animate="visible"
          style={{ objectFit: "fill" }}
          ref={svgRef}
        >
          <BlockchainComponent
            constraintRef={svgRef}
            blockchain={blockchain}
            handleClick={handleClick}
            blockSelected={blockSelected}
          />
        </motion.svg>
      </div>
      <div className={styles.simulation_toolbar}>
        <div style={{ gridArea: "left-side" }}>
          <form className={styles.simulation_toolbar_addblock}>
            <div className={styles.simulation_toolbar_field}>
              <label for="body">Block body:</label>
              <input
                type="text"
                ref={blockBodyRef}
                id="body"
                name="body"
                placeholder="Block's body"
              />
            </div>
            <input type="submit" value="Add block" onClick={handleAddBlock} />
          </form>
        </div>
        <pre className={styles.simulation_console}>
          {consoleData}
          <div ref={consoleBottomRef} />
        </pre>
        <div style={{ gridArea: "right-side" }}>
          <button
            onClick={() => {
              setBlockchain(blockchain.orphanBlock(blockSelected.prevHash));
              setBlockSelected(null);
            }}
          >
            Unverify block
          </button>
          <button onClick={handleClearOrphans}>Clear Orphans</button>
          <button onClick={() => setConsoleData("")}>Clear Console</button>
          <button onClick={handleResetBlockchain}>Reset Blockchain</button>
        </div>
      </div>
    </>
  );
}

export default Simulation;
