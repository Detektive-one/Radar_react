import React, { useState, useEffect, useCallback } from 'react';
import { CSV_DATA } from '../assets/Assets';
import readCSV from '../services/readCSV';
import generateConfig from '../services/generateConfig'
import populateSVG from '../services/populateSVG'

export default function () {
  const [entries, setEntries] = useState(null);

  

  const loadSVG = useCallback((entries)=>{
    const {innerHeight,innerWidth} = window;
    const configuration = generateConfig({
      svg_id:"radar",
      width:innerWidth,
      height:innerHeight,
      title:"Tech Radar",
      entities:entries
    })
    console.log(configuration);
    populateSVG(configuration);

  },[])

  const generateRadar= useCallback(async()=>{
    if(entries === null){
      try{
       const data = await  readCSV(CSV_DATA);
       setEntries(data);
      }catch(e){
        console.log(e)
      }
    }else{
      loadSVG(entries);
    }

  },[])

  useEffect(()=>{
    if(entries !== null){
      loadSVG(entries)
    }
  },[entries])




  useEffect(() => {
    window.addEventListener('resize', generateRadar);
    return () => {
      window.removeEventListener('resize', generateRadar);
    };
  }, [generateRadar]);
  useEffect(() => {
    generateRadar()
  }, [generateRadar]);

  return (
    <div>
      {/* Render the RadarVisualization component */}
      <svg id='radar' />

      {/* Render the RadarService component */}
     
    </div>
  );
};

