// ===== Language Switch =====
let currentLang = 'tr';

const langBtn = document.getElementById('langBtn');

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  updateLanguage();
});

function updateLanguage() {
  const elements = document.querySelectorAll('[data-tr][data-en]');
  elements.forEach(el => {
    const text = el.getAttribute(`data-${currentLang}`);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });

  document.documentElement.lang = currentLang;
  langBtn.textContent = currentLang === 'tr' ? 'TR / EN' : 'EN / TR';
}

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

// ===== Header Scroll Effect =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.06)';
  }
});

// ===== Scroll Animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-in class to animatable elements
document.querySelectorAll('.about-card, .product-card, .feature-item, .contact-item, .contact-form').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (name && email && message) {
    const successMsg = currentLang === 'tr'
      ? 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.'
      : 'Your message has been sent successfully! We will get back to you as soon as possible.';

    alert(successMsg);
    contactForm.reset();
  }
});
