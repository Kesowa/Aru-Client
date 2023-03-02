import React from "react";
import "./index.less";
import { connect } from "react-redux";

function Loader(props: any) {
  return (
    <div
      className={
        props.loader.loading_active > 0
          ? "loader-wrapper vsbl"
          : "loader-wrapper nt-vsbl"
      }
    >
      <div id="loader_bar">
        <b></b>
        <i></i>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  loader: state.Loader,
});

export default connect(mapStateToProps, {})(Loader);
