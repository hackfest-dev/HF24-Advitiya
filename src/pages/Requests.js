import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const center = { lat: 12.9716, lng: 77.5946 };

const Requests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const host = "http://localhost:5000";
  const [rideRequests, setRideRequests] = useState([]);
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const vehicle = location.state?.vehicle;

  const calcCarbon = async (vehicle, distance) => {
    const url = "https://carbonsutra1.p.rapidapi.com/vehicle_estimate_by_type";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Bearer fQ98oU704xFvsnXcQLVDbpeCJHPglG1DcxiMLKfpeNEMGumlbzVf1lCI6ZBx",
        "X-RapidAPI-Key": "80dc85687amshbc4b976aae3b8b7p1470ccjsn092c86007642",
        "X-RapidAPI-Host": "carbonsutra1.p.rapidapi.com",
      },
      body: new URLSearchParams({
        vehicle_type: vehicle,
        distance_value: distance,
        distance_unit: "km",
      }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCdiugRD3AtoVHnc3_mbEyUYSCIItI9DcQ",
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchRideRequests = async () => {
      try {
        const response = await fetch(
          `${host}/driver/riderequests/${location.state?.driverId}`
        );
        if (response.ok) {
          const requestData = await response.json();
          setRideRequests(requestData.rideRequests);
        } else {
          const errorData = await response.json();
          setError(errorData.error);
        }
      } catch (error) {
        console.error("Error fetching ride requests:", error);
        setError("Server Error");
      }
    };

    if (isLoaded) {
      fetchRideRequests();
    }
  }, [location.state?.driverId, isLoaded]);

  useEffect(() => {
    if (rideRequests.length > 0 && isLoaded) {
      const { source, destination } = rideRequests[0]; // Assuming only one request for simplicity
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: source,
          destination: destination,
          travelMode: "DRIVING",
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
            setDistance(result.routes[0].legs[0].distance.text); // Set distance
            setDuration(result.routes[0].legs[0].duration.text); // Set duration
          } else {
            console.error("Directions request failed due to " + status);
          }
        }
      );
    }
  }, [rideRequests, isLoaded]);

  const handleTripButton = () => {
    navigate("/endtrip");
  };

  return (
    <div className="container mx-2 mt-8 px-4">
      <div className="mt-8">
        <h2 className="text-3xl font-semibold mb-4 text-custom-green">
          Ride Requests
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {rideRequests.length > 0 ? (
          <ul>
            {rideRequests.map((request) => (
              <li key={request._id}>
                Source: {request.source}, Destination: {request.destination}
              </li>
            ))}
          </ul>
        ) : (
          <p>No ride requests</p>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-3xl font-semibold mb-4 text-custom-green">
          Route Map
        </h2>
        {isLoaded && (
          <div style={{ height: "400px", width: "100%" }}>
            <GoogleMap
              center={center}
              zoom={12}
              mapContainerStyle={{ height: "100%", width: "100%" }}
              onLoad={setMap}
              options={{
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullScreenControl: false,
              }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
              {rideRequests.map((request) => (
                <Marker key={request._id} position={request.source} label="S" />
              ))}
              {rideRequests.map((request) => (
                <Marker
                  key={request._id}
                  position={request.destination}
                  label="D"
                />
              ))}
            </GoogleMap>
          </div>
        )}
      </div>
      <div>
        <span>Distance: {distance} </span>
        <span>Duration: {duration} </span>
      </div>
      <div className="flex justify-center items-center">
        <button
          onClick={handleTripButton}
          className="my-10 px-3 py-2 custom-button"
        >
          End Trip
        </button>
      </div>
    </div>
  );
};

export default Requests;

// AIzaSyCdiugRD3AtoVHnc3_mbEyUYSCIItI9DcQ
