import { useState, useEffect } from "react";
import Places from "./Places.jsx";
import ErrorLog from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchData } from "../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchingData() {
      setIsFetching(true);
      try {
        const resData = await fetchData("http://localhost:3000/places");
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            resData.places,
            position.coords.latitude,
            position.coords.longitude,
          );
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });
      } catch (error) {
        setError({
          message:
            error.message || "Faild to fetch the places, please try again ",
        });
        setIsFetching(false);
      }
    }

    fetchingData();
  }, []);

  if (error !== "") {
    console.log(error);
    return <ErrorLog title="Fetching Error" message={error.message} />;
  }

  return (
    <Places
      title="Available Places"
      isLoading={isFetching}
      loadingText="Fetching Places Data..."
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
