import React, { useState,useEffect } from 'react';
import { RadarService } from '../services/RadarParseCsv';

const RadarConfig = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
  const [entries, setEntries] = useState([]);

  const config = {
    
    svg_id: "radar",
    width: width,
    height: height,
    colors: {
      background: "#f5f5f5",
      grid: "#888888",
      inactive: "green",
      line: "#FFF"
    },
    title: "Tech Radar",
    date: "july",
    quadrants: [
      { name: "Emerging Technology" },
      { name: "Emerging Trends" },
      { name: "Emerging Technology" },
      { name: "Emerging Trends" }
    ],
    ranges: [
      { name: "New", color: "#103D69" },
      { name: "1-3 Years", color: "#206BA4" },
      { name: "3-6 Years", color: "#3388BB" },
      { name: "6-8 Years", color: "#66A0D1" }
    ],
    mass: [
      { name: "Low", color: "#FFDB58", radius: "6" },
      { name: "Medium", color: "#FF9999", radius: "9" },
      { name: "High", color: "#FF6666", radius: "12" },
      { name: "Very High", color: "#FF3333", radius: "15" }
    ],
    print_layout: true,
    links_in_new_tabs: true,
    entries: entries,
  };
  const handleDataLoaded = (loadedEntries) => {
    setEntries(loadedEntries);
  };
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return( // replace with desired JSX if needed
  <div>
      {/* Your JSX code here */}
      {/* ... */}

      {/* Render the RadarService component */}
      <RadarService file="C:\Users\hydra\Documents\python\radar\react\radar-app\public\file.csv" onDataLoaded={handleDataLoaded} />
    </div>
  );
};

export default RadarConfig;
