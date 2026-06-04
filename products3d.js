// 3D Products Rendering Logic - Three.js

(function() {
  // 1. HOME PAGE - CARD CANVAS RENDERERS
  function initHomeProductCards() {
    const cards = [
      { id: 'rice-canvas', type: 'rice', color: '#f3e5ab' },
      { id: 'cumin-canvas', type: 'cumin', color: '#7a6839' },
      { id: 'makhana-canvas', type: 'makhana', color: '#f5f5f4' },
      { id: 'sugar-canvas', type: 'sugar', color: '#ffffff' }
    ];

    cards.forEach(card => {
      const container = document.getElementById(card.id);
      if (!container) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 100);
      camera.position.z = 10;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Light
      const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight('#ffe8a3', 1.5);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);

      // Core Object creation
      let productMesh;
      if (card.type === 'rice') {
        productMesh = createRiceGrain(card.color);
      } else if (card.type === 'cumin') {
        productMesh = createCuminSeed(card.color);
      } else if (card.type === 'makhana') {
        productMesh = createMakhanaSphere(card.color);
      } else if (card.type === 'sugar') {
        productMesh = createSugarCrystal(card.color);
      }

      scene.add(productMesh);

      // Hover speed controller
      let rotationSpeed = 0.015;
      const cardEl = container.closest('.product-card');
      if (cardEl) {
        cardEl.addEventListener('mouseenter', () => {
          rotationSpeed = 0.045;
          gsap.to(productMesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.4 });
        });
        cardEl.addEventListener('mouseleave', () => {
          rotationSpeed = 0.015;
          gsap.to(productMesh.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
        });
      }

      function animate() {
        requestAnimationFrame(animate);
        if (productMesh) {
          productMesh.rotation.y += rotationSpeed;
          productMesh.rotation.x += rotationSpeed * 0.4;
        }
        renderer.render(scene, camera);
      }
      animate();
    });
  }

  // Helper creators for organic geometry
  function createRiceGrain(colorHex) {
    const group = new THREE.Group();
    // Stretched spindle
    const geo = new THREE.CylinderGeometry(0.01, 1.2, 5, 12);
    // Scale to make it thin and grain-like
    geo.scale(0.35, 1, 0.2);
    const mat = new THREE.MeshStandardMaterial({ 
      color: colorHex, 
      roughness: 0.6,
      metalness: 0.1 
    });
    
    // Add multiple grains intersecting slightly
    for (let i = 0; i < 3; i++) {
      const grain = new THREE.Mesh(geo, mat);
      grain.rotation.z = (i - 1) * 0.45;
      grain.rotation.y = i * 1.2;
      grain.scale.setScalar(1 - i * 0.1);
      group.add(grain);
    }
    return group;
  }

  function createCuminSeed(colorHex) {
    const geo = new THREE.CylinderGeometry(0.1, 0.8, 4.5, 8);
    geo.scale(0.4, 1.1, 0.4);
    
    // Deform vertices slightly to make it curved like a cumin seed
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Bend in a curve along X axis
      const offset = Math.sin(y * 0.7) * 0.4;
      pos.setX(i, pos.getX(i) + offset);
    }
    pos.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({ 
      color: colorHex, 
      roughness: 0.8,
      flatShading: true 
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = 0.5;
    return mesh;
  }

  function createMakhanaSphere(colorHex) {
    // Bumpy rough sphere representation
    const geo = new THREE.IcosahedronGeometry(2.4, 2);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Organic noise perturbations
      const noise = (Math.sin(x*3) * Math.cos(y*3) + Math.sin(z*3)) * 0.18;
      pos.setX(i, x + x * noise);
      pos.setY(i, y + y * noise);
      pos.setZ(i, z + z * noise);
    }
    pos.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({ 
      color: colorHex, 
      roughness: 0.9, 
      bumpScale: 0.1 
    });
    
    // Add golden flecks/spots representing pop mark holes
    const spotMat = new THREE.MeshStandardMaterial({ color: '#524328', roughness: 0.9 });
    const makhana = new THREE.Mesh(geo, mat);
    
    // Add small embedded spheres as dark spots
    for (let i = 0; i < 6; i++) {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 4, 4), spotMat);
      const angle = (i / 6) * Math.PI * 2;
      spot.position.set(
        Math.cos(angle) * 2.2,
        Math.sin(angle) * 2.2,
        (Math.random() - 0.5) * 2
      );
      makhana.add(spot);
    }

    return makhana;
  }

  function createSugarCrystal(colorHex) {
    // Diamond-faceted sugar crystal
    const geo = new THREE.IcosahedronGeometry(2.3, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    return mesh;
  }


  // 2. DEDICATED PRODUCT SUB-PAGES CANVASES
  
  // A. Rice Subpage (Parallax Grains Storm + 3D Product Image Background)
  function initRicePageCanvas() {
    const container = document.getElementById('prod-rice-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 500);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Background Image Plane
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('assets/rice.jpg');
    bgTexture.minFilter = THREE.LinearFilter;
    const bgGeo = new THREE.PlaneGeometry(160, 110);
    const bgMat = new THREE.MeshStandardMaterial({ 
      map: bgTexture,
      roughness: 0.85,
      metalness: 0.15 
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -30);
    scene.add(bgMesh);

    // Grains storm
    const grainGeo = new THREE.CylinderGeometry(0.01, 0.4, 2.0, 5);
    grainGeo.scale(0.3, 1, 0.2);
    const grainMat = new THREE.MeshStandardMaterial({ color: '#f3e5ab', roughness: 0.5 });
    
    const grainsGroup = new THREE.Group();
    scene.add(grainsGroup);

    const grainMeshes = [];
    for (let i = 0; i < 90; i++) {
      const mesh = new THREE.Mesh(grainGeo, grainMat);
      mesh.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.scale.setScalar(0.6 + Math.random() * 0.6);
      mesh.userData = {
        speedY: -(0.08 + Math.random() * 0.15),
        rotSpeed: 0.005 + Math.random() * 0.01
      };
      grainsGroup.add(mesh);
      grainMeshes.push(mesh);
    }

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffe8a3', 1.8);
    dirLight.position.set(20, 20, 20);
    scene.add(dirLight);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera interpolation (parallax)
      camera.position.x += (mouseX * 15 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Tilt background plane in reverse direction to reinforce depth
      bgMesh.rotation.y = mouseX * 0.05;
      bgMesh.rotation.x = mouseY * 0.05;

      grainMeshes.forEach(mesh => {
        mesh.position.y += mesh.userData.speedY;
        mesh.rotation.x += mesh.userData.rotSpeed;
        mesh.rotation.y += mesh.userData.rotSpeed;
        
        if (mesh.position.y < -45) {
          mesh.position.y = 45;
          mesh.position.x = (Math.random() - 0.5) * 120;
        }
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  // B. Foxnut Page (Falling foxnuts into a gold bowl + 3D Product Image Background)
  function initMakhanaPageCanvas() {
    const container = document.getElementById('prod-makhana-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 500);
    camera.position.set(0, 15, 60);
    camera.lookAt(0, -3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Background Image Plane
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('assets/makhana.jpg');
    bgTexture.minFilter = THREE.LinearFilter;
    const bgGeo = new THREE.PlaneGeometry(120, 90);
    const bgMat = new THREE.MeshStandardMaterial({ 
      map: bgTexture,
      roughness: 0.85,
      metalness: 0.15 
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, -2, -20);
    scene.add(bgMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffe8a3', 1.8);
    dirLight.position.set(10, 30, 20);
    scene.add(dirLight);

    // Gold Bowl
    const bowlGeo = new THREE.CylinderGeometry(15, 9, 7, 32, 1, true);
    const bowlMat = new THREE.MeshStandardMaterial({ 
      color: '#d4af37', 
      roughness: 0.1, 
      metalness: 0.9, 
      side: THREE.DoubleSide 
    });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = -10;
    scene.add(bowl);

    // Bowl Base cap
    const capGeo = new THREE.CylinderGeometry(9, 9, 0.5, 32);
    const cap = new THREE.Mesh(capGeo, bowlMat);
    cap.position.y = -13.5;
    scene.add(cap);

    // Falling foxnuts
    const makhanas = [];
    const makhanaGeo = new THREE.IcosahedronGeometry(1.6, 2);
    
    // Deform geometry
    const pos = makhanaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const noise = (Math.sin(x*4) * Math.cos(y*4) + Math.sin(z*4)) * 0.15;
      pos.setX(i, x + x*noise);
      pos.setY(i, y + y*noise);
      pos.setZ(i, z + z*noise);
    }
    pos.needsUpdate = true;

    const makhanaMat = new THREE.MeshStandardMaterial({ color: '#f5f5f4', roughness: 0.9 });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(makhanaGeo, makhanaMat);
      resetMakhanaPosition(mesh);
      mesh.position.y += Math.random() * 50; 
      scene.add(mesh);
      makhanas.push(mesh);
    }

    function resetMakhanaPosition(mesh) {
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        30 + Math.random() * 20,
        (Math.random() - 0.5) * 8
      );
      mesh.userData = {
        vy: -0.15 - Math.random() * 0.25,
        vx: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        rotSpeedX: Math.random() * 0.03,
        rotSpeedY: Math.random() * 0.03,
        bounced: false
      };
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function animate() {
      requestAnimationFrame(animate);

      bowl.rotation.y += 0.002;

      // Parallax smooth camera move
      camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
      camera.position.y += (15 - mouseY * 8 - camera.position.y) * 0.05;
      camera.lookAt(0, -3, 0);

      // Background plane tilt
      bgMesh.rotation.y = mouseX * 0.05;
      bgMesh.rotation.x = mouseY * 0.05;

      makhanas.forEach(mesh => {
        mesh.userData.vy -= 0.0098;
        mesh.position.x += mesh.userData.vx;
        mesh.position.y += mesh.userData.vy;
        mesh.position.z += mesh.userData.vz;
        
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;

        if (mesh.position.y <= -8 && !mesh.userData.bounced) {
          mesh.userData.vy = -mesh.userData.vy * 0.4;
          mesh.userData.vx = (Math.random() - 0.5) * 0.5;
          mesh.userData.vz = (Math.random() - 0.5) * 0.5;
          mesh.userData.bounced = true;
        }

        if (mesh.position.y < -25) {
          resetMakhanaPosition(mesh);
        }
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  // C. Cumin Seeds Subpage (Cinematic Floating Cumin seeds + 3D Product Image Background)
  function initCuminPageCanvas() {
    const container = document.getElementById('prod-cumin-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 500);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Background Image Plane
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('assets/cumin.jpg');
    bgTexture.minFilter = THREE.LinearFilter;
    const bgGeo = new THREE.PlaneGeometry(110, 80);
    const bgMat = new THREE.MeshStandardMaterial({ 
      map: bgTexture,
      roughness: 0.85,
      metalness: 0.15 
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -30);
    scene.add(bgMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffe8a3', 1.8);
    dirLight.position.set(10, 20, 30);
    scene.add(dirLight);

    // Floating cumin seeds
    const cuminSeeds = [];
    const baseCuminGeo = new THREE.CylinderGeometry(0.1, 0.8, 5, 8);
    baseCuminGeo.scale(0.35, 1, 0.35);

    const pos = baseCuminGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const offset = Math.sin(y * 0.6) * 0.5;
      pos.setX(i, pos.getX(i) + offset);
    }
    pos.needsUpdate = true;

    const cuminMat = new THREE.MeshStandardMaterial({ 
      color: '#7a6839', 
      roughness: 0.85,
      flatShading: true 
    });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(baseCuminGeo, cuminMat);
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      const scale = 0.8 + Math.random() * 1.2;
      mesh.scale.setScalar(scale);

      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015
      };

      scene.add(mesh);
      cuminSeeds.push(mesh);
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function animate() {
      requestAnimationFrame(animate);

      // Parallax smooth camera move
      camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 8 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Background plane tilt
      bgMesh.rotation.y = mouseX * 0.05;
      bgMesh.rotation.x = mouseY * 0.05;

      cuminSeeds.forEach(mesh => {
        mesh.position.x += mesh.userData.speedX;
        mesh.position.y += mesh.userData.speedY;
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;

        if (Math.abs(mesh.position.x) > 40) mesh.userData.speedX *= -1;
        if (Math.abs(mesh.position.y) > 25) mesh.userData.speedY *= -1;
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  // D. Sugar Page Canvas (Macro Shiny Crystals + 3D Product Image Background)
  function initSugarPageCanvas() {
    const container = document.getElementById('prod-sugar-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 500);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Background Image Plane
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('assets/sugar.jpg');
    bgTexture.minFilter = THREE.LinearFilter;
    const bgGeo = new THREE.PlaneGeometry(100, 70);
    const bgMat = new THREE.MeshStandardMaterial({ 
      map: bgTexture,
      roughness: 0.85,
      metalness: 0.15 
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -30);
    scene.add(bgMesh);

    // Glowing Lights setup
    const ambientLight = new THREE.AmbientLight('#2b3d54', 0.9);
    scene.add(ambientLight);

    const pinkLight = new THREE.DirectionalLight('#e0aaff', 1.5);
    pinkLight.position.set(-20, 20, 20);
    scene.add(pinkLight);

    const cyanLight = new THREE.DirectionalLight('#c5f6fa', 2.0);
    cyanLight.position.set(20, -20, 20);
    scene.add(cyanLight);

    const goldLight = new THREE.DirectionalLight('#ffe57f', 1.8);
    goldLight.position.set(0, 30, -10);
    scene.add(goldLight);

    // Sugar crystals
    const crystals = [];
    const geo = new THREE.IcosahedronGeometry(2.2, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.95,
      roughness: 0.02,
      transparent: true,
      opacity: 0.92,
      flatShading: true
    });

    for (let i = 0; i < 25; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const scale = 0.5 + Math.random() * 1.5;
      mesh.scale.set(scale, scale * 1.2, scale * 0.9);

      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.03,
        speedY: (Math.random() - 0.5) * 0.03,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01
      };

      scene.add(mesh);
      crystals.push(mesh);
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function animate() {
      requestAnimationFrame(animate);

      // Parallax smooth camera move
      camera.position.x += (mouseX * 8 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 6 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Background plane tilt
      bgMesh.rotation.y = mouseX * 0.05;
      bgMesh.rotation.x = mouseY * 0.05;

      crystals.forEach(mesh => {
        mesh.position.x += mesh.userData.speedX;
        mesh.position.y += mesh.userData.speedY;
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;

        if (Math.abs(mesh.position.x) > 35) mesh.userData.speedX *= -1;
        if (Math.abs(mesh.position.y) > 25) mesh.userData.speedY *= -1;
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  // Initialization dispatcher
  window.addEventListener('load', () => {
    initHomeProductCards();
    initRicePageCanvas();
    initCuminPageCanvas();
  });
})();
