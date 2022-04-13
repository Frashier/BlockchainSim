import styles from "./Simulation.module.css";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain } from "./Blockchain";

function BlockComponent(props) {
  // Block fill based on block type
  let color;
  if (props.type === "genesis") color = "#a23ad6";
  else if (props.type === "orphan") color = "#929dac";
  else color = "white";

  return (
    <motion.g>
      <motion.rect
        width={props.blockWidth}
        height={props.blockHeight}
        x={props.x}
        fill={color}
        stroke="black"
        strokeWidth="5px"
        className={styles.simulation_scene_block}
      ></motion.rect>
      <foreignObject
        onClick={() => props.orphanBlock(props.prevHash)}
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

  return (
    <motion.g drag dragConstraints={props.constraintRef}>
      {props.blockchain.blocks.map((block, i) => {
        const x = 2 * blockWidth * i;
        const y = 0; // TODO: change when implementing branching

        // Prevent first line from drawing
        const line =
          block.type === "genesis" ? (
            ""
          ) : (
            <motion.line
              x1={x}
              y1={blockHeight / 2}
              x2={x - blockWidth}
              y2={blockHeight / 2}
              stroke="black"
              strokeWidth="5px"
            />
          );

        return (
          <motion.g key={block.prevHash}>
            <BlockComponent
              {...block}
              orphanBlock={props.orphanBlock}
              blockWidth={blockWidth}
              blockHeight={blockHeight}
              x={x}
            />
            {line}
          </motion.g>
        );
      })}
    </motion.g>
  );
}

function Simulation() {
  const [difficulty, setDifficulty] = useState(2);
  const [blockchain, setBlockchain] = useState(new Blockchain());
  const [orphanMode, setOrphanMode] = useState(false);

  const constraintRef = useRef(null);
  const blockBodyRef = useRef(null);

  const orphanBlock = (prevHash) => {
    if (!orphanMode) return;
    setOrphanMode(false);
    setBlockchain(new Blockchain(blockchain.orphanBlock(prevHash)));
  };

  const handleAddBlock = (event) => {
    event.preventDefault();

    const mineInfo = blockchain.blocks[blockchain.blocks.length - 1].mine(
      difficulty
    );

    setBlockchain(
      blockchain.addBlock(
        new Block(
          "normal",
          mineInfo.hash,
          Date.now(),
          mineInfo.nonce,
          blockBodyRef.current.value
        )
      )
    );
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
            orphanBlock={orphanBlock}
          />
        </motion.svg>
      </div>
    </>
  );
}

export default Simulation;
