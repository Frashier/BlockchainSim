import BlockComponent from "./BlockComponent/BlockComponent";
import { BlockType } from "./utils/blockchain";
import { motion } from "framer-motion";

export default function BlockchainComponent(props) {
  const blockWidth = 180 * props.blockchainScale;
  const blockHeight = 180 * props.blockchainScale;
  const maxWeight = props.blockchain.maxWeight;

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

      if (block.parentY >= y) {
        block.parentY += 2 * blockHeight;
      }
    }
  };

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocksAndCoords.find(
      (object) => object.block.prevHash === blocks[i].prevHash
    );

    if (!currentBlock) {
      continue;
    }

    let yTemp = currentBlock.y;
    let isFirstInBranch = false;

    const children = props.blockchain.childrenOf(currentBlock.block);
    while (children.length !== 0) {
      const child = children.shift();

      if (
        yTemp !== currentBlock.y &&
        blocksAndCoords.some((block) => block.y === yTemp)
      ) {
        incrementYLevels(yTemp);
      }

      blocksAndCoords.push({
        block: child,
        x: currentBlock.x + 2 * blockWidth,
        y: yTemp,
        parentY: currentBlock.y,
        isFirst: isFirstInBranch,
      });
      isFirstInBranch = true;
      yTemp += 2 * blockHeight;
    }
  }

  return (
    <motion.g drag dragMomentum={false} dragConstraints={props.constraintRef}>
      {blocksAndCoords.map((blockAndCoords) => {
        return (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            key={blockAndCoords.block.prevHash}
          >
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
              block={blockAndCoords.block}
              blockSelected={props.blockSelected}
              maxWeight={maxWeight}
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
