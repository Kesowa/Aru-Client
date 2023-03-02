import React, { useState, useEffect } from "react";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Spin, Typography } from "antd";
import "./index.less";
import convertDegreeToDirection from "../../../services/convertDegreeToDirection";

import { connect } from "react-redux";
import { setWeather } from "../../../actions/missionCreation";

const { Title, Text } = Typography;

function Weather(props) {
  const apiKey = "005654b6079a36f1533c4e910e478b50";
  const [weatherData, setWeatherData] = useState<any>("");
  const [data, setData] = useState<any>("");
  const [oneCallResData, setOneCallResData] = useState<any>("");
  const [expanded, setExpanded] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(true);
  const [currentData, setCurrentData] = useState<any>("");
  const [widgetWidth, setWidgetWidth] = useState("820px");

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${props.location.lat}&lon=${props.location.lng}&appid=${apiKey}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setOneCallResData(res);
        const forecastData: any = [];
        res.daily.map((i) => {
          const obj = {
            description: capitalize(i.weather[0].description),
            temperature: (Number(i.temp.day) - 273.16).toFixed(2),
            icon: i.weather[0].icon,
            sunset: findSunset(i.sunset),
            windSpeed: i.wind_speed,
            windDirection: convertDegreeToDirection(i.wind_deg),
            windGust: i.wind_gust,
            humidity: i.humidity,
          };
          forecastData.push(obj);
        });
        setData(forecastData);
        setWeatherData({
          ...forecastData[0],
          visibility: res.current.visibility / 1000,
        });
        setCurrentData({
          ...forecastData[0],
          visibility: res.current.visibility / 1000,
        });
      })
      .catch((err) => console.log(err));
  }, [props.location]);

  useEffect(() => {
    props.setWeather(weatherData);
  }, [weatherData]);

  function fetchHistoricalData(time) {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${props.location.lat}&lon=${props.location.lng}&dt=${time}&appid=${apiKey}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setWeatherData({
          description: capitalize(res.current.weather[0].description),
          temperature: (Number(res.current.temp) - 273.16).toFixed(2),
          icon: res.current.weather[0].icon,
          sunset: findSunset(res.current.sunset),
          windSpeed: res.current.wind_speed,
          windDirection: convertDegreeToDirection(res.current.wind_deg),
          windGust: res.current.wind_gust,
          humidity: res.current.humidity,
        });
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    const todayDate: any = new Date();
    const date: any = new Date(props.isoDate);
    const diff = Math.round((date - todayDate) / (1000 * 3600 * 24));

    if (diff == 0) {
      setWeatherData(currentData);
      setDataAvailable(true);
    } else if (diff > 0 && diff < 8) {
      setWeatherData(data[Math.abs(diff)]);
      setDataAvailable(true);
    } else if (diff < 0 && diff >= -5) {
      const time: any = Math.floor(new Date(props.isoDate).getTime() / 1000);
      fetchHistoricalData(time);
      setDataAvailable(true);
    } else {
      setDataAvailable(false);
      setWeatherData("");
    }
  }, [props.isoDate, props.location]);

  // ------------------------------------- updates forecast data hourly ---------------------
  const [count, setCount] = useState(1);
  const timer = () => {
    setWeatherData({
      description: capitalize(
        oneCallResData.hourly[count].weather[0].description
      ),
      temperature: (Number(oneCallResData.hourly[count].temp) - 273.16).toFixed(
        2
      ),
      icon: oneCallResData.hourly[count].weather[0].icon,
      sunset: findSunset(oneCallResData.current.sunset),
      windSpeed: oneCallResData.hourly[count].wind_speed,
      windDirection: convertDegreeToDirection(
        oneCallResData.hourly[count].wind_deg
      ),
      windGust: oneCallResData.hourly[count].wind_gust,
      humidity: oneCallResData.hourly[count].humidity,
    });
    setCount(count + 1);
    console.log(count);
  };

  useEffect(() => {
    if (props.type == "live" && data) {
      if (count == 47) {
        return;
      }
      const id = setInterval(timer, 60 * 60 * 1000);
      return () => clearInterval(id);
    }
  }, [count, data]);

  function findSunset(unix_timestamp) {
    const date = new Date(unix_timestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const formattedTime = hours + ":" + minutes.substr(-2);
    return formattedTime;
  }

  function capitalize(input) {
    const words = input.split(" ");
    const CapitalizedWords: any = [];
    words.forEach((element) => {
      CapitalizedWords.push(
        element[0].toUpperCase() + element.slice(1, element.length)
      );
    });
    return CapitalizedWords.join(" ");
  }

  function visibiltyDesc(num) {
    let result = "";
    if (num <= 1) result = "Fog";
    else if (num > 1 && num <= 2) result = "Mist";
    else if (num > 2 && num <= 5) result = "Haze";
    else result = "Clear";
    return result;
  }

  function humidityDesc(num) {
    let result = "";
    if (num < 30) result = "Low";
    else if (num >= 30 && num <= 50) result = "Moderate";
    else result = "High";
    return result;
  }

  function nth(d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const pr = window.devicePixelRatio;
    if (pr == 1.5) setWidgetWidth("700px");
  }, []);

  const date = (
    <div>
      <Text className="weatherList">
        {days[new Date(props.isoDate).getDay()]}
      </Text>
      <Title className="weatherTitle" level={3}>
        {new Date(props.isoDate).getDate()}
        <sub style={{ fontSize: "14px" }}>
          {nth(new Date(props.isoDate).getDate())}
        </sub>
      </Title>
      <Text className="weatherList">
        {monthNames[new Date(props.isoDate).getMonth()]},{" "}
        {new Date(props.isoDate).getFullYear()}
      </Text>
    </div>
  );

  const parameters = (
    <React.Fragment>
      <div className="weather-parameter">
        <Text type="secondary" className="weatherList">
          Summary
        </Text>
        <Title className="weatherTitle" level={3}>
          {weatherData.temperature}
          <sup>o</sup>C
        </Title>
        <Text type="secondary" className="weatherList">
          {weatherData.description}
        </Text>
      </div>
      <div className="weather-parameter">
        <Text type="secondary" className="weatherList">
          Wind
        </Text>
        <Title className="weatherTitle" level={3}>
          {weatherData.windSpeed}
          <sub style={{ fontSize: "14px" }}>mph</sub>
        </Title>
        <Text type="secondary" className="weatherList">
          From {weatherData.windDirection}
        </Text>
      </div>
      {weatherData.windGust && (
        <div className="weather-parameter">
          <Text type="secondary" className="weatherList">
            Gusts
          </Text>
          <Title className="weatherTitle" level={3}>
            {weatherData.windGust}
            <sub style={{ fontSize: "14px" }}>mph</sub>
          </Title>
          <Text type="secondary" className="weatherList">
            High Variance
          </Text>
        </div>
      )}
      {weatherData.visibility && (
        <div className="weather-parameter">
          <Text type="secondary" className="weatherList">
            Visibility
          </Text>
          <Title className="weatherTitle" level={3}>
            {weatherData.visibility}
            <sub style={{ fontSize: "14px" }}>km</sub>
          </Title>
          <Text type="secondary" className="weatherList">
            {visibiltyDesc(weatherData.visibility)}
          </Text>
        </div>
      )}
      <div className="weather-parameter">
        <Text type="secondary" className="weatherList">
          Humidity
        </Text>
        <Title className="weatherTitle" level={3}>
          {weatherData.humidity}
          <sub style={{ fontSize: "14px" }}>%</sub>
        </Title>
        <Text type="secondary" className="weatherList">
          {humidityDesc(weatherData.humidity)}
        </Text>
      </div>
      <div className="weather-parameter">
        <Text type="secondary" className="weatherList">
          Daylight
        </Text>
        <Title className="weatherTitle" level={3}>
          {weatherData.sunset}
          <sub style={{ fontSize: "14px" }}>hr</sub>
        </Title>
        <Text type="secondary" className="weatherList">
          Sunset
        </Text>
      </div>
    </React.Fragment>
  );

  const weatherBox = (
    <div
      className="weather_box"
      style={{ width: expanded ? widgetWidth : "120px" }}
    >
      <Row style={{ height: "100%" }}>
        <Col span={expanded ? 4 : 24} style={{ padding: "10px" }}>
          <div className="forcast">
            {weatherData ? (
              <div>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                  alt=""
                  style={{
                    width: "60px",
                    height: "60px",
                  }}
                />
              </div>
            ) : (
              <div>
                <FontAwesomeIcon
                  icon={faSun}
                  style={{
                    width: "40px",
                    height: "40px",
                    marginRight: "20px",
                  }}
                />
              </div>
            )}
            <div>
              {expanded ? (
                <LeftOutlined
                  style={{ fontSize: "larger" }}
                  onClick={() => setExpanded(false)}
                />
              ) : (
                <RightOutlined
                  style={{ fontSize: "larger" }}
                  onClick={() => setExpanded(true)}
                />
              )}
            </div>
          </div>
        </Col>
        <Col
          span={expanded ? 20 : 0}
          style={{ display: expanded ? "inline" : "none" }}
        >
          {dataAvailable ? (
            <React.Fragment>
              {weatherData ? (
                <div
                  style={{
                    display: "inline-flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {date}
                  {parameters}
                </div>
              ) : (
                <Spin style={{ marginTop: "25px", textAlign: "center" }} />
              )}
            </React.Fragment>
          ) : (
            <Title
              style={{ marginTop: "25px", textAlign: "center", color: "grey" }}
              level={3}
            >
              Weather Not Available
            </Title>
          )}
        </Col>
      </Row>
    </div>
  );

  const liveBox = (
    <div className="live-box">
      <div
        style={{
          display: "inline-flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {date}
        <div style={{ alignSelf: "center" }}>
          <Title level={3} style={{ textAlign: "center", fontWeight: 500 }}>
            Weather Forecast
          </Title>
        </div>
        <div style={{ alignSelf: "center" }}>
          {weatherData ? (
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
              alt=""
              style={{
                width: "60px",
                height: "60px",
              }}
            />
          ) : (
            <FontAwesomeIcon
              icon={faSun}
              style={{
                width: "40px",
                height: "40px",
                marginRight: "20px",
              }}
            />
          )}
        </div>
      </div>
      {weatherData ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {parameters}
        </div>
      ) : (
        <Spin
          style={{ marginTop: "25px", textAlign: "center", width: "100%" }}
        />
      )}
    </div>
  );

  return <> {props.type == "live" ? liveBox : weatherBox}</>;
}

const mapStateToProps = (state: any) => ({
  weather: state.MissionCreation.weather,
});

export default connect(mapStateToProps, {
  setWeather,
})(Weather);
