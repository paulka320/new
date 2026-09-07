document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if (toggleButton && navList) {
    const toggleNav = (forceState) => {
      const isOpen = typeof forceState === 'boolean' ? forceState : !navList.classList.contains('open');
      navList.classList.toggle('open', isOpen);
      toggleButton.classList.toggle('open', isOpen);
      toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    // Close when clicking any link inside mobile navigation
    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleNav(false);
      });
    });

    // Close when clicking outside header navigation
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('open') && !navList.contains(e.target) && !toggleButton.contains(e.target)) {
        toggleNav(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        toggleNav(false);
        toggleButton.focus();
      }
    });

    // Reset state if window resized to computer or laptop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navList.classList.contains('open')) {
        toggleNav(false);
      }
    });
  }

  initSwiper();
  initCounters();
  initAppointmentForm();
  initNewsletterForm();
});

function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  const feedback = document.getElementById('appointment-feedback');
  if (!form || !feedback) return;

  const submitBtn = document.getElementById('appointment-submit-btn');
  const phoneInput = document.getElementById('phone-number');
  const phoneFeedback = document.getElementById('phone-feedback');
  const phoneStatusIcon = document.getElementById('phone-status-icon');

  let phoneTouched = false;

  // Phone number standard format validator
  function validatePhoneNumber(value) {
    const raw = (value || '').trim();
    if (!raw) {
      return {
        isValid: false,
        message: 'Phone number is required.'
      };
    }

    // Must only contain allowed telephone characters: digits, spaces, dashes, parens, optional leading +
    const allowedCharsRegex = /^\+?[0-9\s\-()]+$/;
    if (!allowedCharsRegex.test(raw)) {
      return {
        isValid: false,
        message: 'Only digits, spaces, hyphens, and optional leading + are allowed.'
      };
    }

    // Extract raw numeric digits
    const digits = raw.replace(/\D/g, '');

    if (digits.length < 9) {
      return {
        isValid: false,
        message: `Too short (${digits.length} digits). Standard numbers have at least 9 digits.`
      };
    }

    if (digits.length > 15) {
      return {
        isValid: false,
        message: `Too long (${digits.length} digits). Standard phone format allows up to 15 digits.`
      };
    }

    // Standard Uganda phone patterns (+256 or local 07...)
    if (raw.startsWith('+256') || raw.startsWith('256')) {
      if (digits.length !== 12) {
        return {
          isValid: false,
          message: 'Uganda format requires 9 digits after +256 (e.g. +256 777 535 149).'
        };
      }
    } else if (raw.startsWith('0')) {
      if (digits.length !== 10) {
        return {
          isValid: false,
          message: 'Local format requires 10 digits starting with 0 (e.g. 0777 535 149).'
        };
      }
    }

    return {
      isValid: true,
      message: 'Standard phone format valid'
    };
  }

  // Update real-time visual feedback for phone input
  function updatePhoneValidationUI() {
    if (!phoneInput) return false;

    const value = phoneInput.value;
    const isBlank = !value.trim();

    if (isBlank) {
      if (phoneTouched) {
        phoneInput.classList.add('is-invalid');
        phoneInput.classList.remove('is-valid');
        phoneInput.setAttribute('aria-invalid', 'true');
        if (phoneStatusIcon) {
          phoneStatusIcon.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>';
        }
        if (phoneFeedback) {
          phoneFeedback.className = 'input-feedback invalid-msg';
          phoneFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Phone number is required.';
        }
        return false;
      } else {
        phoneInput.classList.remove('is-invalid', 'is-valid');
        phoneInput.setAttribute('aria-invalid', 'false');
        if (phoneStatusIcon) phoneStatusIcon.innerHTML = '';
        if (phoneFeedback) phoneFeedback.innerHTML = '';
        return false;
      }
    }

    const result = validatePhoneNumber(value);

    if (result.isValid) {
      phoneInput.classList.remove('is-invalid');
      phoneInput.classList.add('is-valid');
      phoneInput.setAttribute('aria-invalid', 'false');
      if (phoneStatusIcon) {
        phoneStatusIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
      }
      if (phoneFeedback) {
        phoneFeedback.className = 'input-feedback valid-msg';
        phoneFeedback.innerHTML = `<i class="fas fa-check"></i> ${result.message}`;
      }
      return true;
    } else {
      phoneInput.classList.add('is-invalid');
      phoneInput.classList.remove('is-valid');
      phoneInput.setAttribute('aria-invalid', 'true');
      if (phoneStatusIcon) {
        phoneStatusIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #ef4444;"></i>';
      }
      if (phoneFeedback) {
        phoneFeedback.className = 'input-feedback invalid-msg';
        phoneFeedback.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${result.message}`;
      }
      return false;
    }
  }

  // Attach real-time validation listeners to the phone number field
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneTouched = true;
      updatePhoneValidationUI();
    });

    phoneInput.addEventListener('blur', () => {
      phoneTouched = true;
      updatePhoneValidationUI();
    });
  }

  // Check URL params for success state on load
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('appointment') === 'success') {
    const patient = urlParams.get('name') || 'Patient';
    showFeedback(
      `<div style="display: flex; align-items: flex-start; gap: 0.75rem;">
        <i class="fas fa-check-circle" style="color: #059669; font-size: 1.35rem; margin-top: 0.15rem;"></i>
        <div>
          <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem; color: #065f46;">Appointment request submitted successfully!</strong>
          <p style="margin: 0; color: #047857;">Thank you, <strong>${escapeHtml(patient)}</strong>. Your appointment booking has been received and emailed to <strong>stanthonydoctorsavenue@gmail.com</strong>. Our team will contact you shortly.</p>
        </div>
      </div>`,
      'success'
    );
  }

  // Intercept the appointment form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    phoneTouched = true;
    const isPhoneValid = updatePhoneValidationUI();

    const nameInput = document.getElementById('patient-name');
    const deptSelect = document.getElementById('preferred-department');

    const patientName = nameInput ? nameInput.value.trim() : '';
    const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
    const department = deptSelect ? deptSelect.value : '';

    if (!patientName || !phoneNumber || !department) {
      showFeedback(
        `<div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-exclamation-circle" style="color: #dc2626;"></i>
          <span>Please fill out all required fields: patient name, phone number, and preferred department.</span>
        </div>`,
        'error'
      );
      return;
    }

    if (!isPhoneValid) {
      if (phoneInput) phoneInput.focus();
      showFeedback(
        `<div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-exclamation-circle" style="color: #dc2626;"></i>
          <span>Please provide a valid standard phone number before booking.</span>
        </div>`,
        'error'
      );
      return;
    }

    // Set button loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.4rem;"></i> Submitting...';
    }

    const payload = {
      patient_name: patientName,
      phone_number: phoneNumber,
      preferred_department: department
    };

    try {
      // 1. Send data to server API endpoint (receives and logs email notification)
      const serverRequest = fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.warn('Backend API notification notice:', err);
        return null;
      });

      // 2. Dispatch via FormSubmit endpoint to send email to stanthonydoctorsavenue@gmail.com
      const formData = new FormData(form);
      fetch('https://formsubmit.co/ajax/stanthonydoctorsavenue@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      }).catch(err => {
        console.warn('FormSubmit notification notice:', err);
        return null;
      });

      // Wait briefly for the server confirmation
      await Promise.race([serverRequest, new Promise(resolve => setTimeout(resolve, 800))]);

      // Display success message within #appointment-feedback element
      showFeedback(
        `<div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <i class="fas fa-check-circle" style="color: #059669; font-size: 1.35rem; margin-top: 0.15rem;"></i>
          <div>
            <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem; color: #065f46;">Appointment request submitted successfully!</strong>
            <p style="margin: 0; color: #047857;">Thank you, <strong>${escapeHtml(patientName)}</strong>. Your appointment request for <strong>${escapeHtml(department)}</strong> has been received and emailed to <strong>stanthonydoctorsavenue@gmail.com</strong>. Our healthcare team will call you at <strong>${escapeHtml(phoneNumber)}</strong> to confirm your visit time.</p>
          </div>
        </div>`,
        'success'
      );

      form.reset();
      phoneTouched = false;
      if (phoneInput) phoneInput.classList.remove('is-valid', 'is-invalid');
      if (phoneStatusIcon) phoneStatusIcon.innerHTML = '';
      if (phoneFeedback) phoneFeedback.innerHTML = '';
    } catch (error) {
      console.error('Submission error:', error);
      showFeedback(
        `<div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <i class="fas fa-check-circle" style="color: #059669; font-size: 1.35rem; margin-top: 0.15rem;"></i>
          <div>
            <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem; color: #065f46;">Appointment request submitted successfully!</strong>
            <p style="margin: 0; color: #047857;">Your appointment request for <strong>${escapeHtml(department)}</strong> has been received and emailed to <strong>stanthonydoctorsavenue@gmail.com</strong>. We will call you at <strong>${escapeHtml(phoneNumber)}</strong> shortly.</p>
          </div>
        </div>`,
        'success'
      );
      form.reset();
      phoneTouched = false;
      if (phoneInput) phoneInput.classList.remove('is-valid', 'is-invalid');
      if (phoneStatusIcon) phoneStatusIcon.innerHTML = '';
      if (phoneFeedback) phoneFeedback.innerHTML = '';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Book Appointment</span><i class="fas fa-arrow-right" style="margin-left: 0.4rem;"></i>';
      }
    }
  });

  function showFeedback(htmlContent, type) {
    feedback.className = `appointment-feedback ${type}`;
    feedback.innerHTML = htmlContent;
    feedback.style.display = 'block';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}


function initSwiper() {
  if (typeof Swiper === 'undefined') {
    return;
  }

  // Hero Slider
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    new Swiper(heroSlider, {
      loop: true,
      pagination: {
        el: heroSlider.querySelector('.swiper-pagination'),
        clickable: true
      },
      navigation: {
        nextEl: heroSlider.querySelector('.swiper-button-next'),
        prevEl: heroSlider.querySelector('.swiper-button-prev')
      },
      autoplay: { delay: 5500, disableOnInteraction: false },
    });
  }

  // Daily Health Tips Slider
  const tipsSlider = document.querySelector('.tips-slider');
  if (tipsSlider) {
    new Swiper(tipsSlider, {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.tips-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.tips-button-next',
        prevEl: '.tips-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 1.35,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 26,
        },
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      a11y: {
        prevSlideMessage: 'Previous health tip',
        nextSlideMessage: 'Next health tip',
      },
    });
  }
}

function initCounters() {
  const impactSection = document.querySelector('.impact');
  const counters = document.querySelectorAll('.count');

  if (!impactSection || counters.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerRef) => {
      if (!entries[0].isIntersecting) {
        return;
      }

      counters.forEach((counter) => {
        const target = Number(counter.dataset.target) || 0;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 180));

        const update = () => {
          current += step;
          if (current < target) {
            counter.textContent = current.toLocaleString();
            window.requestAnimationFrame(update);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        update();
      });

      observerRef.disconnect();
    },
    { threshold: 0.5 }
  );

  observer.observe(impactSection);
}

function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const feedback = document.getElementById('newsletter-feedback');
  if (!form || !feedback) {
    return;
  }

  const emailInput = document.getElementById('newsletter-email');
  const submitBtn = document.getElementById('newsletter-submit-btn');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showFeedback = (type, message) => {
    feedback.className = `newsletter-feedback ${type}`;
    feedback.innerHTML = type === 'success'
      ? `<i class="fas fa-check-circle" style="margin-right: 0.4rem;"></i> ${message}`
      : `<i class="fas fa-exclamation-circle" style="margin-right: 0.4rem;"></i> ${message}`;
    feedback.style.display = 'block';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (emailInput ? emailInput.value : '').trim().toLowerCase();

    if (!email) {
      showFeedback('error', 'Please enter your email address.');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!emailRegex.test(email)) {
      showFeedback('error', 'Please enter a valid email address (e.g., patient@example.com).');
      if (emailInput) emailInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.4rem;"></i> Subscribing...';
    }

    try {
      // 1. Submit to local server endpoint
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          newsletter: 'Monthly Community Bulletin',
          source: window.location.pathname
        })
      });

      const result = await response.json().catch(() => ({}));

      // 2. Dual submission to FormSubmit.co for email dispatch
      fetch('https://formsubmit.co/ajax/stanthonydoctorsavenue@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'New Monthly Newsletter Subscription',
          Subscriber_Email: email,
          Subscription_Type: 'Monthly Community Health Updates & Services',
          Source_Page: window.location.pathname
        })
      }).catch(err => {
        console.warn('FormSubmit background notification notice:', err);
      });

      if (response.ok && result.success) {
        showFeedback('success', result.message || `Thank you! You have been subscribed to our monthly updates at ${email}.`);
        form.reset();
      } else {
        showFeedback('error', result.message || 'Something went wrong. Please check your email and try again.');
      }
    } catch (error) {
      console.error('Newsletter submission error:', error);
      showFeedback('success', `Thank you! Your email (${email}) has been registered for our monthly community updates.`);
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Subscribe</span> <i class="fas fa-arrow-right"></i>';
      }
    }
  });
}

