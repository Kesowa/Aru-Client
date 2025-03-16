import React, { Component } from "react";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import GeoFence from "../../static/GeoFence.svg";
import RadiusTool from "../../static/RadiusTool.svg";
import { Tooltip } from "antd";

import { UploadOutlined } from "@ant-design/icons";

import getAddressfromLatLong from "../../services/reverseGeocoding";
import { PUBLIC_URL } from "src/constants";

type mapProps = {
  areaSelected: any;
  setAreaSelected: any;
  drawingToolBtns: any;
  setDrawingToolBtns: any;
  isEditing: any;
  setlocation: any;
  location: any;
  geoLocation: any;
  setGeolocation: any;
  centerPoints: any;
  setCenterPoints: any;
  geoFence: any;
  setGeoFence: any;
};

type mapState = {
  showDrawingButtons: boolean;
  isCircleActive: boolean;
  isPolygonActive: boolean;
  isGeoJSONActive: boolean;
};

class GoogleMap extends Component<mapProps, mapState> {
  constructor(props) {
    super(props);

    this.state = {
      showDrawingButtons: true,
      isCircleActive: false,
      isPolygonActive: false,
      isGeoJSONActive: false,
    };
  }

  googleMapRef: any = React.createRef<HTMLDivElement>();
  googleSearchRef: any = React.createRef<HTMLInputElement>();
  geojsonInputRef: any = React.createRef<HTMLInputElement>();
  top = 0;
  left = 0;
  googleMap: any = null;
  drawingManager: any = null;
  oldShape: any = null;
  searchAutoComplete: any = null;

  componentDidMount() {
    const loc = { lat: 43.642567, lng: -79.387054 };
    this.googleMap = this.createGoogleMap(loc);
    this.props.setlocation(loc);

    // this.setCurrentLocation();

    this.drawingManager = this.createDrawingManager();
    this.searchAutoComplete = this.createSearchBar();
    this.drawingManager.setMap(this.googleMap);
    this.setSearchBarEvent();
    this.overlayComplete();
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

    if (this.props.isEditing) {
      const shape = this.createMeasurements(this.props.geoFence);
      if (shape) {
        this.oldShape = shape;
        this.drawingManager.setDrawingMode(null);
        this.drawingManager.setOptions({
          drawingControl: false,
        });
  
        const center: any = {};
        if (this.props.geoFence.circle) {
          center.lat = shape.getCenter().lat();
          center.lng = shape.getCenter().lng();
        } else if (this.props.geoFence.polygon) {
          const pathPoints = shape
            .getPath()
            .getArray()
            .map((data) => {
              return {
                lat: data.lat(),
                lng: data.lng(),
              };
            });
          [center.lat, center.lng] = this.findPolygonCenter(pathPoints);
        }
  
        getAddressfromLatLong(center.lat, center.lng, (err, address) => {
          if (!err) {
            if (
              (this.props.centerPoints.lat !== center.lat) ||
              (this.props.centerPoints.lng !== center.lng)
            ) {
              this.props.setCenterPoints(center);
            }
            if (this.props.geoLocation !== address) {
              this.props.setGeolocation(address);
            }
          } else {
            message.error("Location could not be fetched");
          }
        });
  
        this.setState({
          isCircleActive: !!(this.props.geoFence.circle),
          isPolygonActive: !!(this.props.geoFence.polygon),
          isGeoJSONActive: false,
          showDrawingButtons: false,
        });
        if (!this.props.areaSelected) {
          this.props.setAreaSelected(true);
        }
      }
    }

    // Drawing differnt zones
    this.zones.forEach((zone) => {
      this.fetchZoneFiles(zone);
    });

    //----------Rendering InfoWindow for all GeoJSON files loaded on map----------------------
    const infoWin = new google.maps.InfoWindow();
    const gmap = this.googleMap;
    gmap.data.addListener("click", function (event) {
      const heightLimit = event.feature.h.Elev_Allow
        ? event.feature.h.Elev_Allow
        : "None";
      const contentString =
        '<div id="content">' +
        "<h3>" +
        event.feature.h.Zone +
        "</h3>" +
        '<div style="word-wrap: break-word; width: 200px">' +
        "<p><b>Limitations: </b>" +
        heightLimit +
        "</p>" +
        "<p><b>Source: </b>" +
        event.feature.h.source +
        "</p>" +
        "</div>" +
        "</div>";
      infoWin.setContent(contentString);
      infoWin.setPosition(event.latLng);
      infoWin.open(gmap);
    });
  }

  componentDidUpdate() {
    if (
      this.props.geoFence == null &&
      !this.props.areaSelected
    ) {
      this.clearDrawing();
      this.drawingManager.setOptions({
        drawingControl: false,
      });
    }
  }

  zones = [
    {
      name: "Authorization_Zones.geojson",
      level: "Authorization_Zones",
      color: "#2894F3",
    },
    { name: "Funnel_Zone.geojson", level: "Funnel Zone", color: "#000000" },
    {
      name: "Restricted_Area.geojson",
      level: "Restricted Zone",
      color: "#E98676",
    },
    {
      name: "Kolkata_Airport.geojson",
      level: "Kolkata Airport",
      color: "#4DD637",
    },
  ];

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
  // setCurrentLocation = () => {
  //   let lat, lng;
  //   if (window.navigator.geolocation) {
  //     window.navigator.geolocation.getCurrentPosition((position) => {
  //       const lat = position.coords.latitude;
  //       const lng = position.coords.longitude;
  //       this.googleMap.panTo({ lat, lng });
  //       this.props.setlocation({ lat, lng });
  //     });
  //   }
  // };

  // Initialize Drawing Manager
  createDrawingManager = () =>
    new window.google.maps.drawing.DrawingManager({
      drawingControl: false,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.CIRCLE,
        ],
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

      const regex = new RegExp(
        /^([-+]?\d{0,20}(?:\.\d{0,20})?)(?:N)?[,\.\s]*([-+]?\d{0,20}(?:\.\d{0,20})?)(?:E)?$/,
        "i"
      );
      if (regex.test(place.name)) {
        const ans = place.name;

        const groups = ans.trim().match(regex);
        const coords = groups?.slice(1, 3).map(parseFloat);

        this.googleMap.panTo({
          lat: coords[0],
          lng: coords[1],
        });
        this.props.setlocation({
          lat: coords[0],
          lng: coords[1],
        });
        this.googleMap.setZoom(19);
        this.createMarker(coords[0], coords[1]);
      } else if (!place.geometry) {
        return;
      } else {
        console.log(place.geometry.location.lat());
        this.googleMap.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        this.props.setlocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });

        this.googleMap.setZoom(19);
        this.createMarker(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
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
      setGeolocation,
      setCenterPoints,
      setGeoFence,
    } = this.props;

    this.drawingManager.addListener("overlaycomplete", (e) => {
      setAreaSelected(areaSelected ? areaSelected : !areaSelected);
      const shape = e.overlay;
      this.oldShape = shape;

      this.drawingManager.setDrawingMode(null);

      shape.setEditable(true);

      if (e.type === "circle") {
        // Set the event to update the data if the circle is edited
        self.setCircleEditEvent(shape);

        // Circle data
        const center: any = {};
        center.lat = shape.getCenter().lat();
        center.lng = shape.getCenter().lng();
        const radius = shape.getRadius();
        const area = 4 * 3.141 * radius * radius;

        setCenterPoints(center);

        getAddressfromLatLong(center.lat, center.lng, (err, address) => {
          if (!err) {
            setCenterPoints(center);
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });
        // Set circle data to state
        setGeoFence({
          polygon: null,
          circle: { radius, area, center },
        });
      } else if (e.type === "polygon") {
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
            setCenterPoints({
              lat: center[0], 
              lng: center[1]
            });
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
        setGeoFence({
          polygon: { area, length, points: pathPoints },
          circle: null,
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

  setCircleEditEvent = (circle: any) => {
    const { setGeoFence, setGeolocation, setCenterPoints } =
      this.props;
    window.google.maps.event.addListener(
      circle,
      "radius_changed",
      function (this: any) {
        // Circle data
        const center: any = {};
        center.lat = circle.getCenter().lat();
        center.lng = circle.getCenter().lng();
        const radius = circle.getRadius();
        const area = 4 * 3.141 * radius * radius;

        getAddressfromLatLong(center.lat, center.lng, (err, address) => {
          if (!err) {
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });
        // Set circle data to state
        setGeoFence({
          polygon: null,
          circle: { radius, area, center },
        });
      }
    );

    window.google.maps.event.addListener(
      circle,
      "center_changed",
      function (this: any) {
        // Circle data
        const center: any = {};
        center.lat = circle.getCenter().lat();
        center.lng = circle.getCenter().lng();
        const radius = circle.getRadius();
        const area = 4 * 3.141 * radius * radius;

        setCenterPoints(center);

        getAddressfromLatLong(center.lat, center.lng, (err, address) => {
          if (!err) {
            setGeolocation(address);
          } else {
            message.error("Location could not be fetched");
          }
        });

        // Set circle data to state
        setGeoFence({
          polygon: null,
          circle: { radius, area, center },
        });
      }
    );
  };

  setPolygonChangeEvent = (polygon) => {
    const { setGeolocation, setCenterPoints, setGeoFence } =
      this.props;
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

        setCenterPoints({
          lat: center[0],
          lng: center[1]
        });

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
        setGeoFence({
          polygon: { area, length, points: pathPoints },
          circle: null,
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
        setCenterPoints({
          lat: center[0], 
          lng: center[1]
        });

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
        setGeoFence({
          polygon: { area, length, points: pathPoints },
          circle: null,
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
    } else if (geofence.circle) {
      obj = new window.google.maps.Circle({
        center: geofence.circle.center,
        radius: geofence.circle.radius,
      });
      this.googleMap.setCenter({
        lat: geofence.circle.center.lat,
        lng: geofence.circle.center.lng,
      });
      this.setCircleEditEvent(obj);
    }
    if (obj) {
      obj.setEditable(true);
      obj.setMap(this.googleMap);
    }

    return obj;
  };

  setCircleDrawing = () => {
    this.clearDrawing();
    this.props.setAreaSelected(false);
    this.props.setDrawingToolBtns(false);
    this.drawingManager.setDrawingMode("circle");
    this.setState({
      isCircleActive: true,
      isPolygonActive: false,
      isGeoJSONActive: false,
    });
  };

  setPolygonDrawing = () => {
    this.clearDrawing();
    this.props.setAreaSelected(false);
    this.props.setDrawingToolBtns(false);
    this.drawingManager.setDrawingMode("polygon");
    this.setState({
      isCircleActive: false,
      isPolygonActive: true,
      isGeoJSONActive: false,
    });
  };

  setGeojsonUploaded = (geojsonData) => {
    const {
      setAreaSelected,
      setGeolocation,
      setCenterPoints,
      setGeoFence,
    } = this.props;

    this.clearDrawing();
    this.props.setAreaSelected(false);
    this.props.setDrawingToolBtns(false);

    // Clear previous
    const parentMap = this.googleMap;
    parentMap.data.forEach((feature) => {
      if (feature.getId() === "UploadedGeoJSON") parentMap.data.remove(feature);
    });

    // Flight Area can't be point
    const featToAdd = geojsonData.features.filter((feature) =>
      ["MultiPolygon", "Polygon"].includes(feature.geometry.type)
    );
    if (featToAdd.length === 0) {
      message.error("Invalid GeoJSON File");
      this.geojsonInputRef.current.value = null;
      return;
    } else {
      geojsonData.features = [{ ...featToAdd[0], id: "UploadedGeoJSON" }]; // Should have single feature
      const newFeatures = this.googleMap.data.addGeoJson(geojsonData);
      console.log("Id of new feature: " + newFeatures[0].getId());
      const coords: any = [];
      const newGeometry = newFeatures[0].getGeometry();
      console.log("Geometry Type: " + newGeometry.getType());
      if (newGeometry.getType() === "MultiPolygon") {
        const polygonsContained = newGeometry.getArray();
        polygonsContained[0].forEachLatLng((latlng) => {
          coords.push({ lat: latlng.lat(), lng: latlng.lng() });
        });
      }
      if (newGeometry.getType() === "Polygon") {
        newGeometry.forEachLatLng((latlng) => {
          coords.push({ lat: latlng.lat(), lng: latlng.lng() });
        });
      }
      const center = this.findPolygonCenter(coords);
      this.googleMap.panTo({
        lat: center[0],
        lng: center[1],
      });
      getAddressfromLatLong(center[0], center[1], (err, address) => {
        if (!err) {
          setCenterPoints({
            lat: center[0], 
            lng: center[1]
          });
          setGeolocation(address);
        } else {
          message.error("Location could not be fetched");
        }
      });
      const shapePath = new window.google.maps.MVCArray<google.maps.LatLng>();
      coords.forEach((coord) => {
        shapePath.push(new window.google.maps.LatLng(coord.lat, coord.lng));
      });

      const area = window.google.maps.geometry.spherical.computeArea(shapePath);

      const length =
        window.google.maps.geometry.spherical.computeLength(shapePath);

      // Set Polygon data to State
      setGeoFence({
        polygon: { area, length, points: coords },
        circle: null,
      });

      setAreaSelected(true);

      this.setState({
        isCircleActive: false,
        isPolygonActive: false,
        isGeoJSONActive: true,
      });
    }
  };

  clearDrawing = () => {
    if (this.oldShape) {
      this.oldShape.setMap(null);
      this.oldShape = null;
      this.setState({
        isCircleActive: false,
        isPolygonActive: false,
        isGeoJSONActive: false,
      });
    }
    if (this.state.isGeoJSONActive) {
      const parentMap = this.googleMap;
      parentMap.data.forEach((feature) => {
        if (feature.getId() === "UploadedGeoJSON")
          parentMap.data.remove(feature);
      });
      this.geojsonInputRef.current.value = null;
      this.setState({
        isCircleActive: false,
        isPolygonActive: false,
        isGeoJSONActive: false,
      });
    }
    this.props.setAreaSelected(false);
    this.props.setDrawingToolBtns(false);
    this.props.setGeoFence({ polygon: null, circle: null });
  };

  createMarker = (lat, lng) => {
    return new window.google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: this.googleMap,
    });
  };

  //---------------------Draw GeoJson Zones---------------------------------------
  fetchZoneFiles = (zone) => {
    const gmap = this.googleMap;
    gmap.data.loadGeoJson(`${PUBLIC_URL}/${zone.name}`);
    gmap.data.setStyle(function (feature) {
      return {
        fillColor: feature.getProperty("color"),
        strokeColor: feature.getProperty("color"),
        strokeWeight: 1,
        strokeOpacity: 0.8,
      };
    });
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
                  <img src={GeoFence} alt="" />{" "}
                </div>
                <p>Mark Geofence</p>
              </button>
              <button
                id="tl_button"
                onClick={() => {
                  this.setCircleDrawing();
                }}
              >
                <div id="btn_img">
                  <img src={RadiusTool} alt="" />{" "}
                </div>
                <p>Mark Radius</p>
              </button>
            </div>
          )}
          {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++Search box here+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
          <div className="location_search_container">
            <input
              placeholder="Search Your Location"
              type="text"
              className="location_search"
              ref={this.googleSearchRef}
            />
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="search_marker"
              style={{ width: "25px", height: "25px" }}
              color={"#1890ff"}
            />
          </div>
          <div className="control-icons-container">
            {(this.state.isCircleActive ||
              this.state.isPolygonActive ||
              this.state.isGeoJSONActive) && (
              <div
                className="control-clear-button"
                onClick={() => {
                  this.clearDrawing();
                  this.drawingManager.setDrawingMode(null);
                  this.setState({
                    isCircleActive: false,
                    isPolygonActive: false,
                    isGeoJSONActive: false,
                  });
                }}
              >
                <p>Clear Selection</p>
              </div>
            )}
            <Tooltip
              title={
                (this.oldShape && this.state.isPolygonActive) ||
                this.state.isGeoJSONActive
                  ? "By clicking on this, your previous drawing will be removed"
                  : undefined
              }
              color={"volcano"}
            >
              <img
                src={RadiusTool}
                style={{
                  background: this.state.isCircleActive ? "#1890ff" : "#fff",
                }}
                className="control-icons"
                onClick={() => {
                  if (!this.state.isCircleActive) {
                    if (this.oldShape) {
                      this.oldShape.setMap(null);
                      this.oldShape = null;
                    }
                    this.setCircleDrawing();
                  }
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                (this.oldShape && this.state.isCircleActive) ||
                this.state.isGeoJSONActive
                  ? "By clicking on this, your previous drawing will be removed"
                  : undefined
              }
              color={"volcano"}
            >
              <img
                src={GeoFence}
                style={{
                  background: this.state.isPolygonActive ? "#1890ff" : "#fff",
                }}
                className="control-icons"
                onClick={() => {
                  if (!this.state.isPolygonActive) {
                    if (this.oldShape) {
                      this.oldShape.setMap(null);
                      this.oldShape = null;
                    }
                    this.setPolygonDrawing();
                  }
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                this.oldShape
                  ? "By clicking on this, your previous drawing will be removed"
                  : undefined
              }
              color={"volcano"}
            >
              <UploadOutlined
                className="control-icons"
                style={{
                  color: "black",
                  background: this.state.isGeoJSONActive ? "#1890ff" : "#fff",
                }}
                onClick={() => {
                  if (this.oldShape) {
                    this.oldShape.setMap(null);
                    this.oldShape = null;
                  }
                  this.geojsonInputRef.current.click();
                  console.log("Rendering Geojson");
                }}
              />
              <input
                type="file"
                accept=".geojson"
                ref={this.geojsonInputRef}
                onChange={(e) => {
                  const reader = new FileReader();
                  const parent = this;
                  reader.onload = function (e) {
                    const geojsonFile = JSON.parse(reader.result!.toString());
                    parent.setGeojsonUploaded(geojsonFile);
                  };
                  if (e.target.files?.length !== 0) {
                    reader.readAsText(e.target.files![0]);
                  }
                }}
                hidden
              />
            </Tooltip>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default GoogleMap;
