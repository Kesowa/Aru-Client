import { useEffect } from "react";
import { connect } from "react-redux";
import { gmapLoded } from "../../actions/gmapActions";

function Gmap(props: any) {
  useEffect(() => {
    const googleScript = document.createElement("script");
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCYWROYTFQ3XH4bhhLJnmJSV-0k9a-PHY8&libraries=drawing,geometry,places`;
    window.document.body.appendChild(googleScript);
    googleScript.addEventListener("load", () => {
      props.gmapLoded();
    });

    const razorPayScript = document.createElement("script");
    razorPayScript.src = `https://checkout.razorpay.com/v1/checkout.js`;
    window.document.body.appendChild(razorPayScript);

    razorPayScript.addEventListener("load", () => {
      console.log("Razorpay script loaded");
    });
  }, []);

  return <div>{props.children}</div>;
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  gmapLoded,
})(Gmap);
