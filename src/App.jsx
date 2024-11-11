import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchData, updateUserPlaces } from "./http.js";
import ErrorLog from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const userSavedPlaces = async () => {
      setIsFetching(() => true);
      try {
        const resData = await fetchData("http://localhost:3000/user-places");

        setUserPlaces(resData.places);
      } catch (error) {
        setError({
          message:
            error.message || "failed to load user places, please try again",
        });
      }
      setIsFetching(() => false);
    };

    userSavedPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      const resData = await updateUserPlaces(
        "http://localhost:3000/user-places",
        [selectedPlace, ...userPlaces],
      );
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces(error.message || "failed to Update user-places");
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id),
    );

    try {
      await updateUserPlaces(
        "http://localhost:3000/user-places",
        userPlaces.filter((place) => {
          return place.id !== selectedPlace.current.id;
        }),
      );
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces(
        error.message || "failed to delete please try again",
      );
    }

    setModalIsOpen(false);
  }, []);

  const handleError = () => {
    setErrorUpdatingPlaces(null);
  };

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <ErrorLog
            title={"Error ocquired"}
            message={
              errorUpdatingPlaces.message || "failed to update user places"
            }
            onConfirm={handleError}
          />
        )}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && (
          <ErrorLog title={"An Error occuried"} message={error.message} />
        )}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            loadingText={"Fetching User Places"}
            isLoading={isFetching}
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
