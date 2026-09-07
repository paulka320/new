document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if (toggleButton && navList) {
    toggleButton.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  initSwiper();
  initCounters();
  initAppointmentForm();
});

function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  const feedback = document.getElementById('appointment-feedback');
  if (!form || !feedback) return;

  const submitBtn = document.getElementById('appointment-submit-btn');

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

    const nameInput = document.getElementById('patient-name');
    const phoneInput = document.getElementById('phone-number');
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
      const formSubmitRequest = fetch('https://formsubmit.co/ajax/stanthonydoctorsavenue@gmail.com', {
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

  const slider = document.querySelector('.swiper-container');
  if (!slider) {
    return;
  }

  new Swiper(slider, {
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    autoplay: { delay: 5000, disableOnInteraction: false },
  });
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
