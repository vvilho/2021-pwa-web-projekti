/**
 * Functions for creating messages
 * @module modules/messages-functions
 * @author Ailip <ailip@metropolia.fi>
 *
 */
import MetropoliaMessages from "./messages-data";

let slideIndexMessages = 1;
let myTimerMessages;


/**
 *
 * @param {JSON} messageData - Loaded JSON of messages
 */
const renderMessages = (messageData) => {
  let dotId = 0;
  const messageDotsContainer = document.querySelector(".dots-messages");
  const messagesList = document.querySelector(".messages-list");
  messagesList.innerHTML = "";
  messageDotsContainer.innerHTML = "";
  for (const item of messageData) {
    const listItem = document.createElement("li");
    listItem.innerHTML = item;
    listItem.classList.add("messageSlides");
    messagesList.appendChild(listItem);

    //creates span (dot) element and adds id
    const setDivId = document.createAttribute("id");
    setDivId.value = dotId;
    const span = document.createElement("span");
    span.classList.add("mdot");
    span.setAttributeNode(setDivId);
    messageDotsContainer.append(span);
    dotId++;
  }
};

/**
 *
 * @param {string} languageSetting
 * @returns {Promise<void>}
 */
const loadMessages = async (languageSetting) => {
  try {
    let parsedMessages;
    parsedMessages = await MetropoliaMessages.getMessages(languageSetting);
    renderMessages(parsedMessages);
  } catch (error) {
    console.error(error);
  }
};


/**
 *
 * @param {string} languageSetting
 * @returns {Promise<void>}
 */
const showAllMessages = async (languageSetting) => {
  clearInterval(myTimerMessages);
  await loadMessages(languageSetting);
  showSlidesMessages(slideIndexMessages);

  //goes through all elements with class="dot" and gets current dot's id when cliked
  const AllDotsFromContainerMessages = document.querySelectorAll(".mdot");
  AllDotsFromContainerMessages.forEach((item) => {
    item.addEventListener("click", () => {
      let idToNumber = parseFloat(item.id);
      //changes slide to match with dot id
      currentSlideMessages(idToNumber);
    });
  });

  myTimerMessages = setInterval(function () {
    plusSlidesMessages(1);
  }, 5000);
};

/**
 * Clears timer for messagecarousel
 */
const pauseMessages = () => {
  clearInterval(myTimerMessages);
};

/**
 * Starts timer for messagecarousel
 */
const resumeMessages = () => {
  clearInterval(myTimerMessages);
  myTimerMessages = setInterval(() => {
    plusSlidesMessages(slideIndexMessages);
  }, 5000);
};

/**
 *
 *
 * @param {number } n - Message slide index
 */
const plusSlidesMessages = (n) => {
  clearInterval(myTimerMessages);
  if (n < 0) {
    showSlidesMessages((slideIndexMessages -= 1));
  } else {
    showSlidesMessages((slideIndexMessages += 1));
  }

  if (n === -1) {
    myTimerMessages = setInterval(() => {
      plusSlidesMessages(n + 2);
    }, 5000);
  } else {
    myTimerMessages = setInterval(() => {
      plusSlidesMessages(n + 1);
    }, 5000);
  }
};

/**
 *
 * @param {number} n - Message slide index
 */
const currentSlideMessages = (n) => {
  clearInterval(myTimerMessages);
  myTimerMessages = setInterval(() => {
    plusSlidesMessages(n + 1);
  }, 5000);
  plusSlidesMessages(slideIndexMessages = n);
};



/**
 * calculates which slide to show
 *
 * @param {Number} n
 */
const showSlidesMessages = (n) => {
  let i;
  let slides = document.getElementsByClassName("messageSlides");
  let dots = document.getElementsByClassName("mdot");
  if (n > slides.length) {
    slideIndexMessages = 1;
  }
  if (n < 1) {
    slideIndexMessages = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndexMessages - 1].style.display = "block";
  dots[slideIndexMessages - 1].className += " active";
};




const Messages = {
  showSlidesMessages,
  plusSlidesMessages,
  pauseMessages,
  showAllMessages,
  loadMessages,
  resumeMessages,
  slideIndexMessages
};

export default Messages;
