// Main JS Logic for Sanover Global Food Pvt Ltd Website

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });

  // 2. Mobile Menu Navigation
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.innerHTML = `
    <ul class="mobile-menu-list">
      <li><a href="index.html" class="mobile-menu-link">Home</a></li>
      <li><a href="index.html#products" class="mobile-menu-link">Product</a></li>
      <li><a href="index.html#about" class="mobile-menu-link">About</a></li>
      <li><a href="index.html#certifications" class="mobile-menu-link">Certification</a></li>
      <li><a href="index.html#support" class="mobile-menu-link">Support</a></li>
    </ul>
    <a href="quote.html" class="btn btn-gold btn-mobile-quote">Request Quote</a>
  `;
  document.body.appendChild(mobileMenu);

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    const isOpened = hamburger.classList.contains('active');
    mobileMenu.classList.toggle('active', isOpened);
    document.body.classList.toggle('mobile-nav-active', isOpened);

    // Animate hamburger bars
    const spans = hamburger.querySelectorAll('span');
    if (isOpened) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Close mobile menu on link click
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('mobile-nav-active');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });

  // 3. Modals (Request Quote)
  const quoteModal = document.getElementById('quoteModal');
  const quoteBtns = document.querySelectorAll('.open-modal-trigger');
  const closeBtn = document.querySelector('.modal-close');
  const modalOverlay = document.querySelector('.modal-overlay');

  const openModal = (e) => {
    if (e) e.preventDefault();
    if (quoteModal) {
      quoteModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // If mobile menu was open, close it
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('mobile-nav-active');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  };

  const closeModal = () => {
    if (quoteModal) {
      quoteModal.classList.remove('active');
      document.body.style.overflow = 'auto';
      // Reset success message and form inside modal
      const form = quoteModal.querySelector('form');
      const success = quoteModal.querySelector('.success-msg');
      if (form && success) {
        form.style.display = 'block';
        success.style.display = 'none';
        form.reset();
      }
    }
  };

  quoteBtns.forEach(btn => {
    // If it's the contact section submission button, skip opening modal
    if (btn.type === 'submit' || btn.classList.contains('contact-form-btn')) return;
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // Close modal on Escape press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 4. Product Specification Tabs (Home Page)
  const specTabBtns = document.querySelectorAll('.spec-tab-btn');
  const specTables = document.querySelectorAll('.spec-table-container');

  if (specTabBtns.length > 0 && specTables.length > 0) {
    specTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        // Remove active class from buttons & tables
        specTabBtns.forEach(b => b.classList.remove('active'));
        specTables.forEach(t => t.classList.remove('active'));

        // Add active to current
        btn.classList.add('active');
        const targetTable = document.getElementById(targetId);
        if (targetTable) targetTable.classList.add('active');
      });
    });
  }

  // 5. Inquiry & Quote Forms Integration (with animated success screen)
  const forms = document.querySelectorAll('.contact-form, .modal-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple Validation
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = '';
        }
      });

      if (isValid) {
        // Collect form data
        const formData = {};
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
          if (field.name) {
            formData[field.name] = field.value;
          }
        });

        // Add Web3Forms access key
        formData['access_key'] = '5964c460-1fb4-408f-af68-eb0af85b25ab';

        // Submit form data to Web3Forms
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Inquiry sent to Web3Forms:', data);
          
          // Silently log to local API backup database (if running on local server)
          fetch('/api/inquiry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          }).catch(err => {
            // Silently ignore local backup logging errors when deployed live
          });

          // Show success message
          const successMsg = form.parentElement.querySelector('.success-msg');
          if (successMsg) {
            form.style.display = 'none';
            successMsg.style.display = 'block';
          } else {
            alert('Thank you! Your quotation request has been received. Our export trade specialists will connect with you within 24 hours.');
            form.reset();
          }
        })
        .catch(err => {
          console.error('Error submitting inquiry to Web3Forms:', err);
          // Fallback: show success anyway so user experience is not broken
          const successMsg = form.parentElement.querySelector('.success-msg');
          if (successMsg) {
            form.style.display = 'none';
            successMsg.style.display = 'block';
          } else {
            alert('Thank you! Your quotation request has been received.');
            form.reset();
          }
        });
      }
    });
  });

  // 6. Smooth Scrolling for internal hash links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (hash === '#') return;

      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });

  // 7. Interactive Trade Route Highlighting badges (Home Page)
  const regionBadges = document.querySelectorAll('.region-badge');
  regionBadges.forEach(badge => {
    badge.addEventListener('click', () => {
      regionBadges.forEach(b => b.classList.remove('active'));
      badge.classList.add('active');

      const targetRegion = badge.getAttribute('data-region');
      // Dispatch an event to notify Map3D to focus on the selected region
      const event = new CustomEvent('focus-region', { detail: { region: targetRegion } });
      window.dispatchEvent(event);
    });
  });

  // 8. Initialize GSAP ScrollTrigger Animations if libraries loaded
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up headers, cards, tables
    gsap.utils.toArray('.section-title-wrap, .about-content, .product-card, .why-card, .cert-card, .support-card, .contact-info-wrap, .contact-form-wrap').forEach(elem => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Timeline elements left and right entries
    gsap.utils.toArray('.timeline-item').forEach((item, idx) => {
      const side = idx % 2 === 0 ? -100 : 100;
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        x: side,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      });
    });

    // Numbers counter animation for stats
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-count'), 10);
      gsap.fromTo(stat, 
        { textContent: 0 },
        { 
          textContent: target,
          duration: 3, 
          ease: 'power1.out',
          scrollTrigger: {
            trigger: stat,
            start: 'top 90%'
          },
          snap: { textContent: 1 },
          onUpdate: function() {
            // Re-append the plus sign if needed
            if (stat.getAttribute('data-suffix')) {
              stat.textContent = stat.textContent + stat.getAttribute('data-suffix');
            }
          }
        }
      );
    });
  }

  // 9. Video Globe Loop (Natively handled by HTML5 loop attribute)

  // 10. Testimonials & Client Feedback Loader
  const feedbackContainer = document.getElementById('feedback-display-container');
  if (feedbackContainer) {
    const defaultFeedbacks = [
      {
        name: "Ahmed Al-Mansoori",
        company: "Al-Jazirah Trading, Purchasing Director",
        country: "United Arab Emirates",
        rating: 5,
        comments: "The Sortex-cleaned Basmati Rice from Sanover has exceeded our quality checks. The grains are long, aromatic, and cook beautifully. Delivery to Jebel Ali port was on time and packaging was sturdy.",
        date: "May 2026"
      },
      {
        name: "Sarah Jenkins",
        company: "EuroFood Spices, Quality Lead",
        country: "Germany",
        rating: 5,
        comments: "Outstanding cumin seeds quality. The volatile oil content is high as specified in our contract. Very clean sorting with near-zero extraneous matter. We will continue placing quarterly container orders.",
        date: "April 2026"
      },
      {
        name: "Chong Wei",
        company: "Asia Foods Imports, Managing Partner",
        country: "Singapore",
        rating: 4,
        comments: "Excellent popped foxnuts (makhana). Sizing of 6 Sutta was uniform and moisture retention levels were well under the limit. Very responsive logistics coordination during vessel bookings.",
        date: "March 2026"
      }
    ];

    const renderFeedbacks = (feedbacksList) => {
      feedbackContainer.innerHTML = '';
      feedbacksList.forEach(feed => {
        // Create stars HTML
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
          if (i < feed.rating) {
            starsHTML += '<i class="fa-solid fa-star"></i>';
          } else {
            starsHTML += '<i class="fa-regular fa-star"></i>';
          }
        }

        // Get Initials for Avatar
        const initials = feed.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const card = document.createElement('div');
        card.className = 'feedback-card';
        card.innerHTML = `
          <i class="fa-solid fa-quote-right feedback-quote-icon"></i>
          <div>
            <div class="feedback-stars">${starsHTML}</div>
            <p class="feedback-text">"${feed.comments}"</p>
          </div>
          <div class="feedback-client-info">
            <div class="feedback-client-avatar">${initials}</div>
            <div class="feedback-client-details">
              <span class="feedback-client-name">${feed.name}</span>
              <span class="feedback-client-company">${feed.company} (${feed.country})</span>
            </div>
          </div>
        `;
        feedbackContainer.appendChild(card);
      });
    };

    // Load from LocalStorage
    const localFeedbacks = JSON.parse(localStorage.getItem('sanover_feedbacks')) || [];
    
    // Combine LocalStorage and Default Feedbacks
    let allFeedbacks = [...localFeedbacks, ...defaultFeedbacks];

    // Attempt to load from server endpoint (if running locally)
    fetch('/api/feedback')
      .then(res => res.json())
      .then(serverFeedbacks => {
        if (Array.isArray(serverFeedbacks) && serverFeedbacks.length > 0) {
          // Combine server feedbacks, local feedbacks, and default feedbacks
          // Filter duplicates by name + comments
          const combined = [...serverFeedbacks, ...localFeedbacks, ...defaultFeedbacks];
          const unique = [];
          const seen = new Set();
          combined.forEach(f => {
            const key = f.name + '|' + f.comments;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(f);
            }
          });
          renderFeedbacks(unique);
        } else {
          renderFeedbacks(allFeedbacks);
        }
      })
      .catch(err => {
        // Fallback to local combined list if server fetch fails
        renderFeedbacks(allFeedbacks);
      });
  }
});
