import { useEffect } from 'react';
import * as d3 from 'd3';

export const RadarService = ({ file, onDataLoaded }) => {
    useEffect(() => {
      // Function to handle the file load and parsing
      const loadCSVFile = async () => {
        try {
          const data = await d3.csv(file);
  
          // Process the CSV data and populate the entries array
          var emergingTechCount = 0;
          var trendCount = 0;
          var entries = [];
  
          data.forEach(function(d) {
            var quadrantValue;
            if (d.quadrant === "Emerging Technology") {
              quadrantValue = emergingTechCount % 2 === 0 ? 0 : 2;
              emergingTechCount++;
            } else if (d.quadrant === "Emerging Trend") {
              quadrantValue = trendCount % 2 === 0 ? 1 : 3;
              trendCount++;
            } else {
              quadrantValue = 3;
            }
  
            var ageRange;
            var rangeValue = parseFloat(d.range);
            
            if (rangeValue >= 0 && rangeValue <= 1) {
              ageRange = 0;
            } else if (rangeValue > 1 && rangeValue <= 3) {
              ageRange = 1;
            } else if (rangeValue > 3 && rangeValue <= 6) {
              ageRange = 2;
            } else if (rangeValue > 6 && rangeValue <= 8) {
              ageRange = 3;
            }
  
            entries.push({
              quadrant: quadrantValue,
              range: ageRange,
              label: d.label,
              mass: d.mass,
              description: d.description,
              link: d.link,
              moved: 0
            });
          });
  
          // Call the callback function with the populated entries array
          onDataLoaded(entries);
        } catch (error) {
          console.error('Error loading CSV file:', error);
        }
      };
  
      // Call the loadCSVFile function to initiate the file loading and parsing
      loadCSVFile();
    }, [file, onDataLoaded]);
  
    return null; // Since this is a service component, it doesn't render anything
  };
  