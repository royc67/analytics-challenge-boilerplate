import React, { useEffect, useState } from "react";
import Map from "./Map";
import axios from "axios";
import {} from "../../models/event";

const GeoTile = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    async function fetch() {
      const { data: todaysEvents } = await axios.get(`http://localhost:3001/events/all`);
      setEvents(todaysEvents);
    }

    fetch();
  }, []);
  return (
    // <span></span>
    <Map events={events} />
  );
};

export default GeoTile;