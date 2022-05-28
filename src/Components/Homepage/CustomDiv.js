import "./Homepage.css";
import "../../index.css";
import { motion } from "framer-motion";

export default function CustomDiv(props) {
  return (
    <motion.div
      className={props.className}
      style={props.style}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      {props.children}
    </motion.div>
  );
}
