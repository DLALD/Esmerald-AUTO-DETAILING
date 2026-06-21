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
      card.dataset.captions,
      card.dataset.duration
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

function buildModal(images, title, desc, price, highlights, before, after, captions, duration) {
  window.currentServiceDuration = parseInt(duration, 10) || 45;
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

  // Reset calendario y horario al abrir cualquier servicio
  if (window.resetQuoteCalendar) window.resetQuoteCalendar();

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
  const date    = document.getElementById('selectedDate').value || '';
  const time    = document.getElementById('selectedTime').value || 'Flexible';
  const notes   = document.getElementById('qNotes').value;

  const msg = `Hi Emerald Auto Detailing! I'd like to request a quote:

Service: ${service}
Name: ${name}
Phone: ${phone}
Car: ${year} ${car}
Preferred Date: ${date}
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
// Quote calendar + time slots
(function () {
  const FESTIVOS = [
    // Agregá acá los festivos en formato 'YYYY-MM-DD', ej: '2026-07-20',
  ];

  const calendarEl = document.getElementById('qcDays');
  const monthLabel = document.getElementById('qcMonthLabel');
  const prevBtn = document.getElementById('qcPrev');
  const nextBtn = document.getElementById('qcNext');
  const selectedDateInput = document.getElementById('selectedDate');
  const timeSlotWrap = document.getElementById('timeSlotWrap');
  const timeSlotsEl = document.getElementById('timeSlots');
  const selectedTimeInput = document.getElementById('selectedTime');
  const dateTrigger = document.getElementById('dateTrigger');
  const dateTriggerLabel = document.getElementById('dateTriggerLabel');
  const quoteCalendar = document.getElementById('quoteCalendar');

  if (!calendarEl) return;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let viewDate = new Date();
  viewDate.setDate(1);
  let chosenDate = null;

  const isFestivo = (dateStr) => FESTIVOS.includes(dateStr);
  const isSunday = (date) => date.getDay() === 0;

  function fmt(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function renderCalendar() {
    calendarEl.innerHTML = '';
    monthLabel.textContent = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'qc-day empty';
      calendarEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const dateStr = fmt(thisDate);
      const btn = document.createElement('div');
      btn.className = 'qc-day';
      btn.textContent = d;

      const past = thisDate < today;
      const sunday = isSunday(thisDate);

      if (past || sunday) {
        btn.classList.add('disabled');
      } else {
        btn.addEventListener('click', () => selectDate(thisDate, btn));
      }

      if (dateStr === fmt(today)) btn.classList.add('today');
      if (chosenDate && fmt(chosenDate) === dateStr) btn.classList.add('selected');

      calendarEl.appendChild(btn);
    }
  }

  function selectDate(date, btn) {
    document.querySelectorAll('.qc-day.selected').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    chosenDate = date;
    selectedDateInput.value = fmt(date);

    const niceLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dateTriggerLabel.textContent = niceLabel;
    dateTrigger.classList.add('has-date');

    quoteCalendar.classList.remove('open');
    dateTrigger.classList.remove('open');

    renderTimeSlots(date);
  }
function toMinutes(h, m) { return h * 60 + m; }

  function formatTime(totalMinutes) {
    let h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function renderTimeSlots(date) {
    const dateStr = fmt(date);
    const day = date.getDay();
    const festivo = isFestivo(dateStr);
    const duration = window.currentServiceDuration || 45;

    let periods;
    if (day === 6 || festivo) {
      periods = [
        { label: 'Morning',   start: toMinutes(8, 0),  end: toMinutes(12, 0) },
        { label: 'Afternoon', start: toMinutes(12, 0), end: toMinutes(17, 0) },
        { label: 'Evening',   start: toMinutes(17, 0), end: toMinutes(21, 0) },
      ];
    } else {
      periods = [
        { label: 'Afternoon', start: toMinutes(14, 0), end: toMinutes(17, 0) },
        { label: 'Evening',   start: toMinutes(17, 0), end: toMinutes(21, 0) },
      ];
    }

    timeSlotsEl.innerHTML = '';
    selectedTimeInput.value = '';

    periods.forEach(period => {
      const windowLen = period.end - period.start;
      const fits = duration <= windowLen;
      const rangeLabel = `${formatTime(period.start)} – ${formatTime(period.end)}`;

      const chip = document.createElement('div');
      chip.className = 'time-chip' + (fits ? '' : ' disabled');

      if (fits) {
        const finishExample = formatTime(period.start + duration);
        chip.innerHTML = `<strong>${period.label}</strong>${rangeLabel}<small>Est. finish by ${finishExample}</small>`;
        chip.addEventListener('click', () => {
          document.querySelectorAll('.time-chip.selected').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedTimeInput.value = `${period.label} (${rangeLabel})`;
        });
      } else {
        chip.innerHTML = `<strong>${period.label}</strong>${rangeLabel}<small>Not enough time for this service</small>`;
      }

      timeSlotsEl.appendChild(chip);
    });

    timeSlotWrap.style.display = 'block';
  }

  prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
  nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });

  // Abrir/cerrar el popup del calendario
  dateTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = quoteCalendar.classList.toggle('open');
    dateTrigger.classList.toggle('open', isOpen);
  });

  // Cerrar al hacer click afuera
  document.addEventListener('click', (e) => {
    if (!quoteCalendar.contains(e.target) && e.target !== dateTrigger && !dateTrigger.contains(e.target)) {
      quoteCalendar.classList.remove('open');
      dateTrigger.classList.remove('open');
    }
  });

  // Exponer función de reset para usar desde buildModal()
  window.resetQuoteCalendar = function () {
    chosenDate = null;
    viewDate = new Date();
    viewDate.setDate(1);
    selectedDateInput.value = '';
    selectedTimeInput.value = '';
    timeSlotsEl.innerHTML = '';
    timeSlotWrap.style.display = 'none';
    dateTriggerLabel.textContent = 'Choose a date';
    dateTrigger.classList.remove('has-date');
    quoteCalendar.classList.remove('open');
    dateTrigger.classList.remove('open');
    renderCalendar();
  };

  renderCalendar();
})();