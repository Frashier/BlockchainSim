import "./Simulation.css";
import "../../index.css";
import BlockchainComponent from "./BlockchainComponent";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Block, Blockchain, BlockType } from "./utils/blockchain";
import Modal from "react-modal";

// TODO:
// verify block?
// verify blockchain?

Modal.setAppElement(document.getElementById("root"));

function Simulation() {
  // Blockchain related states
  const [blockchain, setBlockchain] = useState(new Blockchain(2));
  const [blockSelected, setBlockSelected] = useState(blockchain.blocks[0]);
  const [miner, setMiner] = useState("Nieznany");

  // Interface utilites
  const [consoleData, setConsoleData] = useState("");
  const [blockchainScale, setBlockchainScale] = useState(1);
  const [rerenderSwitch, setRerenderSwitch] = useState(false);

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
    setRerenderSwitch(!rerenderSwitch);
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
          <button
            className="basic-button"
            onClick={() => setRerenderSwitch(!rerenderSwitch)}
          >
            Wycentruj blockchain
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Simulation;
