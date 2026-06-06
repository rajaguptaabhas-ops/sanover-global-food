// Scroll Frame Canvas Animation - Sanover Global Food
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const frameCount = 206;

  // Generate file paths
  const currentFrame = index => `assets/hero-frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

  // Preload Images
  const images = [];
  const animState = { frame: 1 };

  // Preload first frame immediately to draw it as soon as possible
  const firstFrameImage = new Image();
  firstFrameImage.src = currentFrame(1);
  firstFrameImage.onload = () => {
    images[0] = firstFrameImage;
    handleResize(); // Set dynamic bounds and render initial frame
    
    // Once the first frame is ready, load the rest in the background
    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images[i - 1] = img;
    }
  };

  // Set up GSAP ScrollTrigger timeline
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Create custom scrub animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".style-hero-adjust",
        start: "top top",
        end: "+=2200", // Length of scroll duration
        scrub: 0.6,
        pin: true,     // Pin the hero section in viewport
        anticipatePin: 1
      }
    });

    // Scrub frame numbers from 1 to 215
    tl.to(animState, {
      frame: frameCount,
      snap: "frame",
      ease: "none",
      onUpdate: () => {
        const activeImg = images[animState.frame - 1];
        if (activeImg) {
          renderFrame(activeImg);
        }
      }
    });

    // Fade out text content overlay and buttons as scroll goes down
    tl.to(".hero-content-stitch", {
      opacity: 0,
      y: -50,
      ease: "power1.inOut"
    }, 0);
  }

  // Draw image to fill the canvas in "cover" layout
  function renderFrame(img) {
    // CRITICAL: Prevent drawing if image is not fully loaded or has invalid dimensions
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Handle window resizing and keep the drawing sharp and undistorted
  function handleResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const activeImg = images[animState.frame - 1] || firstFrameImage;
    if (activeImg) {
      renderFrame(activeImg);
    }
  }

  window.addEventListener("resize", handleResize);
});
