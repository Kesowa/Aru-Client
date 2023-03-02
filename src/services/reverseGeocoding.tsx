const getAddressfromLatLong = (lat, lng, callback) => {
  const geocoder = new window.google.maps.Geocoder();
  geocoder.geocode(
    {
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    },
    (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          callback(null, results[0].formatted_address);
        } else {
          callback(new Error("not found"));
        }
      } else {
        callback(new Error("something went wrong"));
      }
    }
  );
};

export default getAddressfromLatLong;
