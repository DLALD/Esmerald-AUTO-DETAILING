// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

// Navbar shrink
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Active nav link — dot follows visible section
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        const matches = link.dataset.section === id ||
          (id === 'services' && link.dataset.section === 'services') ||
          (id === 'trash-service' && link.dataset.section === 'trash-service');
        link.classList.toggle('active', matches);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// Dropdown service links — open modal
document.querySelectorAll('.dropdown-menu a[data-service]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const serviceKey = link.dataset.service;
    if (serviceKey === 'trash') {
      const card = document.querySelector('.trash-main-card[data-service="trash"]');
      if (card) card.dispatchEvent(new Event('click', { bubbles: true }));
      return;
    }
    const card = document.querySelector(`.package-card[data-service="${serviceKey}"]`);
    if (card) card.click();
  });
});

// Package cards open modal
document.querySelectorAll('.package-card:not(.trash-main-card), .pkg-btn:not(.trash-pkg-btn)').forEach(el => {
  el.addEventListener('click', function(e) {
    const card = this.closest('.package-card') || this.parentElement;
    if (!card || !card.dataset.images) return;
    // Skip trash cards — handled by trash modal
    if (card.classList.contains('trash-main-card')) return;
    card.classList.remove('clicked');
    void card.offsetWidth;
    card.classList.add('clicked');
    setTimeout(() => card.classList.remove('clicked'), 600);
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
      card.dataset.duration,
      card.dataset.service
    );
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('quoteForm').dataset.service = card.dataset.service || '';
  });
});

// Trash main card — open modal (handled by trash modal, skip generic)
document.querySelectorAll('.trash-main-card').forEach(card => {
  // handled by trashModal listener below
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
  const activeDot = dots[current];
  activeDot.classList.remove('active');
  void activeDot.offsetWidth;
  activeDot.classList.add('active');
  updateText(index);
}

function next() { goTo((current + 1) % slides.length); }
function startAuto() { timer = setInterval(next, 5000); }

updateText(0);
startAuto();

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

function buildModal(images, title, desc, price, highlights, before, after, captions, duration, serviceKey) {
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

  if (window.resetQuoteCalendar) window.resetQuoteCalendar();

  // ─── ADD-ON TRASH: visible en basic/enhanced/davila, oculto en trash ───
  const trashAddonEl = document.getElementById('qTrashAddon');
  if (trashAddonEl) trashAddonEl.checked = false;
  const addonWrap = document.getElementById('trashAddonWrap');
  if (addonWrap) {
    addonWrap.style.display = (serviceKey === 'trash') ? 'none' : '';
  }
  // ────────────────────────────────────────────────────────────────────────

  document.getElementById('quoteForm').dataset.service = serviceKey || '';

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

  const baAfterEl  = document.getElementById('modalBAAfter');
  const baBeforeEl = document.getElementById('modalBABefore');
  const baDivModal = document.getElementById('modalBADivider');
  const baLabelL   = baSlider.querySelector('.ba-label.left');
  const baLabelR   = baSlider.querySelector('.ba-label.right');
  let baActive = false, baDragging = false;

  if (before && after) {
    baBtn.style.display = '';
    baAfterEl.style.backgroundImage  = `url('${after}')`;
    baBeforeEl.style.backgroundImage = `url('${before}')`;
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
  goModal(0);

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
  const cap = document.getElementById('modalCaption');
  const txt = mCaptions[index] || '';
  cap.innerHTML = txt ? `<span>${txt}</span>` : '';
}

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

document.getElementById('modalBookBtn').addEventListener('click', () => {
  document.querySelector('.modal-info').style.display = 'none';
  document.getElementById('modalForm').classList.add('active');
  if (modalFooter) modalFooter.style.display = 'none';
});

document.getElementById('formBack').addEventListener('click', () => {
  document.getElementById('modalForm').classList.remove('active');
  document.querySelector('.modal-info').style.display = '';
  if (modalFooter) modalFooter.style.display = '';
});

// Submit form
document.getElementById('quoteForm').addEventListener('submit', e => {
  e.preventDefault();

  const dateVal = document.getElementById('selectedDate').value;
  const timeVal = document.getElementById('selectedTime').value;

  if (!dateVal) {
    alert('Please select a date for your service.');
    document.getElementById('dateTrigger').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!timeVal) {
    alert('Please select a preferred time.');
    document.getElementById('timeSlotWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const service    = modalTitle.textContent;
  const name       = document.getElementById('qName').value;
  const phone      = document.getElementById('qPhone').value;
  const car        = document.getElementById('qCar').value;
  const year       = document.getElementById('qYear').value;
  const date       = document.getElementById('selectedDate').value || '';
  const time       = document.getElementById('selectedTime').value || 'Flexible';
  const notes      = document.getElementById('qNotes').value;
  const serviceKey = document.getElementById('quoteForm').dataset.service || '';
  const trashAddon = document.getElementById('qTrashAddon').checked;

  // Add-on solo aplica si NO es el servicio de trash
  let addonLine = '';
  if (serviceKey !== 'trash' && trashAddon) {
    addonLine = '\nAdd-on: Trash Can Cleaning (+$20)';
  }

  const msg = `Hi Davila's Auto Detailing! I'd like to request a quote:

Service: ${service}${addonLine}
Name: ${name}
Phone: ${phone}
Car: ${year} ${car}
Preferred Date: ${date}
Preferred Time: ${time}${notes ? '\nNotes: ' + notes : ''}`;

  document.getElementById('copyBox').value = msg;
  document.getElementById('quoteForm').style.display = 'none';
  document.getElementById('formCopy').classList.add('active');

  const smsBtnBoth = document.getElementById('smsBtnBoth');
  smsBtnBoth.href = 'sms:+19203787005?body=' + encodeURIComponent(msg);
  smsBtnBoth.addEventListener('click', function(e) {
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
  const FESTIVOS = [];

  const calendarEl        = document.getElementById('qcDays');
  const monthLabel        = document.getElementById('qcMonthLabel');
  const prevBtn           = document.getElementById('qcPrev');
  const nextBtn           = document.getElementById('qcNext');
  const selectedDateInput = document.getElementById('selectedDate');
  const timeSlotWrap      = document.getElementById('timeSlotWrap');
  const timeSlotsEl       = document.getElementById('timeSlots');
  const selectedTimeInput = document.getElementById('selectedTime');
  const dateTrigger       = document.getElementById('dateTrigger');
  const dateTriggerLabel  = document.getElementById('dateTriggerLabel');
  const quoteCalendar     = document.getElementById('quoteCalendar');

  if (!calendarEl) return;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let viewDate = new Date();
  viewDate.setDate(1);
  let chosenDate = null;

  const isFestivo = (dateStr) => FESTIVOS.includes(dateStr);
  const isSunday  = (date) => date.getDay() === 0;

  function fmt(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function renderCalendar() {
    calendarEl.innerHTML = '';
    monthLabel.textContent = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

    const firstDay    = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const today       = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'qc-day empty';
      calendarEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const dateStr  = fmt(thisDate);
      const btn      = document.createElement('div');
      btn.className  = 'qc-day';
      btn.textContent = d;

      const past   = thisDate < today;
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
    const dateStr  = fmt(date);
    const day      = date.getDay();
    const festivo  = isFestivo(dateStr);
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
      const starts = [];
      for (let t = period.start; t + duration <= period.end; t += 60) {
        starts.push(t);
      }

      const group = document.createElement('div');
      group.className = 'time-period-group';

      const groupLabel = document.createElement('div');
      groupLabel.className = 'time-period-label';
      groupLabel.textContent = `${period.label} (${formatTime(period.start)} – ${formatTime(period.end)})`;
      group.appendChild(groupLabel);

      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'time-options';

      if (starts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'time-chip disabled';
        empty.innerHTML = `<small>Not enough time for this service in this window</small>`;
        optionsWrap.appendChild(empty);
      } else {
        starts.forEach(start => {
          const end  = start + duration;
          const chip = document.createElement('div');
          chip.className = 'time-chip';
          chip.innerHTML = `<strong>Start at ${formatTime(start)}</strong>Ends approx. ${formatTime(end)}`;
          chip.addEventListener('click', () => {
            document.querySelectorAll('.time-chip.selected').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedTimeInput.value = `${period.label} — Start ${formatTime(start)} (ends approx. ${formatTime(end)}, subject to confirmation)`;
          });
          optionsWrap.appendChild(chip);
        });
      }

      group.appendChild(optionsWrap);
      timeSlotsEl.appendChild(group);
    });

    timeSlotWrap.style.display = 'block';
  }

  prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
  nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });

  dateTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = quoteCalendar.classList.toggle('open');
    dateTrigger.classList.toggle('open', isOpen);
    if (isOpen && window.innerWidth <= 768) {
      setTimeout(() => quoteCalendar.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  });

  document.addEventListener('click', (e) => {
    if (!quoteCalendar.contains(e.target) && e.target !== dateTrigger && !dateTrigger.contains(e.target)) {
      quoteCalendar.classList.remove('open');
      dateTrigger.classList.remove('open');
    }
  });

  window.resetQuoteCalendar = function () {
    chosenDate = null;
    viewDate   = new Date();
    viewDate.setDate(1);
    selectedDateInput.value = '';
    selectedTimeInput.value = '';
    timeSlotsEl.innerHTML   = '';
    timeSlotWrap.style.display = 'none';
    dateTriggerLabel.textContent = 'Choose a date';
    dateTrigger.classList.remove('has-date');
    quoteCalendar.classList.remove('open');
    dateTrigger.classList.remove('open');
    renderCalendar();
  };

  renderCalendar();
})();

// ===== TRASH MODAL ESPECIAL =====
(function () {
  const trashModal    = document.getElementById('trashModal');
  const trashModalBox = document.getElementById('trashModalBox');
  const trashClose    = document.getElementById('trashModalClose');
  const trashInfo     = trashModal.querySelector('.modal-info');
  const trashFooter   = trashModal.querySelector('.modal-footer');
  const trashForm     = document.getElementById('trashModalForm');
  const trashCopy     = document.getElementById('tqFormCopy');

  // Slider images
  const trashImages = ['Our services/trash clean/1.jpeg', 'Our services/trash clean/2.jpeg'];
  const slidesEl    = document.getElementById('trashModalSlides');
  const dotsEl      = document.getElementById('trashModalDots');
  let tCurrent = 0, tTimer = null;

  function buildTrashSlider() {
    slidesEl.innerHTML = '';
    dotsEl.innerHTML   = '';
    trashImages.forEach((src, i) => {
      const s = document.createElement('div');
      s.className = 'modal-slide';
      s.style.backgroundImage = `url('${src}')`;
      slidesEl.appendChild(s);
      const d = document.createElement('span');
      d.className = 'modal-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTrash(i));
      dotsEl.appendChild(d);
    });
    slidesEl.style.transform = 'translateX(0)';
    tCurrent = 0;
    clearInterval(tTimer);
    tTimer = setInterval(() => goTrash((tCurrent + 1) % trashImages.length), 4000);
  }

  function goTrash(i) {
    tCurrent = i;
    slidesEl.style.transition = 'transform 0.5s cubic-bezier(0.77,0,0.18,1)';
    slidesEl.style.transform  = `translateX(-${i * 100}%)`;
    dotsEl.querySelectorAll('.modal-dot').forEach((d, j) => d.classList.toggle('active', j === i));
  }

  document.getElementById('trashModalPrev').addEventListener('click', () => goTrash((tCurrent - 1 + trashImages.length) % trashImages.length));
  document.getElementById('trashModalNext').addEventListener('click', () => goTrash((tCurrent + 1) % trashImages.length));

  function openTrashModal(originEl) {
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      const ox = ((rect.left + rect.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
      const oy = ((rect.top + rect.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
      trashModalBox.style.setProperty('--origin-x', ox);
      trashModalBox.style.setProperty('--origin-y', oy);
    }
    buildTrashSlider();
    // reset to info view
    trashInfo.style.display  = '';
    trashFooter.style.display = '';
    trashForm.classList.remove('active');
    trashCopy.classList.remove('active');
    document.getElementById('trashQuoteForm').style.display = '';
    trashModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTrashModal() {
    trashModal.classList.remove('open');
    document.body.style.overflow = '';
    clearInterval(tTimer);
    trashInfo.style.display  = '';
    trashFooter.style.display = '';
    trashForm.classList.remove('active');
    trashCopy.classList.remove('active');
    const formEl = document.getElementById('trashQuoteForm');
    if (formEl) { formEl.style.display = ''; formEl.reset(); }
    const dateInput = document.getElementById('tqSelectedDate');
    const dateLabel = document.getElementById('tqDateLabel');
    const dateTrig  = document.getElementById('tqDateTrigger');
    const cal       = document.getElementById('tqCalendar');
    if (dateInput) dateInput.value = '';
    if (dateLabel) dateLabel.textContent = 'Choose a date';
    if (dateTrig)  dateTrig.classList.remove('has-date', 'open');
    if (cal)       cal.classList.remove('open');
  }

  trashClose.addEventListener('click', closeTrashModal);
  trashModal.addEventListener('click', e => { if (e.target === trashModal) closeTrashModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && trashModal.classList.contains('open')) closeTrashModal(); });

  // Book button shows form
  document.getElementById('trashModalBookBtn').addEventListener('click', () => {
    trashInfo.style.display   = 'none';
    trashFooter.style.display = 'none';
    trashForm.classList.add('active');
  });

  // Back button
  document.getElementById('trashFormBack').addEventListener('click', () => {
    trashForm.classList.remove('active');
    trashInfo.style.display   = '';
    trashFooter.style.display = '';
  });

  // Open on card/btn click
  document.querySelectorAll('.trash-main-card, .trash-pkg-btn').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      openTrashModal(this.closest('.trash-main-card') || this);
    });
  });

  // Calendario
  const calEl      = document.getElementById('tqDays');
  const monthLbl   = document.getElementById('tqMonthLabel');
  const prevBtn    = document.getElementById('tqPrev');
  const nextBtn    = document.getElementById('tqNext');
  const trigger    = document.getElementById('tqDateTrigger');
  const trigLbl    = document.getElementById('tqDateLabel');
  const calendar   = document.getElementById('tqCalendar');
  const hiddenDate = document.getElementById('tqSelectedDate');
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let view = new Date(); view.setDate(1);

  function fmtD(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

  function renderCal() {
    calEl.innerHTML = '';
    monthLbl.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const days  = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < first.getDay(); i++) {
      const e = document.createElement('div'); e.className = 'qc-day empty'; calEl.appendChild(e);
    }
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const btn  = document.createElement('div');
      btn.className = 'qc-day';
      btn.textContent = d;
      if (date < today || date.getDay() === 0) {
        btn.classList.add('disabled');
      } else {
        btn.addEventListener('click', () => {
          calEl.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'));
          btn.classList.add('selected');
          hiddenDate.value = fmtD(date);
          trigLbl.textContent = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
          trigger.classList.add('has-date');
          calendar.classList.remove('open');
          trigger.classList.remove('open');
        });
      }
      if (fmtD(date) === fmtD(today)) btn.classList.add('today');
      calEl.appendChild(btn);
    }
  }

  prevBtn.addEventListener('click', () => { view.setMonth(view.getMonth()-1); renderCal(); });
  nextBtn.addEventListener('click', () => { view.setMonth(view.getMonth()+1); renderCal(); });
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const open = calendar.classList.toggle('open');
    trigger.classList.toggle('open', open);
  });
  document.addEventListener('click', e => {
    if (!calendar.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
      calendar.classList.remove('open');
      trigger.classList.remove('open');
    }
  });
  renderCal();

  // Submit
  document.getElementById('trashQuoteForm').addEventListener('submit', e => {
    e.preventDefault();
    const date = hiddenDate.value;
    if (!date) { alert('Please select a date.'); return; }
    const name    = document.getElementById('tqName').value;
    const phone   = document.getElementById('tqPhone').value;
    const address = document.getElementById('tqAddress').value;
    const notes   = document.getElementById('tqNotes').value;
    const msg = `Hi Davila's Auto Detailing! I'd like to book Trash Can Cleaning:\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nPreferred Date: ${date}${notes ? '\nNotes: '+notes : ''}\nService: Trash Can Cleaning - $20/bin`;
    document.getElementById('tqCopyBox').value = msg;
    document.getElementById('trashQuoteForm').style.display = 'none';
    trashCopy.classList.add('active');
    document.getElementById('tqSmsBtn').href = 'sms:+19203787005?body=' + encodeURIComponent(msg);
  });

  // Copy
  document.getElementById('tqCopyBtn').addEventListener('click', () => {
    const box = document.getElementById('tqCopyBox');
    box.select();
    navigator.clipboard.writeText(box.value).catch(() => document.execCommand('copy'));
    const btn = document.getElementById('tqCopyBtn');
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2500);
  });
})();
