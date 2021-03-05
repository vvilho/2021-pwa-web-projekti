import SodexoData from "./modules/sodexo-data";
import FazerData from "./modules/fazer-data";
import { setModalControls } from "./modules/modal";
import "./styles/style.scss";
import "./styles/mobile.scss";
import "./styles/widescreen.scss";
import HSLData from "./modules/hsl-data";
import LanguageData from "./data/language.json";
import CampusData from "./data/campuses.json";
import WeatherData from "./modules/weather-data";
import "./modules/carousel";
import MetropoliaMessages from "./modules/messages-data";

const today = new Date().toISOString().split("T")[0];
const fiToday = today.split(/\D/g);
let languageSetting = "fi";
let campus = document.querySelector("#campuses").value;

const messageSlidesContainer = document.querySelector(".metrolopia-messages");
let slideIndexMessages = 1;
let myTimerMessages;

/**
 * All classes of those DOM object that has text that has to cahnge
 * When language setting is changed
 *
 * @each {string[]} list of classnames
 */

const languagDomClasses = [
  "campuses",
  "hslroute",
  "timetable",
  "menu",
  "dishlabels",
  "coronaInfo",
  "contact",
  "schoolName",
  "visitingAddress",
  "postalAddress",
  "phone",
];

/**
 * Loads menudata for current campus' restaurant
 *
 * @async
 */
const loadAllMenuData = async () => {
  try {
    let parsedMenu;
    document.querySelector(".res-heading").textContent =
      CampusData[campus]["restaurantname"];
    if (CampusData[campus]["restauranttype"] === "FazerData") {
      parsedMenu = await FazerData.getDailyMenu(
        CampusData[campus]["foodmenuid"],
        languageSetting,
        today
      );
    } else {
      parsedMenu = await SodexoData.getDailyMenu(
        CampusData[campus]["foodmenuid"],
        languageSetting,
        today
      );
    }
    renderMenu(parsedMenu, CampusData[campus]["displayname"]);
  } catch (error) {
    console.error(error);
    // notify user if errors with data
    renderNoDataNotification(
      "No data available..",
      CampusData[campus]["displayname"]
    );
  }
};

/**
 * Displays lunch menu items as html list
 *
 * @param {Array} menuData - Lunch menu array
 */
const renderMenu = (menuData) => {
  const restaurantDiv = document.querySelector(".dishes");
  restaurantDiv.innerHTML = "";
  const ul = document.createElement("ul");
  for (const item of menuData) {
    const listItem = document.createElement("li");
    listItem.innerHTML = item;
    ul.appendChild(listItem);
  }
  restaurantDiv.appendChild(ul);
};

/**
 * Displays a notification message instead of dishes
 * when menu data is not available
 *
 * @param {string} message -Error message
 */
const renderNoDataNotification = (message) => {
  const restaurantDiv = document.querySelector(".dishes");
  restaurantDiv.innerHTML = `<p>${message}</p>`;
  document.querySelector(".dishes-labels").textContent = "";
};

/**
 * Changes every elements text that has to change during language change
 *
 * @param {string} language -language shortname ("fi"/"en")
 */
const createUiLanguages = (language) => {
  try {
    for (const dom of languagDomClasses) {
      document.querySelector(".app-lang-" + dom).innerHTML =
        LanguageData[dom][language];
    }
  } catch (e) {
    console.log("Error in createUiLanguages: ", e);
  }
};

/**
 * Switches application language between en/fi
 * and updates menu data
 */
const switchLanguage = () => {
  if (languageSetting === "fi") {
    languageSetting = "en";
    createUiLanguages(languageSetting);
    localStorage.setItem("Lang", languageSetting);
  } else {
    languageSetting = "fi";
    createUiLanguages(languageSetting);
    localStorage.setItem("Lang", languageSetting);
  }
  console.log("language changed to: ", languageSetting);
  loadAllMenuData();
  changeCampusName();
  loadMessages();
  showSlidesMessages(slideIndexMessages);
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  showAllMessages(languageSetting);
};

/**
 *
 * @param {number} id -Transportation vehicle id
 * @returns {string} -Icon/image of vehicle
 */
const transportationVehicleIcon = (id) => {
  let vehicle;
  if (id == 0) {
    vehicle = "tram";
  } else if (id == 1) {
    vehicle = "subway";
  } else if (id == 109) {
    vehicle = "train";
  } else if (id == 3) {
    vehicle = "bus";
  }
  return `<img class="hsl-icon filter-white" src="./assets/icons/${vehicle}.svg" alt="">`;
};

const changeBackgroundImage = () => {
  document.querySelector("#hero").style["background"] =
    "url('./assets/img/" +
    campus +
    "-kampus-big.jpg') no-repeat center center/cover";
};

/**
 *
 * @param {number} stopid -Id for current bus stop etc.
 * @async
 */
const loadHSLData = async (stopid) => {
  try {
    let list = [];
    for (const i of stopid) {
      const result = await HSLData.getRidesByStopId(i["id"]);
      const stop = result.data.stop;

      for (const ride of stop.stoptimesWithoutPatterns) {
        list.push({
          data:
            transportationVehicleIcon(stop.vehicleType) +
            ride.trip.routeShortName,
          where: ride.trip.tripHeadsign,
          time: HSLData.formatTime(ride.scheduledDeparture),
          timestamp: ride.scheduledDeparture,
        });
      }
    }
    list.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    renderHSLData(list);
  } catch (error) {
    renderHSLData([]);
    console.log(error);
  }
};
/**
 * Render HSL transportation data on website
 *
 *
 * @param {array} list - List of coming HSL transportation
 */
const renderHSLData = async (list) => {
  const stopElement = document.querySelector(".hsl-container");
  stopElement.textContent = "";

  for (const ride of await list) {
    const ulElement = document.createElement("ul");
    ulElement.classList.add("hsl-row");
    const hslLable = document.createElement("li");
    const hslStopName = document.createElement("li");
    const hslTime = document.createElement("li");
    hslLable.innerHTML = ride.data;
    hslLable.classList.add("hsl-label");
    hslStopName.innerHTML = ride.where;
    hslStopName.classList.add("hsl-stop-name");
    hslTime.innerHTML = ride.time;
    hslTime.classList.add("hsl-time");
    ulElement.appendChild(hslLable);
    ulElement.appendChild(hslStopName);
    ulElement.appendChild(hslTime);
    stopElement.appendChild(ulElement);
  }

  if (list.length == 0) {
    stopElement.textContent = "HSL data can not be loaded";
    return;
  }
};
/**
 * After campus is changed from select menu
 * HSL, weather and restaurant menu are updated
 * and new campus is saved to local storage
 */
const forEachCampus = () => {
  campus = document.querySelector("#campuses").value;
  loadHSLData(CampusData[campus]["hslstopid"]);
  localStorage.setItem("Campus", campus);
  loadAllMenuData();
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  changeBackgroundImage();
  changeCampusName();
  campusContactInfo();
};

const campusContactInfo = () => {
  const data = CampusData[campus];
  //const schoolName = document.querySelector(".schoolName");
  const visitingAddress = document.querySelector(".visitingAddress");
  const postalAddress = document.querySelector(".postalAddress");
  const phone = document.querySelector(".phone");

  //schoolName.innerHTML = languageSetting == "fi" ? data["displayname_fi"] : data["displayname_en"];
  visitingAddress.innerHTML = data["visitingaddress"];
  postalAddress.innerHTML = data["postaladdress"];
  phone.innerHTML = data["phonenumber"];
};

/**
 * Changes campus' name
 *
 */
const changeCampusName = () => {
  const currentCampus = document.querySelector(".current-campus");
  const data = CampusData[campus];
  currentCampus.textContent =
    languageSetting == "fi" ? data["displayname_fi"] : data["displayname_en"];
};

/**
 * Runs when app is first onened
 *
 */
const campusInit = () => {
  if (localStorage.getItem("Campus") == null) {
    localStorage.setItem("Campus", campus);
  }
  if (localStorage.getItem("Lang") == null) {
    localStorage.setItem("Lang", languageSetting);
  }
  languageSetting = localStorage.getItem("Lang");
  campus = localStorage.getItem("Campus");
  document.querySelector(
    '#campuses option[value="' + campus + '"]'
  ).selected = true;
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  createUiLanguages(languageSetting);
  loadAllMenuData();
  loadHSLData(CampusData[campus]["hslstopid"]);
  changeCampusName();
  changeBackgroundImage();
  campusContactInfo();

  if (languageSetting == "en") {
    document.querySelector("#togBtn").checked = true;
  }
};

/**
 * Displays Weather data from openweathermap.org API
 *
 * @param {String} campus
 * @param {String} language
 */
const loadWeatherData = async (campus, language) => {
  let name = document.querySelector(".name");
  let weatherIcon = document.querySelector(".weather-icon");
  let desc = document.querySelector(".desc");
  let temp = document.querySelector(".temp");

  const result = await WeatherData.getWeatherData(campus, language);
  let nameValue = result.name;
  let weatherIconValue = result.weather[0].icon;
  let tempValue = result.main.temp;
  let descValue = result.weather[0].description;

  name.innerHTML = nameValue;
  weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherIconValue}.png">`;
  desc.innerHTML = descValue;
  temp.innerHTML = `${tempValue.toFixed(1)} &deg;C`;
  // desc.innerHTML = descValue;
};

//////////////////////////////////////////////////////////////////////////////////////
//message-data and slides
//renders Message-data
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

const loadMessages = async (languageSetting) => {
  try {
    let parsedMessages;
    parsedMessages = await MetropoliaMessages.getMessages(languageSetting);
    renderMessages(parsedMessages);
  } catch (error) {
    console.error(error);
  }
};

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

const pauseMessages = () => {
  clearInterval(myTimerMessages);
};

const resumeMessages = () => {
  clearInterval(myTimerMessages);
  myTimerMessages = setInterval(() => {
    plusSlidesMessages(slideIndexMessages);
  }, 5000);
};

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

const currentSlideMessages = (n) => {
  clearInterval(myTimerMessages);
  myTimerMessages = setInterval(() => {
    plusSlidesMessages(n + 1);
  }, 5000);
  plusSlidesMessages(slideIndexMessages = n);
};

//event listener for right button
const btnPlusM = document.querySelector("#btn-message-right");
btnPlusM.addEventListener("click", () => {
  plusSlidesMessages(1);
  pauseMessages();
});

//event listener for left button
const btnMinusM = document.querySelector("#btn-message-left");
btnMinusM.addEventListener("click", () => {
  plusSlidesMessages(-1);
  pauseMessages();
});

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
  //console.log("n: ", n, " slideinex: ", slideIndex);
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

messageSlidesContainer.addEventListener("mouseenter", () => {
  pauseMessages();
});
messageSlidesContainer.addEventListener("mouseleave", () => {
  resumeMessages();
});
/**
 * Updates info every minute
 *
 * @constructor
 */
const everyMinute = () => {
  setInterval(async () => {
    await loadHSLData(CampusData[campus]["hslstopid"]);
    await loadAllMenuData();
    await loadWeatherData(CampusData[campus]["location"], languageSetting);
  }, 60000);
};

/**
 * Registers the service worker (SW) generated by Workbox
 */
const registerServiceWorkers = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
};

/**
 * App initialization
 */
const init = () => {
  campusInit();
  document.querySelector("#togBtn").addEventListener("click", switchLanguage);
  document.querySelector("#campuses").addEventListener("change", forEachCampus);
  document.querySelector(".res-date").textContent = [
    fiToday[2],
    fiToday[1],
    fiToday[0],
  ].join(".");
  everyMinute();
  showAllMessages("fi");

  //
  // setModalControls();

  // Service workers registeration below disabled temporarily for easier local development
  // must be uncommented from init() before building for "production"
  registerServiceWorkers();
};
init();
