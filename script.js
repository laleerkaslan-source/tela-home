// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('open');
});

// Close menu on link click
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
  }
});

// ===== Header Scroll Effect =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// ===== Scroll Animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.product-card, .why-card, .contact-item, .contact-form, .store-content, .about-content, .campaign-banner, .insta-placeholder'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;

  if (name && phone && message) {
    // WhatsApp'a yönlendir
    const waMessage = `Merhaba, ben ${name}. ${message} (Tel: ${phone})`;
    const waUrl = `https://wa.me/905063977307?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
    contactForm.reset();
  }
});
