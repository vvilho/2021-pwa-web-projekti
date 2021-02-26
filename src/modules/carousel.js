const koronaSlidesContainer = document.querySelector(".slideshow-container");
const allDotsContainer = document.querySelector(".all-dots");
let dot = 1;
let slideIndex = 1;
let myTimer;

//creates list of img elemements
for (let nro = 1; nro < 26; nro++) {
  if (nro < 10) {
    nro = "0" + nro;
  }
  let filePath = `./assets/koronaInfoJPG/koronaInfoJPG.0${nro}.jpeg`;
  const img = document.createElement("img");
  img.src = filePath;
  img.alt = "koronainfo slide";
  img.classList.add(dot);
  img.classList.add("mySlides");
  img.style.width = "100%";
  koronaSlidesContainer.appendChild(img);

  //creates span (dot) element and adds id
  const setDivId = document.createAttribute("id");
  setDivId.value = dot;
  const span = document.createElement("span");
  span.classList.add("dot");
  span.setAttributeNode(setDivId);
  allDotsContainer.append(span);
  dot++;
}

//goes through all elements with class="dot" and gets current dot's id when cliked
const AllDotsFromContainer = document.querySelectorAll(".dot");
AllDotsFromContainer.forEach((item) => {
  item.addEventListener("click", () => {
    let idToNumber = parseFloat(item.id);
    //changes slide to match with dot id
    currentSlide(idToNumber);
  });
});

/**
 * pauses timer
 */
const pause = () => {
  clearInterval(myTimer);
};

/**
 * resumes timer
 */
const resume = () => {
  clearInterval(myTimer);
  myTimer = setInterval(() => {
    plusSlides(slideIndex);
  }, 5000);
};

//loads slides and timer
window.addEventListener("load", () => {
  showSlides(slideIndex);
  myTimer = setInterval(function () {
    plusSlides(1);
  }, 5000);

  koronaSlidesContainer.addEventListener("mouseenter", () => {
    pause();
  });
  koronaSlidesContainer.addEventListener("mouseleave", () => {
    resume();
  });
});

/**
 * next and previous slides
 *
 * @param {Number} n
 */
const plusSlides = (n) => {
  clearInterval(myTimer);
  if (n < 0) {
    showSlides((slideIndex -= 1));
  } else {
    showSlides((slideIndex += 1));
  }

  if (n === -1) {
    myTimer = setInterval(() => {
      plusSlides(n + 2);
    }, 5000);
  } else {
    myTimer = setInterval(() => {
      plusSlides(n + 1);
    }, 5000);
  }
};

/**
 * gets current slide to show
 *
 * @param {Number} n
 */
function currentSlide(n) {
  clearInterval(myTimer);
  myTimer = setInterval(() => {
    plusSlides(n + 1);
  }, 5000);
  showSlides((slideIndex = n));
}

//event listener for right button
const btnPlus = document.querySelector("#btn-slide-right");
btnPlus.addEventListener("click", () => {
  plusSlides(1);
  pause();
});

//event listener for left button
const btnMinus = document.querySelector("#btn-slide-left");
btnMinus.addEventListener("click", () => {
  plusSlides(-1);
  pause();
});

/**
 * calculates which slide to show
 *
 * @param {Number} n
 */
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  //console.log("n: ", n, " slideinex: ", slideIndex);
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}




let touchstartX = 0;
let touchendX = 0;

const slider = document.querySelector('.slideshow-container');

function handleGesture() {
  if (touchendX < touchstartX){
    plusSlides(1);
    pause();
  }
  if (touchendX > touchstartX) {
    plusSlides(-1);
    pause();
  }
}

slider.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
});

slider.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  handleGesture();
});
