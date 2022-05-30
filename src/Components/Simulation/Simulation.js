import "./Simulation.css";
import "../../index.css";
import content from "../../translations/polish.json";
import BlockchainComponent from "./BlockchainComponent";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain, BlockType } from "./utils/blockchain";
import Modal from "react-modal";

Modal.setAppElement(document.getElementById("root"));

function Simulation() {
  // Blockchain related states
  const [blockchain, _setBlockchain] = useState(new Blockchain(2));
  const [blockchainHistory, setBlockchainHistory] = useState([blockchain]);
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);
  const [miner, setMiner] = useState(undefined);

  // Interface utilites
  const [consoleData, setConsoleData] = useState("");
  const [blockchainScale, setBlockchainScale] = useState(1);
  const [rerenderSwitch, setRerenderSwitch] = useState(false);

  const svgRef = useRef(null);
  const consoleBottomRef = useRef(null);

  const setBlockchain = (newBlockchain) => {
    let newHistory = [...blockchainHistory, blockchain];
    if (newHistory.length > 5) {
      newHistory.shift();
    }
    setBlockchainHistory(newHistory);
    _setBlockchain(newBlockchain);
  };

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
    writeToConsole(content.simulation.consoleNotification[0]);
  };

  const handleResetBlockchain = () => {
    const blockchain = new Blockchain(2);
    setBlockchain(blockchain);
    setBlockchainHistory([blockchain]);
    setBlockSelected(null);
    setRerenderSwitch(!rerenderSwitch);
    writeToConsole(content.simulation.consoleNotification[1]);
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
      writeToConsole(content.simulation.consoleNotification[2]);
      return;
    }

    // Check if selected block is branchable
    if (blockSelected.weight < blockchain.maxWeight - 1) {
      writeToConsole(content.simulation.consoleNotification[3]);
      return;
    }

    writeToConsole(content.simulation.consoleNotification[4]);
    let mineInfo;
    let attemptNumber = 1;
    do {
      writeToConsole(
        `${content.simulation.consoleNotification[5]} #${attemptNumber}.`
      );
      mineInfo = blockSelected.tryMine(blockchain.difficulty);

      if (!mineInfo.hash) {
        writeToConsole(
          `${content.simulation.consoleNotification[6]} nonce = ${mineInfo.nonce}.`
        );
      }
      attemptNumber++;
    } while (!mineInfo.hash);
    writeToConsole(
      `${content.simulation.consoleNotification[7]} nonce = ${mineInfo.nonce}.`
    );

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
      writeToConsole(content.simulation.consoleNotification[8]);
    }

    setBlockchain(newBlockchain);
  };

  const handleUndo = () => {
    if (blockchainHistory.length > 1) {
      let history = blockchainHistory;
      const previousState = history.pop();
      setBlockchainHistory(history);
      setBlockSelected(null);
      _setBlockchain(previousState);
    }
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
          key={rerenderSwitch}
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
          <div>
            <form className="simulation_toolbar_leftside_form">
              <input
                type="text"
                id="miner"
                name="miner"
                placeholder={content.simulation.form[0]}
                onChange={(e) => setMiner(e.target.value)}
              />
              <button
                className="basic-button"
                type="submit"
                onClick={handleAddBlock}
              >
                {content.simulation.form[1]}
              </button>
            </form>
            <p className="simulation_toolbar_leftside_difficulty">
              {content.simulation.difficulty}: {blockchain.difficulty}
            </p>
          </div>
          <div>
            <button
              className="basic-button"
              style={{ padding: "10px" }}
              onClick={handleUndo}
            >
              <img
                src="Assets/undo.webp"
                alt="Undo"
                style={{ maxWidth: "50px", maxHeight: "50px" }}
              ></img>
            </button>
          </div>
        </div>
        <pre className="simulation_toolbar_console">
          {consoleData}
          <div ref={consoleBottomRef} />
        </pre>
        <div className="simulation_toolbar_rightside">
          <button className="basic-button" onClick={handleClearOrphans}>
            {content.simulation.buttons[0]}
          </button>
          <button className="basic-button" onClick={() => setConsoleData("")}>
            {content.simulation.buttons[1]}
          </button>
          <button className="basic-button" onClick={handleResetBlockchain}>
            {content.simulation.buttons[2]}
          </button>
          <button
            className="basic-button"
            onClick={() => setRerenderSwitch(!rerenderSwitch)}
          >
            {content.simulation.buttons[3]}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Simulation;
