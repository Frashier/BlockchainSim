import "./BlockComponent.css";
import BlockDetails from "../BlockDetails";
import { BlockType } from "../utils/blockchain";
import { motion } from "framer-motion";
import { useState } from "react";

export default function BlockComponent(props) {
  const [inspectOpen, setInspectOpen] = useState(false);

  let className = "block";

  if (props.blockSelected?.prevHash === props.block.prevHash) {
    className = "block--selected";
  } else if (props.block.type === BlockType.Orphan) {
    className = "block--orphaned";
  }

  return (
    <motion.g
      className={className}
      onClick={(e) => props.handleClick(e, props.block.prevHash)}
    >
      <motion.rect
        width={props.blockWidth}
        height={props.blockHeight}
        rx="20"
        ry="20"
        x={props.x}
        y={props.y}
        strokeDasharray={4 - 2 * (props.maxWeight - props.block.weight)}
        fill={props.block.type === BlockType.Genesis ? "#a23ad6" : "#929dac"}
        stroke="black"
        strokeWidth="5px"
      ></motion.rect>
      <foreignObject
        width={props.blockWidth}
        height={props.blockHeight}
        x={props.x + 2}
        y={props.y}
        color="black"
        fontSize="10"
        className="block_text"
      >
        <div className="block_header">
          0x{props.block.prevHash.toString().substring(0, 8)}...
        </div>
        <button onClick={() => setInspectOpen(true)} className="block_button">
          <img
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            src="Assets/glass.png"
            alt="Inspect"
          />
        </button>
      </foreignObject>
      <BlockDetails
        block={props.block}
        isOpen={inspectOpen}
        close={() => setInspectOpen(false)}
      />
    </motion.g>
  );
}
