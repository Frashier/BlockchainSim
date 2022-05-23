import "./Homepage.css";
import "../../index.css";
import { motion } from "framer-motion";

function Homepage() {
  return (
    <motion.div className="homepage">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_header"
      >
        <h1>Czym jest blockchain?</h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "first-text" }}
      >
        <p style={{ gridArea: "first-text" }}>
          Blockchain to jednokierunkowa lista rekordów nazywanych blokami. Bloki
          można dodawać jedynie na końcu listy, a każdy z nich jest pozwiązany z
          poprzednikiem przy pomocy funkcji haszującej.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "first-image" }}
      >
        <img
          src="Assets/Blockchain.svg"
          alt="Blockchain structure"
          style={{ float: "right", height: "500px", gridArea: "first-image" }}
        ></img>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "second-text" }}
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          condimentum justo vel nulla tincidunt, et efficitur nisl pellentesque.
          Nullam venenatis nisi sed massa condimentum facilisis. Proin tincidunt
          est sit amet risus rutrum, non consequat dui ultrices. Phasellus
          consequat porta ante, quis gravida arcu molestie eget. Donec arcu
          enim, vestibulum id magna ut, pharetra ullamcorper libero. Vestibulum
          dapibus interdum arcu. Vivamus elementum varius risus ac finibus.
          Donec vehicula enim efficitur venenatis rhoncus. In pretium sodales
          blandit. Fusce rutrum felis et enim sagittis consectetur. Nulla congue
          in dolor non euismod. Pellentesque habitant morbi tristique senectus
          et netus et malesuada fames ac turpis egestas.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "second-image" }}
      >
        <img
          src="Assets/Bitcoin_Block_data.svg"
          alt="Blockchain structure"
          style={{ float: "left", maxWidth: "100%" }}
        ></img>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "third-text" }}
      ></motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "thid-image" }}
      ></motion.div>
    </motion.div>
  );
}

export default Homepage;
