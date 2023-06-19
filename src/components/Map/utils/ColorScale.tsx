import "./scale.less";

const ShowColorscale = (props) => {
  return (
    <div id="Scale">
      <svg className="Rectangle_1877">
        <rect
          id="Rectangle_1877"
          rx="2"
          ry="2"
          x="0"
          y="0"
          width="308"
          height="120"
        ></rect>
      </svg>
      <div id="Elevation_scale">
        <span>Elevation scale</span>
      </div>
      <div id="minp">
        <span>{props.settings.minp.toFixed(4)}m</span>
      </div>
      <div id="maxp">
        <span>{props.settings.maxp.toFixed(4)}m</span>
      </div>
      <div id="layer_name">
        <span>{props.name}</span>
      </div>

      <div id="img">
        <img
          style={{ height: "20px", width: "282px" }}
          src={`/${props.colorMap}.jpeg`}
          alt=""
        />
      </div>

      <svg className="Path_10644" viewBox="-183 -10135.605 281.358 7.617">
        <path
          id="Path_10644"
          d="M -183 -10127.98828125 L -183 -10135.60546875 L 98.35796356201172 -10135.60546875 L 98.35796356201172 -10127.98828125"
        ></path>
      </svg>
      <svg className="Path_10645" viewBox="-30.755 -10135.605 1 7.791">
        <path
          id="Path_10645"
          d="M -30.7552604675293 -10135.60546875 L -30.7552604675293 -10127.814453125"
        ></path>
      </svg>
    </div>
  );
};

export default ShowColorscale;
