
export default function generateConfig({svg_id,width,height,title,entities}) {
    
  const config = {
    svg_id: svg_id,
    width: width,
    height: height,
    colors: {
      background: '#f5f5f5',
      grid: '#888888',
      inactive: 'green',
      line: '#FFF',
    },
    title: title,
    quadrants: [
      { name: 'Emerging Technology' },
      { name: 'Emerging Trends' },
      { name: 'Emerging Technology' },
      { name: 'Emerging Trends' },
    ],
    ranges: [
      { name: 'New', color: '#103D69' },
      { name: '1-3 Years', color: '#206BA4' },
      { name: '3-6 Years', color: '#3388BB' },
      { name: '6-8 Years', color: '#66A0D1' },
    ],
    mass: [
      { name: 'Low', color: '#FFDB58', radius: '6' },
      { name: 'Medium', color: '#FF9999', radius: '9' },
      { name: 'High', color: '#FF6666', radius: '12' },
      { name: 'Very High', color: '#FF3333', radius: '15' },
    ],
    print_layout: true,
    links_in_new_tabs: true,
    entries: entities,
    
  };

  return config;
}