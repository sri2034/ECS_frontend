import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logo from './logo.jpeg';
import workInProgressImage from './Work_in_progress.jpg'; 
import './App.css';
// Fixing the marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker({ location }) {
    const map = useMap();
    useEffect(() => {
        if (location.lat && location.lon) {
            map.flyTo([location.lat, location.lon], map.getZoom());
        }
    }, [location, map]);

    return location.lat && location.lon ? (
        <Marker position={[location.lat, location.lon]}>
            <Popup>
                Current Location: <br /> Lat: {location.lat} <br /> Longitude: {location.lon}
            </Popup>
        </Marker>
    ) : null;
}

function RouteSelector({route, onRouteSelect }) {
  const [showImage, setShowImage] = useState(true);  // Initially show the image

  const handleRouteChange = (value) => {
    onRouteSelect(value);  // Propagate the change to parent component
    setShowImage(value === 'select');  // Only show image when 'select' is chosen
  };

  return (
    <div>
      <div id="routeSelection">
        <label htmlFor="routes"><b>Select Route:</b></label>
        <select id="routes" value={route} onChange={e => handleRouteChange(e.target.value)}>
          <option value="select">Select a route</option>
          <option value="route1">Route 1</option>
          <option value="route2">Route 2</option>
          <option value="route3">Route 3</option>
        </select>
      </div>
      {showImage && (
        <div id="container">
        <img src={logo} alt="Logo" id='logo' />
        <div>
            <p>Map for Route 1:<br/>Sankar Vilas &rarr; Naaz Centre &rarr; NTR Circle &rarr; GNT Bus Stand &rarr; VIT-AP</p><br/>
            <p>Map for Route 2:<br/>Brundavan Gardens &rarr; Sitaramaiah High School &rarr; Amaravathi Road &rarr; Ala Hospital &rarr; Venkateswara Swamy Temple &rarr; Lam &rarr; Pedha Parimi &rarr; Thullur &rarr; VIT-AP</p> <br/>
            <p>Map for Route 3:<br/>Autonagar Gate &rarr; NTR Circle &rarr; Benz Circle &rarr; MVR Mall &rarr; Krishna Lanka &rarr; Varadhi &rarr; Tadepalli &rarr; VIT-AP</p>
        </div>
    </div>
    
      )}
    </div>
  );
}

function App() {
  const [location, setLocation] = useState({ lat: 16.4970554, lon: 80.496616 });
  const [, setRoute] = useState('select');
  const [showMap, setShowMap] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showbutton, setShowButton] = useState(false);
  const mapRef = useRef(null);  // Defining mapRef here

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ecs-backend.onrender.com/location');
        if (response.data.lat && response.data.lon) {
          setLocation({ lat: parseFloat(response.data.lat), lon: parseFloat(response.data.lon) });
        } else {
          console.error("Received invalid location data:", response.data);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    const intervalId = setInterval(fetchLocation, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRouteSelection = (selectedRoute) => {
    setRoute(selectedRoute);
    setShowMap(selectedRoute === 'route1');
    setShowImage(selectedRoute === 'route2' || selectedRoute === 'route3');
    setShowButton(selectedRoute !== 'select');
  };

  const handleGoBack = () => {
    setShowMap(false);
    setShowImage(false);
    setShowButton(false);
    setRoute('select'); 
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>College Bus Location Tracker</h1>
      </header>
      {!showMap && !showbutton && <RouteSelector onRouteSelect={handleRouteSelection} />}
      {showMap && (
        <>
          <MapContainer
            center={[location.lat, location.lon]}
            zoom={18}
            style={{ height: '360px', width: '90%' ,marginTop:'10px',marginLeft:'75px',marginRight:'50px'}}
            whenCreated={mapInstance => mapRef.current = mapInstance}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="">ECS240232</a> contributors'
            />
            <LocationMarker location={location} />
          </MapContainer>
        </>
      )}
      {showImage && (
        <div id="imageBox">
          <img src={workInProgressImage} alt="Work in Progress" style={{marginTop: '15px'}} />
        </div>
      )}
      {showbutton &&(
      <div className="buttons">
            <button id="goBackBtn" onClick={handleGoBack} style={{margin: '15px'}}>Go Back</button>
      </div>)}
      <footer>
        <p>&copy; 240232_VIT</p>
      </footer>
    </div>
  );
}

export default App;
