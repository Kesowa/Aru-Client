import React, { Component } from "react";
import { connect } from "react-redux";
import connectSocket from "../../../../services/socketConnect";

type mapProps = {
  gmapLoaded: boolean;
  feeds: object;
};

type mapState = {
  position_1: {
    lat: number;
    lng: number;
  };
  position_2: {
    lat: number;
    lng: number;
  };
};

class TwoFeedsMap extends Component<mapProps, mapState> {
  constructor(props) {
    super(props);
    this.state = {
      position_1: { lat: 43.642567, lng: -79.387054 },
      position_2: { lat: 43.642567, lng: -79.387054 },
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleMap: any = null;
  marker_1: any = null;
  marker_2: any = null;
  socket_1: any = null;
  socket_2: any = null;

  componentDidMount() {
    const loc = { lat: 43.642567, lng: -79.387054 };
    this.googleMap = this.createGoogleMap(loc);

    if (this.props.feeds[0].streamKey) {
      this.socket_1 = connectSocket(this.props.feeds[0].streamKey);

      // Listening Drone data event

      this.socket_1.on("TELEMETRY", (data) => {
        console.log("drone ", data);
        this.setState({
          ...this.state,
          position_1: {
            lat: data.location.lat,
            lng: data.location.long,
          },
        });
      });
    }

    if (this.props.feeds[1].streamKey) {
      this.socket_2 = connectSocket(this.props.feeds[1].streamKey);

      // Listening Drone data event

      this.socket_2.on("TELEMETRY", (data) => {
        console.log("drone ", data);
        this.setState({
          ...this.state,
          position_2: {
            lat: data.location.lat,
            lng: data.location.long,
          },
        });
      });
    }

    if (this.googleMap) {
      this.googleMap.addListener("click", (e) => {
        console.log("clicked");
      });
    }
  }

  componentWillUnmount() {
    if (this.socket_1) {
      this.socket_1.close();
    }

    if (this.socket_2) {
      this.socket_2.close();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.gmapLoaded && this.props.gmapLoaded) {
      const loc = { lat: 43.642567, lng: -79.387054 };
      this.googleMap = this.createGoogleMap(loc);

      if (this.googleMap) {
        this.googleMap.addListener("click", (e) => {
          console.log("clicked");
        });
      }
    }

    if (this.state.position_1 !== prevState.position_1) {
      this.googleMap.panTo({
        lat: this.state.position_1.lat,
        lng: this.state.position_1.lng,
      });

      if (this.marker_1 !== null) {
        this.marker_1.setPosition({
          lat: this.state.position_1.lat,
          lng: this.state.position_1.lng,
        });
      } else {
        this.marker_1 = this.createMarker({
          lat: this.state.position_1.lat,
          lng: this.state.position_1.lng,
        });
      }
    }

    if (this.state.position_2 !== prevState.position_2) {
      this.googleMap.panTo({
        lat: this.state.position_2.lat,
        lng: this.state.position_2.lng,
      });

      if (this.marker_2 !== null) {
        this.marker_2.setPosition({
          lat: this.state.position_2.lat,
          lng: this.state.position_2.lng,
        });
      } else {
        this.marker_1 = this.createMarker({
          lat: this.state.position_2.lat,
          lng: this.state.position_2.lng,
        });
      }
    }
  }

  createMarker = (location) => {
    console.log(location);
    const icon = {
      url: `/drone.png`, // url
      scaledSize: new window.google.maps.Size(35, 35), // scaled size
      origin: new window.google.maps.Point(0, 0), // origin
      anchor: new window.google.maps.Point(0, 0), // anchor
    };

    return new window.google.maps.Marker({
      position: location,
      map: this.googleMap,
      icon: icon,
    });
  };

  // Intialize Google Map
  createGoogleMap = ({ lat, lng }) => {
    if (this.props.gmapLoaded) {
      return new window.google.maps.Map(this.googleMapRef.current, {
        zoom: 16,
        center: {
          lat,
          lng,
        },
        disableDefaultUI: true,
        zoomControl: false,
        scaleControl: false,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          mapTypeIds: ["roadmap", "satellite"],
        },
      });
    }
    return null;
  };

  render() {
    return (
      <React.Fragment>
        <div id="gmap_container">
          <div
            id="google-map"
            ref={this.googleMapRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gmapLoaded: state.Gmap.gmapLoaded,
  };
};

export default connect(mapStateToProps)(TwoFeedsMap);
