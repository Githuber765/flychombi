// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const Home = () => {
    const [origins, setOrigins] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [passengerCount, setPassengerCount] = useState(1);
    const [tripType, setTripType] = useState('one-way');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchFlightData();
    }, []);

    const fetchFlightData = async () => {
        try {
            const q = query(collection(db, "flights"));
            const querySnapshot = await getDocs(q);
            const flightData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const originSet = new Set();
            const destinationSet = new Set();

            flightData.forEach(flight => {
                originSet.add(flight.flight_origin);
                destinationSet.add(flight.flight_destination);
            });

            setOrigins([...originSet]);
            setDestinations([...destinationSet]);
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
    }

    const handleSearch = async () => {
        if (!selectedOrigin || !selectedDestination) {
            setErrorMessage('Por favor, selecciona un origen y un destino.');
            return;
        }

        try {
            const q = query(collection(db, "flights"));
            const querySnapshot = await getDocs(q);
            const flightData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filteredFlights = flightData.filter(flight =>
                flight.flight_origin === selectedOrigin &&
                flight.flight_destination === selectedDestination &&
                flight.flight_availability >= passengerCount
            );

            if (filteredFlights.length === 0) {
                setErrorMessage('No hay vuelos disponibles para esta selección.');
                return;
            }

            setErrorMessage('');
            navigate('/results', {
                state: {
                    selectedOrigin,
                    selectedDestination,
                    passengerCount,
                    tripType,
                    filteredFlights
                }
            });
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <div className="button-container">
                <div className="btn-group" role="group" aria-label="Trip type">
                    <button type="button" className={`btn btn-primary ${tripType === 'one-way' ? 'active' : ''}`} onClick={() => setTripType('one-way')}>Solo ida</button>
                    <button type="button" className={`btn btn-primary ${tripType === 'round-trip' ? 'active' : ''}`} onClick={() => setTripType('round-trip')}>Ida y vuelta</button>
                </div>
                <div>
                    <select className="form-select" id="select-origin" aria-label="Select origin"
                        value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)}>
                        <option value="" disabled>Select origin</option>
                        {origins.map((origin, index) => (
                            <option key={index} value={origin}>{origin}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select className="form-select" id="select-destination" aria-label="Select destination"
                        value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
                        <option value="" disabled>Select destination</option>
                        {destinations.map((destination, index) => (
                            <option key={index} value={destination}>{destination}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="select-passenger-count" 
                        aria-label="Select passenger count" 
                        value={passengerCount} 
                        min="1" 
                        onChange={(e) => setPassengerCount(Number(e.target.value))} 
                    />
                </div>
                <button className="btn btn-success" onClick={handleSearch}>Buscar vuelos</button>
                {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
            </div>
        </div>
    )
}

export default Home;
