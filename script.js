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
});

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
