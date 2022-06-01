import "./Homepage.css";
import "../../index.css";
import structureImage from "../../Assets/Blockchain.svg";
import blockImage from "../../Assets/bitcoin_block.svg";
import networkImage from "../../Assets/P2P_network.svg";
import CustomDiv from "./CustomDiv";
import content from "../../translations/polish.json";
import { motion } from "framer-motion";

function Homepage() {
  return (
    <motion.div className="homepage">
      <CustomDiv className="homepage_header">
        <h1>{content.homepage.mainHeader}</h1>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "first-text" }}>
        <h1>{content.homepage.header[0]}</h1>
        <p>{content.homepage.body[0]}</p>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "first-image" }}>
        <img
          src={structureImage}
          alt="Blockchain structure"
          style={{ height: "500px" }}
        ></img>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "second-text" }}>
        <h1>{content.homepage.header[1]}</h1>
        <p>{content.homepage.body[1]}</p>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "second-image" }}>
        <img
          src={blockImage}
          alt="Block structure"
          style={{ maxWidth: "100%" }}
        ></img>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "third-text" }}>
        <h1>{content.homepage.header[2]}</h1>
        <p>{content.homepage.body[2]}</p>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "third-image" }}>
        <img
          src={networkImage}
          alt="Blockchain network"
          style={{ maxWidth: "100%" }}
        ></img>
      </CustomDiv>
    </motion.div>
  );
}

export default Homepage;
