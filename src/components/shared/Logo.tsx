import React from "react";
import Logo from "../../assets/logo.png";

const LogoRender = (props: any) => {
  return <img src={Logo} className={props.className} alt={props.alt} />;
};

export default LogoRender;
