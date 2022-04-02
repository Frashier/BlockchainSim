import styles from "./Simulation.module.css";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import sha1 from "crypto-js/sha1";
import Hex from "crypto-js/enc-hex";

function createBlock(type, prevHash, timestamp, nonce, body) {
  return {
    type: type,
    prevHash: prevHash,
    timestamp: timestamp,
    nonce: nonce,
    body: body,
  };
}

function hex2bin(hex) {
  return parseInt(hex, 16).toString(2);
}

function mine(block, difficulty) {
  let info = { hash: "", nonce: 0 };
  console.log(block.body);
  while (true) {
    // Value to hash
    const toHash = (block.prevHash + block.timestamp + info.nonce).toString();

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
    if (info.nonce == 1000) {
      return null;
    }
  }
}

function Block(props) {
  const blockWidth = "180";
  const blockHeight = "180";

  // Block fill based on block type
  let color;
  if (props.type === "origin") color = "#b8424d";
  else if (props.type === "orphan") color = "#929dac";
  else color = "white";

  return (
    <>
      <motion.rect
        width={blockWidth}
        height={blockHeight}
        x={2 * blockWidth * props.position}
        fill={color}
        stroke="black"
        strokeWidth="5px"
        className={styles.simulation_scene_block}
      ></motion.rect>
      <foreignObject
        width="176"
        height="135"
        x={2 * blockWidth * props.position + 2}
        y="0"
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
      <motion.line
        x1={2 * blockWidth * props.position}
        y1={blockHeight / 2}
        x2={2 * blockWidth * props.position - blockWidth}
        y2={blockHeight / 2}
        stroke="black"
        strokeWidth="5px"
      />
    </>
  );
}

function Simulation() {
  const [difficulty, setDifficulty] = useState(2);
  const [blocks, setBlocks] = useState([
    createBlock("origin", 0, Date.now(), 0, "origin"),
  ]);
  const constraintRef = useRef(null);
  const blockBodyRef = useRef(null);

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
          <input
            type="submit"
            value="Add block"
            onClick={(event) => {
              event.preventDefault();
              const mineInfo = mine(blocks[blocks.length - 1], difficulty);
              setBlocks([
                ...blocks,
                createBlock(
                  "normal",
                  mineInfo.hash,
                  Date.now(),
                  mineInfo.nonce,
                  blockBodyRef.current.value
                ),
              ]);
            }}
          />
        </form>
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
          <motion.g drag dragConstraints={constraintRef}>
            {blocks.map((block, i) => {
              return <Block key={block.prevHash} {...block} position={i} />;
            })}
          </motion.g>
        </motion.svg>
      </div>
    </>
  );
}

export default Simulation;
