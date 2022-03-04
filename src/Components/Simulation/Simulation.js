import styles from "./Simulation.module.css";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function createBlock(id, data) {
  return { id: id, data: data };
}

function Block(props) {
  return (
    <motion.rect
      width="140"
      height="140"
      fill="white"
      stroke="black"
      strokeWidth="5px"
      animate="visible"
      transition={{ duration: 0.5 }}
      className={styles.simulation_scene_block}
    ></motion.rect>
  );
}

function Simulation() {
  const [numberOfBlocks, setNumber] = useState(1);
  const [blocks, setBlocks] = useState([createBlock(0, 0)]);
  const constraintRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 100, y: 100 });

  return (
    <>
      <div className={styles.simulation_toolbar}>
        <button
          onClick={() => {
            setNumber(numberOfBlocks + 1);
            setBlocks([...blocks, createBlock(numberOfBlocks, numberOfBlocks)]);
          }}
        >
          Add block
        </button>
        {blocks.length}
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
            {blocks.map((block) => {
              return <Block key={block.id} {...block} />;
            })}
          </motion.g>
        </motion.svg>
      </div>
    </>
  );
}

export default Simulation;
