import "./Homepage.css";
import "../../index.css";
import CustomDiv from "./CustomDiv";
import { motion } from "framer-motion";

function Homepage() {
  return (
    <motion.div className="homepage">
      <CustomDiv className="homepage_header"></CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "first-text" }}>
        <h1>Blockchain</h1>
        <p>
          Blockchain to jednokierunkowa lista rekordów nazywanych blokami. Bloki
          można dodawać jedynie na końcu listy, a każdy z nich jest pozwiązany z
          poprzednikiem przy pomocy funkcji haszującej.
        </p>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "first-image" }}>
        <img
          src="Assets/Blockchain.svg"
          alt="Blockchain structure"
          style={{ float: "right", height: "500px", gridArea: "first-image" }}
        ></img>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "second-text" }}>
        <h1>Blok</h1>
        <p>
          Blok to podstawowy element składowy blockchain. Składa się z nagłówka
          zawierającego hasz zawartości poprzedniego bloku, korzeń drzewa haszy
          i nonce oraz danych zawierających zapis transakcji wykonanych w danym
          bloku.
        </p>
      </CustomDiv>
      <CustomDiv className="homepage_body" style={{ gridArea: "second-image" }}>
        <img
          src="Assets/Bitcoin_Block_data.svg"
          alt="Blockchain structure"
          style={{ float: "left", maxWidth: "100%" }}
        ></img>
      </CustomDiv>
      <CustomDiv
        className="homepage_body"
        style={{ gridArea: "third-text" }}
      ></CustomDiv>
      <CustomDiv
        className="homepage_body"
        style={{ gridArea: "thid-image" }}
      ></CustomDiv>
    </motion.div>
  );
}

export default Homepage;
