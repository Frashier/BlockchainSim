import "./Simulation.css";
import "../../index.css";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain, BlockType } from "./Blockchain";
import Modal from "react-modal";

// TODO:
// verify block
// verify blockchain
// move blockchian to original position on reset

Modal.setAppElement(document.getElementById("root"));

function BlockDetails(props) {
  return (
    <Modal
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        content: {
          overflowWrap: "break-word",
          padding: "30px",
          maxWidth: "70%",
          maxHeight: "70%",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(27, 33, 37, 0.7)",
          border: "5px solid black",
        },
      }}
      isOpen={props.isOpen}
      onRequestClose={props.close}
    >
      <div style={{ fontSize: "20px" }}>
        Poprzedni hash: {props.block.prevHash}
        <br />
        Znacznik czasowy: {props.block.timestamp}
        <br />
        Nonce: {props.block.nonce}
        <br />
        Typ: {props.block.type.toString()}
        <br />
        Kopacz: {props.block.miner}
        <br />
        <hr style={{ border: "1px solid black" }} />
        {props.block.transactions.map((tx) => {
          return (
            <li key={tx.index}>
              Hash: {tx.hash}
              <br />
              Znacznik czasowy: {tx.timestamp}
            </li>
          );
        })}
      </div>
    </Modal>
  );
}

function BlockComponent(props) {
  const [inspectOpen, setInspectOpen] = useState(false);

  let className = "simulation_scene_block";

  if (props.blockSelected?.prevHash === props.block.prevHash) {
    className = "simulation_scene_block--selected";
  } else if (props.block.type === BlockType.Orphan) {
    className = "simulation_scene_block--orphaned";
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
        className="simulation_scene_block_text"
      >
        <div className="simulation_scene_block_header">
          0x{props.block.prevHash.toString().substring(0, 8)}...
        </div>
        <button
          onClick={() => setInspectOpen(true)}
          className="simluation_scene_block_button"
        >
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

function BlockchainComponent(props) {
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

function Simulation() {
  // Blockchain related states
  const [blockchain, setBlockchain] = useState(new Blockchain(2));
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);
  const [miner, setMiner] = useState("Nieznany");

  // Interface utilites
  const [consoleData, setConsoleData] = useState("");
  const [blockchainScale, setBlockchainScale] = useState(1);

  const svgRef = useRef(null);
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
  };

  // Scrolling to bottom of console on console update
  useEffect(() => {
    consoleBottomRef.current.scrollIntoView();
  }, [consoleData]);

  const handleClearOrphans = () => {
    setBlockchain(blockchain.clearOrphans());
    writeToConsole("Osierocone bloki usunięte.");
  };

  const handleResetBlockchain = () => {
    setBlockchain(new Blockchain(2));
    setBlockSelected(null);
    writeToConsole("Blockchain zresetowany.");
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
      writeToConsole("Nie wybrano bloku.");
      return;
    }

    // Check if selected block is branchable
    if (blockSelected.weight < blockchain.maxWeight - 1) {
      writeToConsole("Dodanie bloku do tego bloku jest nieopłacalne.");
      return;
    }

    writeToConsole(`Rozpoczynanie kopania...`);
    let mineInfo;
    let attemptNumber = 1;
    do {
      writeToConsole(`Próba #${attemptNumber}.`);
      mineInfo = blockSelected.tryMine(blockchain.difficulty);

      if (!mineInfo.hash) {
        writeToConsole(`Porażka dla nonce = ${mineInfo.nonce}.`);
      }
      attemptNumber++;
    } while (!mineInfo.hash);
    writeToConsole(`Sukces dla nonce = ${mineInfo.nonce}.`);

    const blockAdded = new Block(
      BlockType.Regular,
      mineInfo.hash,
      Date.now(),
      mineInfo.nonce,
      miner,
      blockSelected.weight + 1
    );
    setBlockSelected(blockAdded);

    const newBlockchain = blockchain.addBlock(blockAdded);
    if (newBlockchain.difficulty > blockchain.difficulty) {
      writeToConsole("Poziom trudności kopania zwiększony.");
    }
    // TODO: undo button?
    setBlockchain(newBlockchain);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="simulation"
    >
      <div className="simulation_scene">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100vw 100vh"
          style={{ objectFit: "fill" }}
          ref={svgRef}
        >
          <BlockchainComponent
            blockchainScale={blockchainScale}
            constraintRef={svgRef}
            blockchain={blockchain}
            handleClick={handleClick}
            blockSelected={blockSelected}
          />
        </motion.svg>
      </div>
      <input
        type="range"
        className="simulation_scene_slider"
        id="blockchainScale"
        name="blockchainScale"
        min="50"
        max="150"
        value={blockchainScale * 100}
        step="1"
        onChange={(e) => setBlockchainScale(e.target.value / 100)}
      />
      <div className="simulation_toolbar">
        <div className="simulation_toolbar_leftside">
          <form className="simulation_toolbar_leftside_form">
            <input
              type="text"
              id="miner"
              name="miner"
              placeholder="Nazwa kopacza"
              onChange={(e) => setMiner(e.target.value)}
            />
            <button
              className="basic-button"
              type="submit"
              onClick={handleAddBlock}
            >
              Dodaj blok
            </button>
          </form>
          <p className="simulation_toolbar_leftside_difficulty">
            Poziom trudności kopania: {blockchain.difficulty}
          </p>
        </div>
        <pre className="simulation_toolbar_console">
          {consoleData}
          <div ref={consoleBottomRef} />
        </pre>
        <div className="simulation_toolbar_rightside">
          <button className="basic-button" onClick={handleClearOrphans}>
            Usuń osierocone bloki
          </button>
          <button className="basic-button" onClick={() => setConsoleData("")}>
            Wyczyść konsole
          </button>
          <button className="basic-button" onClick={handleResetBlockchain}>
            Zresetuj blockchain
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Simulation;
