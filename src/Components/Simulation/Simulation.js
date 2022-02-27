import styles from "./Simulation.module.css";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function createBlock(id, data) {
  return { id: id, data: data };
}

function Block(props) {
  return (
    <motion.div
      className={styles.simulation_scene_block}
      drag
      dragConstraints={props.dragConstraint}
    >
      {props.data}
    </motion.div>
  );
}

function Blockchain(props) {
  return (
    <div>
      {props.blocks.map((i, block) => {
        return (
          <Block
            key={block}
            dragConstraint={props.dragConstraint}
            data={block.data}
          />
        );
      })}
    </div>
  );
}

function Simulation() {
  let numberOfBlocks = 0;
  const [blocks, setBlocks] = useState([
    createBlock(numberOfBlocks, numberOfBlocks),
  ]);
  const constraintRef = useRef(null);

  useEffect(() => {
    numberOfBlocks++;
  });

  return (
    <div className={styles.simulation}>
      <div className={styles.simulation_toolbar}>
        <button
          onClick={() =>
            setBlocks(
              blocks.concat([createBlock(numberOfBlocks, numberOfBlocks)])
            )
          }
        >
          Add block
        </button>
      </div>
      <div className={styles.simulation_scene} ref={constraintRef}>
        <Blockchain dragConstraint={constraintRef} blocks={blocks}></Blockchain>
      </div>
    </div>
  );
}

export default Simulation;
