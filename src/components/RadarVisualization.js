import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import RadarConfig from './RadarConfig';

const RadarVisualization = ({ RadarConfig }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const config = RadarConfig;
    Radar_visualization(config);
    function Radar_visualization(config) {
        

        // custom random number generator, to make random sequence reproducible
        // source: https://stackoverflow.com/questions/521295
        var seed = 42;
        function random() {
          var x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        }
      
        function random_between(min, max) {
          return min + random() * (max - min);
        }
      
        function normal_between(min, max) {
          return min + (random() + random()) * 0.5 * (max - min);
        }
      
        // radial_min / radial_max are multiples of PI
        const quadrants = [
          { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
          { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
          { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
          { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
        ];
        const width = config.width;
        const height = config.height;
        
        const radius = Math.min(width,height)/4;
    
        const ranges = [
          { radius: radius*0.3, name: "New" },
          { radius: radius*0.8, name: "1-3 Years" },
          { radius: radius*1.3, name: "3-6 Years" },
          { radius: radius*1.8, name: "6-8 Years" }
        ];
        
        
      
      const title_offset = { x: -width / 2 + radius, y: -height / 2 + radius };
      // const footer_offset = { x: -width / 2 + radius, y: height / 2 - radius };
    
      const legend_offset = [
        { x: width / 2 - radius * 1.5, y: height / 2 - radius * 0.8 },
        { x: -width / 2 + radius * 0.8, y: height / 2 - radius * 0.8 },
        { x: -width / 2 + radius * 0.8, y: -height / 2 + radius * 0.5 },
        { x: width / 2 - radius * 1.5, y: -height / 2 + radius * 0.5 }
      ];
      
        function polar(cartesian) {
          var x = cartesian.x;
          var y = cartesian.y;
          return {
            t: Math.atan2(y, x),
            r: Math.sqrt(x * x + y * y)
          }
        }
      
        function cartesian(polar) {
          return {
            x: polar.r * Math.cos(polar.t),
            y: polar.r * Math.sin(polar.t)
          }
        }
      
        function bounded_interval(value, min, max) {
          var low = Math.min(min, max);
          var high = Math.max(min, max);
          return Math.min(Math.max(value, low), high);
        }
      
        function bounded_range(polar, r_min, r_max) {
          return {
            t: polar.t,
            r: bounded_interval(polar.r, r_min, r_max)
          }
        }
      
        function bounded_box(point, min, max) {
          return {
            x: bounded_interval(point.x, min.x, max.x),
            y: bounded_interval(point.y, min.y, max.y)
          }
        }
      
        function segment(quadrant, range) {
          var polar_min = {
            t: quadrants[quadrant].radial_min * Math.PI,
            r: range === 0 ? 30 : ranges[range - 1].radius
          };
          var polar_max = {
            t: quadrants[quadrant].radial_max * Math.PI,
            r: ranges[range].radius
          };
          var cartesian_min = {
            x: 15 * quadrants[quadrant].factor_x,
            y: 15 * quadrants[quadrant].factor_y
          };
          var cartesian_max = {
            x: ranges[3].radius * quadrants[quadrant].factor_x,
            y: ranges[3].radius * quadrants[quadrant].factor_y
          };
          return {
            clipx: function(d) {
              var c = bounded_box(d, cartesian_min, cartesian_max);
              var p = bounded_range(polar(c), polar_min.r + 15, polar_max.r - 15);
              d.x = cartesian(p).x; // adjust data too!
              return d.x;
            },
            clipy: function(d) {
              var c = bounded_box(d, cartesian_min, cartesian_max);
              var p = bounded_range(polar(c), polar_min.r + 15, polar_max.r - 15);
              d.y = cartesian(p).y; // adjust data too!
              return d.y;
            },
            random: function() {
              return cartesian({
                t: random_between(polar_min.t, polar_max.t),
                r: normal_between(polar_min.r, polar_max.r)
              });
            }
          }
        }
      
     
        for (var i = 0; i < config.entries.length; i++) {
          var entry = config.entries[i];
          entry.segment = segment(entry.quadrant, entry.range);
          var point = entry.segment.random();
          entry.x = point.x;
          entry.y = point.y;
          var mass = entry.mass;
          switch (mass) {
            case "low":
              entry.color = "#FFDB58";
              break;
            case "medium":
              entry.color = "#FF9999";
              break;
            case "high":
              entry.color = "#FF6666";
              break;
            case "very high":
              entry.color = "#FF3333";
              break;
        }}
        
        
        // partition entries according to segments
        var segmented = new Array(4);
        for (var quadrant = 0; quadrant < 4; quadrant++) {
          segmented[quadrant] = new Array(4);
          for (var range = 0; range < 4; range++) {
            segmented[quadrant][range] = [];
          }
        }
        for (var i=0; i<config.entries.length; i++) {
          var entry = config.entries[i];
          segmented[entry.quadrant][entry.range].push(entry);
        }
      
        // assign unique sequential id to each entry
        var id = 1;
        for (var quadrant of [2,3,1,0]) {
          for (var range = 0; range < 4; range++) {
            var entries = segmented[quadrant][range];
            entries.sort(function(a,b) { return a.label.localeCompare(b.label); })
            for (var i=0; i<config.entries.length; i++) {
              entries[i].id = "" + id++;
            }
          }
        }
      
        function translate(x, y) {
          return "translate(" + x + "," + y + ")";
        }
      
        function viewbox(quadrant) {
          return [
            Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
            Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
            440,
            440
          ].join(" ");
        }
      
        var svg = d3.select("svg#" + config.svg_id)
          .style("background-color", config.colors.background)
          .attr("width", config.width)
          .attr("height", config.height);
      
        var radar = svg.append("g");
        if ("zoomed_quadrant" in config) {
          svg.attr("viewBox", viewbox(config.zoomed_quadrant));
        } else {
          radar.attr("transform", translate(config.width / 2, config.height / 2));
        }
      
        var grid = radar.append("g");
        const color = ["#103D69", "#206BA4", "#3388BB", "#66A0D1"];
        // draw ranges
        for (let i = color.length - 1; i >= 0; i--) {
          grid.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", ranges[i].radius)
            .style("fill", color[i])
            .style("stroke", config.colors.grid)
            .style("stroke-width", 1);
          }
        // draw grid lines
        grid.append("line")
        .attr("x1", 0).attr("y1", -ranges[3].radius)
        .attr("x2", 0).attr("y2", ranges[3].radius)
        .style("stroke", config.colors.line)
        .style("stroke-width", 2);
        grid.append("line")
        .attr("x1", -ranges[3].radius).attr("y1", 0)
        .attr("x2", ranges[3].radius).attr("y2", 0)
        .style("stroke", config.colors.line)
        .style("stroke-width", 2);
      
        // background color. Usage `.attr("filter", "url(#solid)")`
        // SOURCE: https://stackoverflow.com/a/31013492/2609980
        var defs = grid.append("defs");
        var filter = defs.append("filter")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 1)
          .attr("height", 1)
          .attr("id", "solid");
        filter.append("feFlood")
          .attr("flood-color", "rgb(0, 0, 0, 0.8)");
        filter.append("feComposite")
          .attr("in", "SourceGraphic");
          
        const textContainer = grid.append("g");
    
          // Define the data for each quadrant (coordinates and text)
        const quadrantsText = [
          { id: "wavy1", start: [-radius*1.8-10,0], end: [0, -radius*1.8-10], text: "Emerging Technologies" },
          { id: "wavy2", start: [0, -radius*1.8-10], end: [radius*1.8+10, 0], text: "Emerging Trends" },
          { id: "wavy3", start: [radius*1.8+10, 0], end: [0, radius*1.8+10], text: "Emerging Technologies" },
          { id: "wavy4", start: [0, radius*1.8+10], end: [-radius*1.8-10,0], text: "Emerging Trends" }
        ];
          
          // Loop through the quadrants array
        quadrantsText.forEach((quadrantText) => {
          // Create a path for the quadrant
        textContainer.append("path")
            .attr("id", quadrantText.id) // Unique id of the path
            .attr("d", `M ${quadrantText.start[0]},${quadrantText.start[1]} A 299,299 0 0,1 ${quadrantText.end[0]},${quadrantText.end[1]}`) // SVG path
            .style("fill", "none")
            .style("stroke", "none");
        
          // Create an SVG text element and append a textPath element
        textContainer.append("text")
            .append("textPath") // Append a textPath to the text element
            .attr("xlink:href", `#${quadrantText.id}`) // Reference the id of the path
            .style("text-anchor", "middle") // Place the text halfway on the arc
            .attr("startOffset", "50%")
            .style("font-weight", "bold")
            .text(quadrantText.text);
        });
    
        function legend_transform(quadrant, range, index=null) {
          var dx = range < 2 ? 0 : 140;
          var dy = (index == null ? -16 : index * 12);
          if (range % 2 === 1) {
            dy = dy + 36 + segmented[quadrant][range-1].length * 12;
          }
          return translate(
            legend_offset[quadrant].x + dx,
            legend_offset[quadrant].y + dy
          );
        }
      
        // draw title and legend (only in print layout)
        if (config.print_layout) {
      
          // title
          radar.append("text")
            .attr("transform", translate(title_offset.x, title_offset.y))
            .text(config.title)
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "30")
            .style("font-weight", "bold")
      
          // date
          radar.append("text")
            .attr("transform", translate(title_offset.x, title_offset.y + 20))
            .text(config.date || "")
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "14")
            .style("fill", "#999")
    
          for (var range = 0; range < 4; range++){
            radar.append("text")
            .attr("transform",  translate(title_offset.x, title_offset.y +100 +40*range))
            .text(config.ranges[range].name)
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "17px")
            .style("font-weight", "bold")
            .style("fill", "#000")
            
            radar.append("rect")
            .attr("x", title_offset.x + 120)
            .attr("y", title_offset.y + 100+ 40 * range - 17)
            .attr("width", 17)
            .attr("height", 17)
            .style("fill", config.ranges[range].color);
            
            }
          for (var mass = 0; mass < 4; mass++){
            radar.append("text")
            .attr("x", title_offset.x + 900)
            .attr("y", title_offset.y + 100+40*mass)
            .text(config.mass[mass].name)
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "17px")
            .style("font-weight", "bold")
            .style("fill", "#000")
    
            radar.append("circle")
            .attr("cx", title_offset.x + 1020)
            .attr("cy", title_offset.y + 100+40*mass-6)
            .attr("r", config.mass[mass].radius)
            .style("fill", config.mass[mass].color)
          }
    
    
          var legend = radar.append("g");
          function generateLegends() {
            
              // addQuadrantName(quadrant);
              for (var range = 0; range < 4; range++) {
                // addRangeName(color);
                addLegendItem(quadrant, range, segmented[quadrant][range], range);
              }
              
              
            
          }
          // function addRangeName(quadrant, range) {
          //   legend.append("text")
          //     .attr("transform", legend_transform(quadrant, range))
          //     .text(config.ranges[range].name)
          //     .style("font-family", "Arial, Helvetica")
          //     .style("font-size", "12px")
          //     .style("font-weight", "bold")
          //     // .style("fill", config.ranges[range].color);
          // }
          function addLegendItem(quadrant, range, data, index) {
            legend.selectAll(".legend" + quadrant + range)
              .data(data)
              .enter()
              .append("a")
               
              .attr("href", function (d, i) {
                return d.link ? d.link : "#";
              })
              .attr("target", function (d, i) {
                return (d.link && config.links_in_new_tabs) ? "_blank" : null;
              })
              // .append("text")
              // .attr("transform", function(d, i) {
              //   return legend_transform(quadrant, range, i);
              // })
              // .attr("class", "legend" + quadrant + range)
              // .attr("id", function(d, i) {
              //   return "legendItem" + d.id;
              // })                 
              
             
              .on("mouseover", function(d) {
                showBubble(d);
                highlightLegendItem(d);
              })
              .on("mouseout", function(d) {
                hideBubble(d);
                unhighlightLegendItem(d);
              });
          }
    
          generateLegends();
        
        // layer for entries
        var rink = radar.append("g")
          .attr("id", "rink");
      
        // rollover bubble (on top of everything else)
        var bubble = radar.append("g")
          .attr("id", "bubble")
          .attr("x", 0)
          .attr("y", 0)
          .style("opacity", 0)
          .style("pointer-events", "none")
          .style("user-select", "none");
        bubble.append("rect")
          .attr("rx", 4)
          .attr("ry", 4)
          .style("fill", "#333");
        bubble.append("text")
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .style("fill", "#fff");
        bubble.append("path")
          .attr("d", "M 0,0 10,0 5,8 z")
          .style("fill", "#333");
      
        function showBubble(d) {
          if ( config.print_layout) {
            var tooltip = d3.select("#bubble text")
              .text(d.label);
            var bbox = tooltip.node().getBBox();
            d3.select("#bubble")
              .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
              .style("opacity", 0.8);
            d3.select("#bubble rect")
              .attr("x", -5)
              .attr("y", -bbox.height)
              .attr("width", bbox.width + 10)
              .attr("height", bbox.height + 4);
            d3.select("#bubble path")
              .attr("transform", translate(bbox.width / 2 - 5, 3));
          }
        }
      
        function hideBubble(d) {
          var bubble = d3.select("#bubble")
            .attr("transform", translate(0,0))
            .style("opacity", 0);
        }
      
        function highlightLegendItem(d) {
          var legendItem = document.getElementById("legendItem" + d.id);
          legendItem.setAttribute("filter", "url(#solid)");
          legendItem.setAttribute("fill", "white");
        }
      
        function unhighlightLegendItem(d) {
          var legendItem = document.getElementById("legendItem" + d.id);
          legendItem.removeAttribute("filter");
          legendItem.removeAttribute("fill");
        }
      
        // draw blips on radar
        var blips = rink.selectAll(".blip")
          .data(config.entries)
          .enter()
            .append("g")
              .attr("class", "blip")
              .attr("transform", function(d, i) { return legend_transform(d.quadrant, d.range, i); })
              .on("mouseover", function(d) { showBubble(d); highlightLegendItem(d); })
              .on("mouseout", function(d) { hideBubble(d); unhighlightLegendItem(d); });
      
        // configure each blip
        blips.each(function(d) {
          var blip = d3.select(this);
      
          // blip link
          if (Object.prototype.hasOwnProperty.call(d, "link") && d.link) {
            blip = blip.append("a")
              .attr("xlink:href", d.link)
              
            if (config.links_in_new_tabs) {
              blip.attr("target", "_blank");
            }
          }
          
    
          // blip shape
          blip.append("circle")
          .attr("r", function(d) {
            if (d.mass === "low") {
              return 6; // Set radius for low mass
            } else if (d.mass === "medium") {
              return 9; // Set radius for medium mass
            } else if (d.mass === "high") {
              return 12; // Set radius for high mass
            } else if (d.mass === "very high") {
              return 15; // Set radius for very high mass
            } else {
              return 9; // Default radius if mass value is not recognized
            }
          })
          .style("fill", d.color)
          .on("mouseover", function(d) { showTooltip(d); })
          .on("mouseout", function(d) { hideTooltip(d); });
          
          
      
          // blip text
          if (config.print_layout) {
            var blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
            blip.append("text")
              .text(blip_text)
              .attr("y", 3)
              .attr("text-anchor", "middle")
              .style("fill", "#fff")
              .style("font-family", "Arial, Helvetica")
              .style("font-size", function(d) { return blip_text.length > 2 ? "8px" : "9px"; })
              .style("pointer-events", "none")
              .style("user-select", "none");
          }
        });
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
        function showTooltip(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        
          // Get the position of the SVG container
          var containerPos = rink.node().getBoundingClientRect();
        
          // Get the relative mouse position within the SVG container
          var mouseX = d3.event.clientX - containerPos.left;
          var mouseY = d3.event.clientY - containerPos.top;
        
          // Calculate the tooltip position
          var tooltipLeft = mouseX + 10; // Adjust the horizontal position as needed
          var tooltipTop = mouseY - 10; // Adjust the vertical position as needed
        
          tooltip.html(d.description)
            .style("left", tooltipLeft + "px")
            .style("top", tooltipTop + "px");
        
          tooltip.style("transform", "translateX(100%)");
        }
        
        
        
    
        function hideTooltip(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        }
    
      
        // make sure that blips stay inside their segment
        function ticked() {
          blips.attr("transform", function(d) {
            return translate(d.segment.clipx(d), d.segment.clipy(d));
          })
        }
      
        // distribute blips, while avoiding collisions
        d3.forceSimulation()
          .nodes(config.entries)
          .velocityDecay(0.19) // magic number (found by experimentation)
          .force("collision", d3.forceCollide().radius(12).strength(0.85))
          .on("tick", ticked);

        
      }}

    RadarVisualization();
  }, [RadarConfig]);

  return (
    <svg
      id={RadarConfig.svg_id}
      ref={svgRef}
    //   style={{ backgroundColor: RadarConfig.colors.background }}
      width={RadarConfig.width}
      height={RadarConfig.height}
    ></svg>
  );
};

export default RadarVisualization;
