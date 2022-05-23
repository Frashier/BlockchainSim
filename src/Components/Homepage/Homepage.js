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
      ></motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="homepage_body"
        style={{ gridArea: "first-text" }}
      >
        <h1>Blockchain</h1>
        <p>
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
        <h1>Blok</h1>
        <p>
          Blok to podstawowy element składowy blockchain. Składa się z nagłówka
          zawierającego hasz zawartości poprzedniego bloku, korzeń drzewa haszy
          i nonce oraz danych zawierających zapis transakcji wykonanych w danym
          bloku.
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
