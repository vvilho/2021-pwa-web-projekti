const koronaSlidesContainerModal = document.querySelector(".slideshow-container-modal");
const allDotsContainerModal = document.querySelector(".all-dots-modal");
let dotModal = 1;
let slideIndexModal = 1;

//creates list of img elemements
for (let nro = 1; nro < 26; nro++) {
  if (nro < 10) {
    nro = "0" + nro;
  }
  let filePath = `./assets/koronaInfoJPG/koronaInfoJPG.0${nro}.jpeg`;
  const img = document.createElement("img");
  img.src = filePath;
  img.alt = "koronainfo slide";
  img.classList.add(dotModal);
  img.classList.add("mySlidesModal");
  img.style.width = "100%";
  koronaSlidesContainerModal.appendChild(img);

  //creates span (dot) element and adds id
  const setDivId = document.createAttribute("id");
  setDivId.value = dotModal;
  const span = document.createElement("span");
  span.classList.add("dotModal");
  span.setAttributeNode(setDivId);
  allDotsContainerModal.append(span);
  dotModal++;
}

//goes through all elements with class="dot" and gets current dot's id when cliked
const dotsFromContainerModal = document.querySelectorAll(".dotModal");
dotsFromContainerModal.forEach((item) => {
  item.addEventListener("click", () => {
    let idToNumber = parseFloat(item.id);
    //changes slide to match with dot id
    currentSlideModal(idToNumber);
  });
});

//loads slides and timer
window.addEventListener("load", () => {
  showSlidesModal(slideIndexModal);
});

/**
 * next and previous slides
 *
 * @param {Number} n
 */
const plusSlidesModal = (n) => {
  if (n < 0) {
    showSlidesModal(slideIndexModal -= 1);
  } else {
    showSlidesModal(slideIndexModal += 1);
  }
};

/**
 * gets current slide to show
 *
 * @param {Number} n
 */
function currentSlideModal(n) {
  showSlidesModal((slideIndexModal = n));
}

//event listener for right button
const btnPlusModal = document.querySelector("#btn-slide-right-modal");
btnPlusModal.addEventListener("click", () => {
  plusSlidesModal(1);
});

//event listener for left button
const btnMinusModal = document.querySelector("#btn-slide-left-modal");
btnMinusModal.addEventListener("click", () => {
  plusSlidesModal(-1);
});

/**
 * calculates which slide to show
 *
 * @param {Number} n
 */
function showSlidesModal(n) {
  let i;
  let slides = document.getElementsByClassName("mySlidesModal");
  let dots = document.getElementsByClassName("dotModal");
  if (n > slides.length) {
    slideIndexModal = 1;
  }
  //console.log("n: ", n, " slideinex: ", slideIndexModal);
  if (n < 1) {
    slideIndexModal = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndexModal - 1].style.display = "block";
  dots[slideIndexModal - 1].className += " active";
}

