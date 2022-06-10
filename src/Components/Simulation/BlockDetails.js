import content from "../../translations/polish.json";
import Modal from "react-modal";

export default function BlockDetails(props) {
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
        {content.simulation.details[0]}: {"0x" + props.block.prevHash}
        <br />
        {content.simulation.details[1]}: {props.block.timestamp}
        <br />
        Nonce: {props.block.nonce}
        <br />
        {content.simulation.details[2]}: {props.block.type.toString()}
        <br />
        {content.simulation.details[3] + ": 0x" + props.block.merkleTreeRoot}
        <br />
        {content.simulation.details[4]}: {props.block.miner}
        <br />
        <hr style={{ border: "1px solid black" }} />
        {content.simulation.details[5]}:
        {props.block.transactions.map((tx) => {
          return (
            <li key={tx.index}>
              Hash: {"0x" + tx.hash}
              <br />
              {content.simulation.details[1]}: {tx.timestamp}
            </li>
          );
        })}
      </div>
    </Modal>
  );
}
