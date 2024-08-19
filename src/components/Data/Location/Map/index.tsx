import React, { Component } from "react";
import s_m from "../../../../Icons/start_measurement.svg";
import "../../../Missions/Create/index.less";
import { connect } from "react-redux";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import GeoFence from "../../../../static/GeoFence.svg";

import { showDrawing } from "../../../../actions/gmapActions";

import getAddressfromLatLong from "../../../../services/reverseGeocoding";

type mapProps = {
  areaSelected: any;
  setAreaSelected: any;
  drawingToolBtns: any;
  setDrawingToolBtns: any;
  setGeolocation: any;
  showDrawing: any;
  polygonData: any;
  setPolygonData: any;
  isEditing: any;
  locationToEdit: any;
};

type mapState = {
  showDrawingButtons: boolean;
  isPolygonActive: boolean;
};

class LocationMap extends Component<mapProps, mapState> {
  constructor(props) {
    super(props);

    this.state = {
      showDrawingButtons: true,
      isPolygonActive: false,
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleSearchRef: any = React.createRef<HTMLInputElement>();
  tl = null;
  container: any = null;
  top = 0;
  left = 0;
  googleMap: any = null;
  drawingManager: any = null;
  oldShape: any = null;
  searchAutoComplete: any = null;

  componentDidMount() {
    const loc = { lat: 43.642567, lng: -79.387054 };
    this.googleMap = this.createGoogleMap(loc);

    if (!this.props.isEditing) {
      this.setCurrentLocation();
    }

    this.drawingManager = this.createDrawingManager();
    this.searchAutoComplete = this.createSearchBar();
    this.drawingManager.setMap(this.googleMap);
    this.setSearchBarEvent();
    this.overlayComplete();
    this.container = document.getElementById("gmap_container");
    // Pin drop
    this.googleMap.addListener("dblclick", (e) => {
      if (this.oldShape) {
        this.setState({
          showDrawingButtons: false,
        });
      } else {
        this.setState({
          showDrawingButtons: true,
        });
      }
      this.props.setDrawingToolBtns(false);
      this.top = e.pixel.y - 100;
      this.left = e.pixel.x + 30;
      this.props.setDrawingToolBtns(true);
    });

    this.googleMap.addListener("click", () => {
      this.props.setDrawingToolBtns(false);
    });

    this.googleMap.addListener("click", (e) => {
      this.props.setDrawingToolBtns(false);
    });

    if (this.props.isEditing && this.props.locationToEdit) {
      const obj: any = new Object();
      obj.polygon = {
        points: this.props.locationToEdit.geometry.coordinates[0].map((point) => {
          return {
            lng: point[0],
            lat: point[1],
          };
        }),
        length: this.props.locationToEdit.geometry.coordinates[0].length,
      };

      const shape = this.createMeasurements(obj);

      if (shape) {
        this.oldShape = shape;

        this.drawingManager.setDrawingMode(null);

        shape.setEditable(true);

        this.setPolygonChangeEvent(shape);

        // Polygon data
        const pathPoints = shape
          .getPath()
          .getArray()
          .map((data) => {
            return {
              lat: data.lat(),
              lng: data.lng(),
            };
          });

        const center = this.findPolygonCenter(pathPoints);

        getAddressfromLatLong(center[0], center[1], (err, address) => {
          if (!err) {
            this.props.setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });

        const area = window.google.maps.geometry.spherical.computeArea(
          shape.getPath()
        );

        const length = window.google.maps.geometry.spherical.computeLength(
          shape.getPath()
        );
        // Set Polygon data to State
        this.props.setPolygonData({
          area,
          length,
          points: pathPoints,
        });
        this.props.setAreaSelected(true);
        this.drawingManager.setOptions({
          drawingControl: false,
        });
        this.setState({
          isPolygonActive: true,
          showDrawingButtons: false,
        });
      }
    }
  }

  componentDidUpdate() {
    if (!this.props.showDrawing) {
      this.oldShape.setMap(null);
      this.props.showDrawing(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.polygonData !== null && nextProps.polygonData === null) {
      this.clearDrawing();
      this.drawingManager.setOptions({
        drawingControl: false,
      });
    }
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
      zoomControl: true,
      scaleControl: true,
      disableDoubleClickZoom: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: ["roadmap", "satellite"],
      },
    });
  };

  // Set Current location of user
  setCurrentLocation = () => {
    let lat, lng;
    if (window.navigator.geolocation) {
      console.log(
        window.navigator.geolocation.getCurrentPosition((position) => {
          console.log(position);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.googleMap.panTo({ lat, lng });
        })
      );
    }
  };

  // Initialize Drawing Manager
  createDrawingManager = () =>
    new window.google.maps.drawing.DrawingManager({
      drawingControl: false,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
      },
    });

  //initialize search bar
  createSearchBar = () =>
    new window.google.maps.places.Autocomplete(this.googleSearchRef.current, {
      types: ["establishment"],
      fields: ["place_id", "name", "geometry"],
      componentRestrictions: { country: ["IN"] },
    });

  setSearchBarEvent = () => {
    this.searchAutoComplete.addListener("place_changed", () => {
      const place = this.searchAutoComplete.getPlace();
      if (!place.geometry) {
        return;
      } else {
        this.googleMap.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  };

  findPolygonCenter = (points) => {
    const bounds = new window.google.maps.LatLngBounds();

    const polygonCoords: google.maps.LatLng[] = [];

    for (const x of points) {
      const llbound = new window.google.maps.LatLng(x.lat, x.lng);
      polygonCoords.push(llbound);
    }
    let i;
    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    const centerOfPolygon = bounds.getCenter();

    return [centerOfPolygon.lat(), centerOfPolygon.lng()];
  };

  // Function to execute when drawing is complete
  overlayComplete = () => {
    const self: any = this;
    const {
      setAreaSelected,
      areaSelected,
      setPolygonData,
      setGeolocation,
    } = this.props;

    this.drawingManager.addListener("overlaycomplete", (e) => {
      setAreaSelected(areaSelected ? areaSelected : !areaSelected);
      const shape = e.overlay;
      this.oldShape = shape;

      this.drawingManager.setDrawingMode(null);

      shape.setEditable(true);

      if (e.type === "polygon") {
        // Set Edit events for polygon
        self.setPolygonChangeEvent(shape);

        // Polygon data
        const pathPoints = shape
          .getPath()
          .getArray()
          .map((data) => {
            return {
              lat: data.lat(),
              lng: data.lng(),
            };
          });

        const center = self.findPolygonCenter(pathPoints);

        getAddressfromLatLong(center[0], center[1], (err, address) => {
          if (!err) {
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });

        const area = window.google.maps.geometry.spherical.computeArea(
          shape.getPath()
        );

        const length = window.google.maps.geometry.spherical.computeLength(
          shape.getPath()
        );
        // Set Polygon data to State
        setPolygonData({
          area,
          length,
          points: pathPoints,
        });
      }
      this.drawingManager.setOptions({
        drawingControl: false,
      });

      if (this.state.showDrawingButtons) {
        this.setState({
          showDrawingButtons: false,
        });
      }
    });
  };

  setPolygonChangeEvent = (polygon) => {
    const { setPolygonData, setGeolocation } = this.props;
    const self = this;
    window.google.maps.event.addListener(
      polygon.getPath(),
      "set_at",
      function (this: any) {
        const pathPoints = polygon
          .getPath()
          .getArray()
          .map((data) => {
            return {
              lat: data.lat(),
              lng: data.lng(),
            };
          });

        const center = self.findPolygonCenter(pathPoints);

        getAddressfromLatLong(center[0], center[1], (err, address) => {
          if (!err) {
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });
        const area = window.google.maps.geometry.spherical.computeArea(
          polygon.getPath()
        );

        const length = window.google.maps.geometry.spherical.computeLength(
          polygon.getPath()
        );

        // Set Polygon data to State
        setPolygonData({
          area,
          length,
          points: pathPoints,
        });
      }
    );

    window.google.maps.event.addListener(
      polygon.getPath(),
      "insert_at",
      function (this: any) {
        const pathPoints = polygon
          .getPath()
          .getArray()
          .map((data) => {
            return {
              lat: data.lat(),
              lng: data.lng(),
            };
          });

        const center = self.findPolygonCenter(pathPoints);

        getAddressfromLatLong(center[0], center[1], (err, address) => {
          if (!err) {
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });

        const area = window.google.maps.geometry.spherical.computeArea(
          polygon.getPath()
        );

        const length = window.google.maps.geometry.spherical.computeLength(
          polygon.getPath()
        );
        // Set Polygon data to State
        setPolygonData({
          area,
          length,
          points: pathPoints,
        });
      }
    );
  };

  createMeasurements = (geofence) => {
    let obj;
    if (geofence.polygon) {
      const { points } = geofence.polygon;

      const geoPoints = points.map((point) => {
        return {
          lat: point.lat,
          lng: point.lng,
        };
      });

      obj = new window.google.maps.Polygon({
        paths: geoPoints,
      });
      const center = this.findPolygonCenter(geoPoints);
      this.googleMap.setCenter({ lat: center[0], lng: center[1] });
      this.setPolygonChangeEvent(obj);
    }
    if (obj) {
      obj.setEditable(true);
      obj.setMap(this.googleMap);
    }

    return obj;
  };

  setPolygonDrawing = () => {
    this.props.setDrawingToolBtns(false);
    this.drawingManager.setDrawingMode("polygon");
    this.setState({
      isPolygonActive: true,
    });
  };

  clearDrawing = () => {
    if (this.oldShape || this.props.polygonData === null) {
      this.oldShape.setMap(null);
      this.oldShape = null;
      this.props.setAreaSelected(false);
      this.props.setDrawingToolBtns(false);
      this.setState({
        isPolygonActive: false,
      });
    }
  };

  clearIncompleteDrawing = () => {
    if (this.oldShape || this.props.polygonData === null) {
      this.drawingManager.setDrawingMode(null);
      this.oldShape.setMap(null);
      this.oldShape = null;
      this.props.setAreaSelected(false);
      this.props.setDrawingToolBtns(false);
      this.props.setPolygonData(null);
      this.setState({
        isPolygonActive: false,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div id="data_gmap_container">
          <div
            id="google-map"
            ref={this.googleMapRef}
            style={{
              width: "100%",
              height: "74vh",
            }}
          />
          {this.props.drawingToolBtns && this.state.showDrawingButtons && (
            <div
              className="drawing_manager_tools"
              style={{ top: this.top + "px", left: this.left + "px" }}
            >
              <button
                id="tl_button"
                onClick={() => {
                  this.setPolygonDrawing();
                }}
              >
                <div id="btn_img">
                  <img src={s_m} alt="" />{" "}
                </div>
                <p>Mark Geofence</p>
              </button>
            </div>
          )}
          {this.props.drawingToolBtns && !this.state.showDrawingButtons && (
            <div
              className="drawing_manager_tools"
              style={{ top: this.top + "px", left: this.left + "px" }}
            >
              <button
                id="tl_button"
                onClick={() => {
                  this.clearDrawing();
                }}
              >
                <div id="btn_img">
                  <img src={s_m} alt="" />{" "}
                </div>
                <p>Redraw Geofence</p>
              </button>
            </div>
          )}
          <div className="data_location_search_container">
            <input
              placeholder="Search Your Location"
              type="text"
              className="data_location_search"
              ref={this.googleSearchRef}
            />
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="data_search_marker"
              style={{ width: "25px", height: "25px" }}
              color={"#1890ff"}
            />
          </div>
          <div className="control-icons-container">
            {this.state.isPolygonActive && (
              <div
                className="control-clear-button"
                onClick={this.clearIncompleteDrawing}
              >
                <p>Clear Selection</p>
              </div>
            )}
            <img
              src={GeoFence}
              style={{
                background: this.state.isPolygonActive ? "#1890ff" : "#fff",
              }}
              className="control-icons"
              onClick={this.setPolygonDrawing}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: any) => ({
  showDrawing: state.Gmap.showDrawing,
});

export default connect(mapStateToProps, {
  showDrawing,
})(LocationMap);
