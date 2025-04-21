import React, { Component } from "react";
import { StreamKeyConnect as connectSocket } from "../../../../services/socketConnect";

type mapProps = {
  streamKey: string;
};

type mapState = {
  position: {
    lat: number;
    lng: number;
  };
  orientation: any;
};

class GridMap extends Component<mapProps, mapState> {
  constructor(props: any) {
    super(props);
    this.state = {
      position: { lat: 43.642567, lng: -79.387054 },
      orientation: 0,
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleMap: any = null;
  marker: any = null;
  socket: any = null;

  componentDidMount() {
    const loc = { lat: 43.642567, lng: -79.387054 };
    this.googleMap = this.createGoogleMap(loc);

    // Initializing the socket

    this.socket = connectSocket(this.props.streamKey);

    // Listening Drone data event

    this.socket.on("TELEMETRY", (data) => {
      console.log("drone ", data);
      this.setState({
        ...this.state,
        position: {
          lat: data.location.lat,
          lng: data.location.long,
        },
        orientation: data.compass,
      });
    });

    if (this.googleMap) {
      this.googleMap.addListener("click", (e) => {
        console.log("clicked");
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.position !== prevState.position) {
      this.googleMap.panTo({
        lat: this.state.position.lat,
        lng: this.state.position.lng,
      });

      if (this.marker) {
        this.marker.setPosition({
          lat: this.state.position.lat,
          lng: this.state.position.lng,
        });
        this.marker.setIcon({
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: "#ff6565",
          fillOpacity: 1,
          strokeWeight: 4,
          strokeColor: "#CC5555",
          rotation: this.state.orientation,
          scale: 10,
          anchor: new google.maps.Point(0, 2.6),
        });
      } else {
        this.marker = this.createMarker(
          {
            lat: this.state.position.lat,
            lng: this.state.position.lng,
          },
          this.state.orientation
        );
      }
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  // Intialize Google Map
  createGoogleMap = ({ lat, lng }) => {
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
  };

  createMarker = (location, compass) => {
    if (this.marker) {
      this.marker.setMap(null);
    }

    const icon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: "#ff6565",
      fillOpacity: 1,
      strokeWeight: 4,
      strokeColor: "#CC5555",
      rotation: compass,
      scale: 10,
      anchor: new google.maps.Point(0, 2.6),
    };

    return new window.google.maps.Marker({
      position: location,
      map: this.googleMap,
      icon: icon,
    });
  };

  render() {
    return (
      <React.Fragment>
        <div
          id="gmap_container"
          style={{ borderRadius: "8px", boxShadow: "0px 2px 10px #00000028" }}
        >
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

export default GridMap;
