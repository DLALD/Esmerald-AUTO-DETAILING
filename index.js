// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

// Navbar shrink + glassmorphism on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Active nav link on scroll using IntersectionObserver
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));

// Dropdown service links — open modal directly
document.querySelectorAll('.dropdown-menu a[data-service]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const card = document.querySelector(`.package-card[data-service="${link.dataset.service}"]`);
    if (card) card.click();
  });
});

// Package cards open modal
document.querySelectorAll('.package-card, .pkg-btn').forEach(el => {
  el.addEventListener('click', function(e) {
    const card = this.closest('.package-card') || this.parentElement;
    if (!card || !card.dataset.images) return;
    const rect = card.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const ox = ((rect.left + rect.width  / 2) / vw * 100).toFixed(1) + '%';
    const oy = ((rect.top  + rect.height / 2) / vh * 100).toFixed(1) + '%';
    modalBox.style.setProperty('--origin-x', ox);
    modalBox.style.setProperty('--origin-y', oy);
    buildModal(
      card.dataset.images.split('|'),
      card.dataset.title,
      card.dataset.desc,
      card.dataset.price,
      card.dataset.highlights,
      card.dataset.before,
      card.dataset.after,
      card.dataset.captions
    );
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// Hero slider
const slides      = document.querySelectorAll('.slide');
const dotsWrap    = document.getElementById('heroDots');
const heroContent = document.querySelector('.hero-content');
const heroSub     = document.getElementById('heroSub');
const heroTitle   = document.getElementById('heroTitle');
const heroBtn     = document.getElementById('heroBtn');
let current = 0;
let timer;

slides.forEach(slide => {
  if (slide.dataset.bg) {
    if (slide.classList.contains('active')) {
      slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
    } else {
      slide.style.backgroundImage = '';
    }
  }
});

// Build dots dynamically
slides.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.dataset.index = i;
  dot.addEventListener('click', () => { clearInterval(timer); goTo(i); startAuto(); });
  dotsWrap.appendChild(dot);
});

const dots = dotsWrap.querySelectorAll('.dot');

function updateText(index) {
  const slide = slides[index];
  heroContent.classList.add('animating');
  setTimeout(() => {
    heroSub.textContent   = slide.dataset.sub   || '';
    heroTitle.innerHTML   = slide.dataset.title || '';
    heroBtn.textContent   = slide.dataset.btn   || 'Our Services';
    heroContent.classList.remove('animating');
  }, 80);
}

function goTo(index) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = index;
  const nextSlide = slides[current];
  if (nextSlide.dataset.bg && !nextSlide.style.backgroundImage) {
    nextSlide.style.backgroundImage = `url('${nextSlide.dataset.bg}')`;
  }
  slides[current].classList.add('active');
  dots[current].classList.add('active');
  updateText(index);
}

function next() { goTo((current + 1) % slides.length); }
function startAuto() { timer = setInterval(next, 5000); }

updateText(0);
startAuto();

// Hero arrows
document.getElementById('heroPrev').addEventListener('click', () => { clearInterval(timer); goTo((current - 1 + slides.length) % slides.length); startAuto(); });
document.getElementById('heroNext').addEventListener('click', () => { clearInterval(timer); goTo((current + 1) % slides.length); startAuto(); });

// Service modal
const modal       = document.getElementById('serviceModal');
const modalClose  = document.getElementById('modalClose');
const modalSlides = document.getElementById('modalSlides');
const modalDots   = document.getElementById('modalDots');
const modalTitle  = document.getElementById('modalTitle');
const modalDesc   = document.getElementById('modalDesc');
const modalPrev   = document.getElementById('modalPrev');
const modalNext   = document.getElementById('modalNext');
const modalBox    = modal.querySelector('.modal-box');
const modalFooter = modal.querySelector('.modal-footer');

let mCurrent  = 0;
let mImages   = [];
let mCaptions = [];
let mTimer    = null;

function buildModal(images, title, desc, price, highlights, before, after, captions) {
  mImages   = images;
  mCaptions = (captions || '').split('|');
  mCurrent  = 0;
  modalSlides.innerHTML = '';
  modalDots.innerHTML   = '';

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'modal-slide';
    slide.style.backgroundImage = `url('${src}')`;
    modalSlides.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'modal-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goModal(i));
    modalDots.appendChild(dot);
  });

  modalTitle.textContent = title;
  modalDesc.textContent  = desc;
  document.getElementById('modalPrice').textContent = price || '65';

  const hl = document.getElementById('modalHighlights');
  hl.innerHTML = '';
  (highlights || '').split('|').forEach(text => {
    const li = document.createElement('li');
    li.innerHTML = text;
    hl.appendChild(li);
  });

  // Reset BA state
  const baBtn     = document.getElementById('modalBABtn');
  const baSlider  = document.getElementById('modalBASlider');
  if (baBtn && baSlider) {
    baBtn.classList.remove('active');
    baBtn.innerHTML = '<i class="fas fa-arrows-left-right"></i> Before &amp; After';
    baSlider.style.display    = 'none';
    modalSlides.style.display = '';
    document.getElementById('modalPrev').style.display = '';
    document.getElementById('modalNext').style.display = '';
    document.getElementById('modalDots').style.display = '';
  }

  // BA single button toggle
  const baAfterEl = document.getElementById('modalBAAfter');
  const baBeforeEl= document.getElementById('modalBABefore');
  const baDivModal= document.getElementById('modalBADivider');
  const baLabelL  = baSlider.querySelector('.ba-label.left');
  const baLabelR  = baSlider.querySelector('.ba-label.right');
  let baActive = false, baDragging = false;

  if (before && after) {
    baBtn.style.display = '';
    baAfterEl.style.backgroundImage  = `url('${after}')`;
    baBeforeEl.style.backgroundImage = `url('${before}')`;
    // reset divider to center
    baBeforeEl.style.clipPath = 'inset(0 0 0 50%)';
    baDivModal.style.left = '50%';
  } else {
    baBtn.style.display = 'none';
  }

  baBtn.onclick = () => {
    const cap = document.getElementById('modalCaption');
    baActive = !baActive;
    baBtn.classList.toggle('active', baActive);
    baSlider.style.display  = baActive ? 'block' : 'none';
    modalSlides.style.display = baActive ? 'none' : '';
    document.getElementById('modalPrev').style.display = baActive ? 'none' : '';
    document.getElementById('modalNext').style.display = baActive ? 'none' : '';
    document.getElementById('modalDots').style.display = baActive ? 'none' : '';
    cap.style.display = baActive ? 'none' : '';
    if (!baActive) {
      // Restore current caption when returning to gallery
      const txt = mCaptions[mCurrent] || '';
      cap.innerHTML = txt ? `<span>${txt}</span>` : '';
    }
    baBtn.innerHTML = baActive
      ? '<i class="fas fa-images"></i> Gallery'
      : '<i class="fas fa-arrows-left-right"></i> Before &amp; After';
    if (baActive) {
      baBeforeEl.style.clipPath = 'inset(0 0 0 50%)';
      baDivModal.style.left = '50%';
    }
  };

  function setBAPos(x) {
    const rect = baSlider.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.min(Math.max(pct, 2), 98);
    baBeforeEl.style.clipPath = `inset(0 0 0 ${pct}%)`;
    baDivModal.style.left     = pct + '%';
    baLabelL.style.opacity    = pct < 18 ? '0' : '1';
    baLabelR.style.opacity    = pct > 82 ? '0' : '1';
  }

  baSlider.addEventListener('mousedown',  e => { baDragging = true; setBAPos(e.clientX); });
  baSlider.addEventListener('touchstart', e => { baDragging = true; setBAPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mousemove',  e => { if (baDragging) setBAPos(e.clientX); });
  window.addEventListener('touchmove',  e => { if (baDragging) setBAPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup',  () => baDragging = false);
  window.addEventListener('touchend', () => baDragging = false);

  modalSlides.style.transition = 'none';
  modalSlides.style.transform  = 'translateX(0)';

  const cap = document.getElementById('modalCaption');
  cap.style.display = '';

  // Initialize caption on open
  goModal(0);

  // Auto-play
  clearInterval(mTimer);
  mTimer = setInterval(() => {
    if (!document.getElementById('modalBASlider') ||
        document.getElementById('modalBASlider').style.display === 'none') {
      goModal((mCurrent + 1) % mImages.length);
    }
  }, 4000);
}

function goModal(index) {
  mCurrent = index;
  modalSlides.style.transition = 'transform 0.5s cubic-bezier(0.77,0,0.18,1)';
  modalSlides.style.transform  = `translateX(-${index * 100}%)`;
  document.querySelectorAll('.modal-dot').forEach((d, i) =>
    d.classList.toggle('active', i === index)
  );
  // Update caption
  const cap = document.getElementById('modalCaption');
  const txt = mCaptions[index] || '';
  cap.innerHTML = txt ? `<span>${txt}</span>` : '';
}

document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    // Calculate origin point relative to viewport for the scale animation
    const rect = card.querySelector('.service-img').getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;
    const ox   = ((rect.left + rect.width  / 2) / vw * 100).toFixed(1) + '%';
    const oy   = ((rect.top  + rect.height / 2) / vh * 100).toFixed(1) + '%';
    modalBox.style.setProperty('--origin-x', ox);
    modalBox.style.setProperty('--origin-y', oy);

    buildModal(
      card.dataset.images.split('|'),
      card.dataset.title,
      card.dataset.desc,
      card.dataset.price,
      card.dataset.highlights,
      card.dataset.before,
      card.dataset.after,
      card.dataset.captions
    );

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  clearInterval(mTimer);
  document.getElementById('modalForm').classList.remove('active');
  document.getElementById('formCopy').classList.remove('active');
  document.getElementById('quoteForm').style.display = '';
  document.querySelector('.modal-info').style.display = '';
  if (modalFooter) modalFooter.style.display = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Book button — show form
document.getElementById('modalBookBtn').addEventListener('click', () => {
  document.querySelector('.modal-info').style.display = 'none';
  document.getElementById('modalForm').classList.add('active');
  if (modalFooter) modalFooter.style.display = 'none';
});

// Back button — hide form
document.getElementById('formBack').addEventListener('click', () => {
  document.getElementById('modalForm').classList.remove('active');
  document.querySelector('.modal-info').style.display = '';
  if (modalFooter) modalFooter.style.display = '';
});

// Submit form — build iMessage
document.getElementById('quoteForm').addEventListener('submit', e => {
  e.preventDefault();
  const service = modalTitle.textContent;
  const name    = document.getElementById('qName').value;
  const phone   = document.getElementById('qPhone').value;
  const car     = document.getElementById('qCar').value;
  const year    = document.getElementById('qYear').value;
  const time    = document.getElementById('qTime').value || 'Flexible';
  const notes   = document.getElementById('qNotes').value;

  const msg = `Hi Emerald Auto Detailing! I'd like to request a quote:

Service: ${service}
Name: ${name}
Phone: ${phone}
Car: ${year} ${car}
Preferred Time: ${time}${notes ? '\nNotes: ' + notes : ''}`;

  document.getElementById('copyBox').value = msg;
  document.getElementById('quoteForm').style.display = 'none';
  document.getElementById('formCopy').classList.add('active');

  const smsBtn = document.getElementById('smsBtn');
  smsBtn.href = 'sms:+19203787005?body=' + encodeURIComponent(msg);
  smsBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = this.href;
  }, { once: true });
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const box = document.getElementById('copyBox');
  box.select();
  navigator.clipboard.writeText(box.value).catch(() => document.execCommand('copy'));
  const btn = document.getElementById('copyBtn');
  btn.classList.add('copied');
  btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = '<i class="fas fa-copy"></i> Copy Message';
  }, 2500);
});

modalPrev.addEventListener('click', () => { clearInterval(mTimer); goModal((mCurrent - 1 + mImages.length) % mImages.length); mTimer = setInterval(() => goModal((mCurrent + 1) % mImages.length), 4000); });
modalNext.addEventListener('click', () => { clearInterval(mTimer); goModal((mCurrent + 1) % mImages.length); mTimer = setInterval(() => goModal((mCurrent + 1) % mImages.length), 4000); });

// Before / After sliders
function initBA(containerId, beforeId, dividerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const before   = document.getElementById(beforeId);
  const divider  = document.getElementById(dividerId);
  const labelL   = container.querySelector('.ba-label.left');
  const labelR   = container.querySelector('.ba-label.right');
  let dragging = false;

  function setPos(x) {
    const rect = container.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.min(Math.max(pct, 2), 98);
    before.style.clipPath = `inset(0 0 0 ${pct}%)`;
    divider.style.left    = pct + '%';
    labelL.style.opacity  = pct < 18 ? '0' : '1';
    labelR.style.opacity  = pct > 82 ? '0' : '1';
  }

  container.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
  container.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup',  () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);
}

initBA('baContainer',      'baBefore',      'baDivider');
initBA('baContainerExt',   'baBeforeExt',   'baDividerExt');
initBA('baContainerWheel', 'baBeforeWheel', 'baDividerWheel');

// BA Tabs
document.querySelectorAll('.ba-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ba-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ba-container').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`.ba-container[data-ba="${tab.dataset.ba}"]`).classList.add('active');
  });
});
