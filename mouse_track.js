const helperText = document.querySelector('.helper_text');
let isMouseDown = false; // Keep track of mouse button state

// Add a mousedown event listener to the document
document.addEventListener('mousedown', (event) => {
    isMouseDown = true; // Set mouse button state to pressed down
});

// Add a mousemove event listener to the document
document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        // Add the "hider" class to hide the helper text
        helperText.classList.add('hider');
    }
});


const track = document.getElementById("image-track");

const maxDelta = window.innerWidth / 2;

window.onmousedown = e => {
    track.dataset.mouseDownAt = e.clientX;

}

window.onmouseup = () => {
    track.dataset.mouseDownAt = "0"
    track.dataset.prevPercentage = track.dataset.percentage;
}

window.onmousemove = e => {
    if(track.dataset.mouseDownAt === "0")return;


    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
          maxDelta = window.innerWidth / 2;
        
    const parcentage =(mouseDelta / maxDelta) * -100,
    nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + parcentage,
    nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    track.dataset.percentage = nextPercentage;

    track.style.transform = `translate(${nextPercentage}%, -50%)`;

    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
      }, { duration: 1200, fill: "forwards" });
      
      for(const image of track.getElementsByClassName("image")) {
        image.animate({
          objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
      }
}

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

const blob = document.getElementById("blob");

window.onpointermove = event => { 
  const { clientX, clientY } = event;
  
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}


