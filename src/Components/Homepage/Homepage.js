import "./Homepage.css";
import "../../index.css";

function Homepage() {
  return (
    <div className="homepage">
      <div className="homepage_header">
        <h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
      </div>
      <div className="homepage_body">
        <p>
          <img
            src="Assets/Blockchain.svg"
            alt="Blockchain structure"
            style={{ float: "right", height: "500px" }}
          ></img>
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
          <img
            src="Assets/Bitcoin_Block_data.svg"
            alt="Blockchain structure"
            style={{ float: "left", width: "100%" }}
          ></img>
        </p>
      </div>
    </div>
  );
}

export default Homepage;
