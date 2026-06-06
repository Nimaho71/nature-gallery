const helperText = document.querySelector('.helper_text');
const track = document.getElementById("image-track");
const blob  = document.getElementById("blob");

// ---- BLOB: smooth lerp via rAF ----
// blob is position:fixed left:0 top:0 → JS drives it entirely via transform
const blobPos    = { x: window.innerWidth / 2,  y: window.innerHeight / 2 };
const blobTarget = { x: blobPos.x, y: blobPos.y };
const blobStart  = Date.now();

(function tickBlob() {
    const angle = ((Date.now() - blobStart) / 20000) * 360; // 20s per full rotation
    blobPos.x += (blobTarget.x - blobPos.x) * 0.06;
    blobPos.y += (blobTarget.y - blobPos.y) * 0.06;
    // rotate() in the same transform property → consistent across all browsers
    blob.style.transform = `translate(${blobPos.x - 250}px, ${blobPos.y - 250}px) rotate(${angle}deg)`;
    requestAnimationFrame(tickBlob);
})();

// ---- SLIDER: pointer events work on mouse, touch, and stylus ----
window.onpointerdown = e => {
    e.preventDefault();
    track.dataset.mouseDownAt = e.clientX;
    helperText.classList.add('hider');
};

// onpointercancel covers Safari cancelling the gesture mid-drag
window.onpointerup = window.onpointercancel = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
};

window.onpointermove = e => {
    blobTarget.x = e.clientX;
    blobTarget.y = e.clientY;

    if (track.dataset.mouseDownAt === "0") return;

    e.preventDefault(); // prevent Safari hijacking mid-drag

    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta   = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
    }, { duration: 1200, fill: "forwards", easing: "ease-out" });

    for (const image of track.getElementsByClassName("image")) {
        image.animate({
            objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards", easing: "ease-out" });
    }
};

// ---- HACKER TEXT SCRAMBLE ----
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let interval = null;

function triggerEvent() {
    let iterations = 0;
    clearInterval(interval);

    interval = setInterval(() => {
        document.querySelector("h1").innerText = document
            .querySelector("h1")
            .innerText.split("")
            .map((letter, index) => {
                if (index < iterations) {
                    return document.querySelector("h1").dataset.value[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");

        if (iterations >= document.querySelector("h1").dataset.value.length) {
            clearInterval(interval);
        }
        iterations += 1 / 5;
    }, 30);
}

function loopEvent() {
    triggerEvent();
    setTimeout(loopEvent, 3500);
}

loopEvent();
