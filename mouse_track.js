const helperText = document.querySelector('.helper_text');
const track      = document.getElementById("image-track");
const blob       = document.getElementById("blob");
const images     = Array.from(track.getElementsByClassName('image'));

// ─── BLOB ────────────────────────────────────────────────────────────────────
const blobPos    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const blobTarget = { x: blobPos.x, y: blobPos.y };
const blobStart  = Date.now();

// ─── TRACK ───────────────────────────────────────────────────────────────────
// rAF lerp replaces WAAPI → smooth wheel scroll, single source of truth
let trackTarget = 0;
let trackCurr   = 0;
let trackActive = false;

// Hand off from CSS intro animation to JS after 5 s
setTimeout(() => {
    track.style.animation = 'none';
    trackActive = true;
}, 5000);

// ─── SINGLE TICK LOOP ────────────────────────────────────────────────────────
(function tick() {
    // blob
    const angle = ((Date.now() - blobStart) / 20000) * 360;
    blobPos.x  += (blobTarget.x - blobPos.x) * 0.06;
    blobPos.y  += (blobTarget.y - blobPos.y) * 0.06;
    blob.style.transform = `translate(${blobPos.x - 250}px, ${blobPos.y - 250}px) rotate(${angle}deg)`;

    // track
    if (trackActive) {
        trackCurr += (trackTarget - trackCurr) * 0.055;
        const p = Math.round(trackCurr * 100) / 100;
        track.style.transform = `translate(${p}%, -50%)`;
        for (const img of images) img.style.objectPosition = `${100 + p}% 50%`;
    }

    requestAnimationFrame(tick);
})();

// ─── POINTER DRAG ────────────────────────────────────────────────────────────
let isDown     = false;
let isDragging = false;
let dragStartX = 0;
let dragStartP = 0;

window.onpointerdown = e => {
    if (isOverlayOpen) return;          // let overlay handle its own events
    e.preventDefault();
    isDown     = true;
    isDragging = false;
    dragStartX = e.clientX;
    dragStartP = trackTarget;
    helperText.classList.add('hider');
};

window.onpointerup = e => {
    if (!isDown) return;
    const wasClick = !isDragging;
    isDown = false;
    if (wasClick) {
        const idx = images.indexOf(e.target);
        if (idx !== -1) openCard(idx);
    }
};

window.onpointercancel = () => { isDown = false; };

window.onpointermove = e => {
    blobTarget.x = e.clientX;
    blobTarget.y = e.clientY;
    if (!isDown) return;
    e.preventDefault();
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) > 5) isDragging = true;
    if (!isDragging) return;
    trackTarget = Math.max(Math.min(dragStartP + (delta / (window.innerWidth / 2)) * 100, 0), -100);
};

// ─── WHEEL SCROLL ────────────────────────────────────────────────────────────
window.addEventListener('wheel', e => {
    e.preventDefault();
    if (isOverlayOpen) return;
    trackTarget = Math.max(Math.min(trackTarget - e.deltaY * 0.055, 0), -100);
}, { passive: false });

// ─── CARD OVERLAY ────────────────────────────────────────────────────────────
let isOverlayOpen = false;
let cardIdx       = 0;

const overlay = document.createElement('div');
overlay.id = 'card-overlay';
overlay.innerHTML = `
    <button class="card-nav" id="card-prev">&#8249;</button>
    <div id="card-frame">
        <img id="card-img" draggable="false" />
        <div id="card-info">
            <span id="card-location"></span>
            <span id="card-counter"></span>
        </div>
        <button id="card-close">&#x2715;</button>
    </div>
    <button class="card-nav" id="card-next">&#8250;</button>
`;
document.body.appendChild(overlay);

function openCard(idx) {
    cardIdx = idx;
    isOverlayOpen = true;
    renderCard(true);
    overlay.classList.add('open');
    document.addEventListener('keydown', onCardKey);
}

function closeCard() {
    isOverlayOpen = false;
    overlay.classList.remove('open');
    document.removeEventListener('keydown', onCardKey);
}

function goCard(dir) {
    cardIdx = (cardIdx + dir + images.length) % images.length;
    renderCard(false);
}

function renderCard(instant) {
    const img     = images[cardIdx];
    const cardImg = document.getElementById('card-img');
    const hqSrc   = img.src.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=85');

    if (instant) {
        cardImg.style.opacity = '1';
        cardImg.src = hqSrc;
    } else {
        cardImg.style.opacity = '0';
        setTimeout(() => {
            cardImg.src    = hqSrc;
            cardImg.onload = () => { cardImg.style.opacity = '1'; };
        }, 180);
    }
    document.getElementById('card-location').textContent = img.dataset.location || '';
    document.getElementById('card-counter').textContent  = `${cardIdx + 1} / ${images.length}`;
}

overlay.addEventListener('click', e => { if (e.target === overlay) closeCard(); });
document.getElementById('card-close').addEventListener('click', closeCard);
document.getElementById('card-prev').addEventListener('click', () => goCard(-1));
document.getElementById('card-next').addEventListener('click', () => goCard(1));

function onCardKey(e) {
    if (e.key === 'Escape')     closeCard();
    if (e.key === 'ArrowLeft')  goCard(-1);
    if (e.key === 'ArrowRight') goCard(1);
}

// ─── HACKER TEXT SCRAMBLE ────────────────────────────────────────────────────
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let scrambleInterval = null;

function triggerScramble() {
    let iterations = 0;
    clearInterval(scrambleInterval);
    scrambleInterval = setInterval(() => {
        document.querySelector("h1").innerText = document
            .querySelector("h1").innerText.split("")
            .map((letter, index) => {
                if (index < iterations) return document.querySelector("h1").dataset.value[index];
                return letters[Math.floor(Math.random() * 26)];
            }).join("");
        if (iterations >= document.querySelector("h1").dataset.value.length) clearInterval(scrambleInterval);
        iterations += 1 / 5;
    }, 30);
}

(function scrambleLoop() {
    triggerScramble();
    setTimeout(scrambleLoop, 3500);
})();
