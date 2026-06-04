// 3D Interactive World Trade Globe - Three.js

(function() {
  let container, scene, camera, renderer, globeGroup;
  let tradeRoutes = [];
  let currentRotationTarget = { x: 0, y: 0 };
  const GLOBE_RADIUS = 30;
  
  // Coordinates mapping: [lat, lon, name]
  const destinations = {
    india: [20.59, 78.96, 'India (Sanover HQ)'],
    usa: [40.71, -74.00, 'USA (New York Port)'],
    canada: [49.28, -123.12, 'Canada (Vancouver Port)'],
    europe: [51.92, 4.47, 'Europe (Rotterdam)'],
    middleEast: [25.20, 55.27, 'Middle East (Dubai)'],
    australia: [-33.86, 151.20, 'Australia (Sydney)'],
    africa: [-4.04, 39.66, 'Africa (Mombasa)'],
    southeastAsia: [1.35, 103.81, 'Southeast Asia (Singapore)']
  };

  function initMap3D() {
    container = document.getElementById('about-map-container');
    if (!container) return;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 500);
    camera.position.set(0, 0, 85);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight('#1d3557', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffe8a3', 1.5);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight('#6cb3f9', 1.0);
    backLight.position.set(-50, -50, -50);
    scene.add(backLight);

    // 4. Globe Group
    globeGroup = new THREE.Group();
    // Default initial tilt
    globeGroup.rotation.x = 0.2;
    globeGroup.rotation.y = -1.2; 
    scene.add(globeGroup);

    // 5. Stylized Globe Sphere & Grid Lines
    createGlobeSphere();

    // 6. Dot Continent Particles representation
    createContinentDots();

    // 7. Interactive Arcing Trade Routes
    createTradeArcs();

    // 8. Handle Events
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('focus-region', handleRegionFocus);

    animate();
  }

  // Lat/Long converter to 3D Sphere Vectors
  function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    
    return new THREE.Vector3(x, y, z);
  }

  // Glowing inner sphere and latitude/longitude rings
  function createGlobeSphere() {
    // Semi-transparent blue sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.2, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: '#07182c',
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.8
    });
    const baseSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(baseSphere);

    // Wireframe grid lines
    const gridGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 18, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: '#0d253f',
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(grid);
  }

  // Continental Layout dots (High-Density Uniform Matrix Grid)
  function createContinentDots() {
    const pointsGeo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const goldColor = new THREE.Color('#d4af37');
    const blueColor = new THREE.Color('#38bdf8');

    // Uniform grid on sphere to create a clean tech-matrix look
    const step = 1.0; // 1.0 degree resolution
    for (let lat = -80; lat <= 80; lat += step) {
      const rad = lat * Math.PI / 180;
      const cosLat = Math.cos(rad);
      // Adjust longitude step to maintain uniform density as latitude increases
      const lonStep = cosLat > 0.05 ? (step / cosLat) : 360;

      for (let lon = -180; lon <= 180; lon += lonStep) {
        if (isLandCoordinate(lat, lon)) {
          // Convert to 3D Vector using the EXACT same projection formula to align perfectly with pins
          const vec = latLongToVector3(lat, lon, GLOBE_RADIUS);
          positions.push(vec.x, vec.y, vec.z);

          // Color coding: Gold near India trade hub, soft blue elsewhere
          const distToIndia = Math.sqrt(Math.pow(lat - 20.59, 2) + Math.pow(lon - 78.96, 2));
          if (distToIndia < 15) {
            colors.push(goldColor.r, goldColor.g, goldColor.b);
          } else {
            colors.push(blueColor.r, blueColor.g, blueColor.b);
          }
        }
      }
    }

    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const continentPoints = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(continentPoints);
  }

  // Refined coordinate mapping function representing realistic continents and islands
  function isLandCoordinate(lat, lon) {
    // Greenland
    if (lat > 60 && lat < 83 && lon > -75 && lon < -15) return true;
    
    // North America
    if (lat > 25 && lat < 75 && lon > -125 && lon < -55) {
      if (lat < 30 && lon > -98 && lon < -82) return false; // Gulf of Mexico
      return true;
    }
    if (lat > 54 && lat < 72 && lon > -170 && lon < -120) return true; // Alaska
    if (lat > 15 && lat <= 25 && lon > -115 && lon < -80) return true; // Mexico
    if (lat > 7 && lat <= 15 && lon > -90 && lon < -77) return true; // Central America
    
    // South America
    if (lat > -10 && lat <= 12 && lon > -80 && lon < -35) return true; // North SA
    if (lat > -35 && lat <= -10 && lon > -75 && lon < -40) return true; // Mid SA
    if (lat > -56 && lat <= -35 && lon > -75 && lon < -60) return true; // South SA
    
    // Africa
    if (lat > 5 && lat < 37 && lon > -18 && lon < 51) return true; // North Africa
    if (lat > -35 && lat <= 5 && lon > 9 && lon < 42) return true; // Sub-Saharan Africa
    if (lat > -25 && lat < -12 && lon > 43 && lon < 51) return true; // Madagascar
    
    // Eurasia (Europe + Asia)
    if (lat > 10 && lat < 75 && lon > -10 && lon < 145) {
      // Exclude Caspian/Black Seas
      if (lat > 40 && lat < 48 && lon > 45 && lon < 55) return false;
      if (lat > 40 && lat < 46 && lon > 28 && lon < 42) return false;
      return true;
    }
    if (lat > 10 && lat <= 30 && lon > 34 && lon < 60) return true; // Middle East (Arabian Peninsula)
    if (lat > 5 && lat <= 10 && lon > 70 && lon < 140) return true; // Southern tip of India / Indochina
    
    // Japan
    if (lat > 30 && lat < 46 && lon > 129 && lon < 146) return true;
    
    // Australia & New Zealand
    if (lat > -42 && lat < -10 && lon > 113 && lon < 154) return true;
    if (lat > -47 && lat < -34 && lon > 165 && lon < 179) return true;
    
    // Southeast Asia (Indonesia/Philippines/etc)
    if (lat > -10 && lat <= 10 && lon > 95 && lon < 145) return true;

    return false;
  }

  // Create Gold Curved Trade Routes from India
  function createTradeArcs() {
    const origin = destinations.india;
    const originVec = latLongToVector3(origin[0], origin[1], GLOBE_RADIUS);
    
    // Add pulsing gold pin at India
    const pinGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: '#d4af37' });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.copy(originVec);
    globeGroup.add(pin);

    // Create paths to each destination
    Object.keys(destinations).forEach(key => {
      if (key === 'india') return;
      
      const dest = destinations[key];
      const destVec = latLongToVector3(dest[0], dest[1], GLOBE_RADIUS);

      // Pulse pin at destination
      const destPinGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const destPinMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
      const destPin = new THREE.Mesh(destPinGeo, destPinMat);
      destPin.position.copy(destVec);
      globeGroup.add(destPin);

      // Curve height math
      const midPoint = new THREE.Vector3().addVectors(originVec, destVec).multiplyScalar(0.5);
      const distance = originVec.distanceTo(destVec);
      const heightMultiplier = 1.0 + (distance * 0.12);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS * heightMultiplier);

      // Cubic curve
      const curve = new THREE.QuadraticBezierCurve3(originVec, midPoint, destVec);
      
      // Draw static route line
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: '#d4af37',
        transparent: true,
        opacity: 0.25
      });
      const routeLine = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(routeLine);

      // Add a moving glowing light dot along the route
      const glowGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: '#ffe8a3' });
      const glowDot = new THREE.Mesh(glowGeo, glowMat);
      globeGroup.add(glowDot);

      tradeRoutes.push({
        curve,
        glowDot,
        progress: Math.random(), // Stagger starts
        speed: 0.004 + Math.random() * 0.004,
        key: key
      });
    });
  }

  // Handle region highlights from navigation or click badges
  function handleRegionFocus(e) {
    const region = e.detail.region;
    if (!destinations[region]) return;

    const lat = destinations[region][0];
    const lon = destinations[region][1];

    // Compute Euler angles to align camera pointing directly at coordinates
    // Convert to spherical coords
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    // Rotation coordinates to face camera
    const rotY = -(theta - Math.PI / 2);
    const rotX = -(phi - Math.PI / 2);

    currentRotationTarget = { x: rotX, y: rotY };

    // Animate rotation using GSAP
    gsap.to(globeGroup.rotation, {
      x: rotX + 0.15, // Keep a small constant tilt
      y: rotY,
      duration: 1.5,
      ease: 'power3.out'
    });

    // Make target glowing dot flash and brighten the path line
    tradeRoutes.forEach(route => {
      if (route.key === region) {
        route.speed = 0.015; // Speed up glow pulse
        route.glowDot.scale.set(2, 2, 2);
        route.glowDot.material.color.set('#d4af37');
      } else {
        route.speed = 0.005;
        route.glowDot.scale.set(1, 1, 1);
        route.glowDot.material.color.set('#ffe8a3');
      }
    });
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Global map animate cycle
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Slow auto spin if not focused
    if (Math.abs(globeGroup.rotation.y - currentRotationTarget.y) < 0.05) {
      globeGroup.rotation.y += 0.001;
    }

    // Animate glowing cargo pulses along routes
    tradeRoutes.forEach(route => {
      route.progress += route.speed;
      if (route.progress > 1) {
        route.progress = 0;
      }
      
      const point = route.curve.getPointAt(route.progress);
      route.glowDot.position.copy(point);
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  window.addEventListener('load', () => {
    initMap3D();
  });
})();
