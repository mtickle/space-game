import StarMap from '@components/StarMap';
import SystemView from '@components/SystemView';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { generatePlanets, generateStarName, getStarDescription } from './utils/starUtils';

const App = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const classes = [
      { type: 'O', color: '#A3BFFA', temp: '>30,000K', size: 10, weight: 0.05 },
      { type: 'B', color: '#BEE3F8', temp: '10,000–30,000K', size: 8, weight: 0.1 },
      { type: 'A', color: '#EBF8FF', temp: '7,500–10,000K', size: 7, weight: 0.1 },
      { type: 'F', color: '#FEFCBF', temp: '6,000–7,500K', size: 6, weight: 0.1 },
      { type: 'G', color: '#FFFF99', temp: '5,200–6,000K', size: 5, weight: 0.15 },
      { type: 'K', color: '#FBD38D', temp: '3,700–5,200K', size: 4, weight: 0.2 },
      { type: 'M', color: '#F56565', temp: '<3,700K', size: 3, weight: 0.4 },
    ];

    const generatedStars = [];
    for (let i = 0; i < 30; i++) {
      const rand = Math.random();
      let cumulative = 0;
      let starClass = classes[classes.length - 1];
      for (const c of classes) {
        cumulative += c.weight;
        if (rand < cumulative) {
          starClass = c;
          break;
        }
      }

      const starName = generateStarName();
      generatedStars.push({
        x: Math.random() * 1200 - 600,
        y: Math.random() * 800 - 400,
        type: starClass.type,
        color: starClass.color,
        temp: starClass.temp,
        size: starClass.size,
        name: starName,
        description: getStarDescription(starClass.type),
        planets: generatePlanets(starName),
      });
    }

    // Find center of star field
    const centerX = generatedStars.reduce((sum, s) => sum + s.x, 0) / generatedStars.length;
    const centerY = generatedStars.reduce((sum, s) => sum + s.y, 0) / generatedStars.length;

    // Shift all stars so center is at (0,0)
    const centeredStars = generatedStars.map(s => ({
      ...s,
      x: s.x - centerX,
      y: s.y - centerY,
    }));

    setStars(centeredStars);
  }, []);


  return (

    <div className="bg-black w-fill h-fill" >

      <Routes>
        <Route path="/" element={<StarMap stars={stars} />} />
        <Route path="/system/:starName" element={<SystemView stars={stars} />} />
      </Routes>
    </div>
  );
};

export default App;
