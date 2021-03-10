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
import Messages from "./modules/messages-functions";
import "./modules/carousel";
import "./modules/carousel-modal";

const today = new Date().toISOString().split("T")[0];
const fiToday = today.split(/\D/g);
let languageSetting = "fi";
let campus = document.querySelector("#campuses").value;
let kampusPictureSize = '';


const messageSlidesContainer = document.querySelector(".metropolia-messages");

//////////////////////////////////////////////Language//////////////////////////////////////////
/**
 * All classes of those DOM objects that has text that has to change
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
  Messages.pauseMessages();
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
  Messages.resumeMessages();
  changeCampusName();
  Messages.loadMessages();
  Messages.showSlidesMessages(Messages.slideIndexMessages);
  loadWeatherData(CampusData[campus]["location"], languageSetting);
  Messages.showAllMessages(languageSetting);
};



//////////////////////////////////////////////Menu//////////////////////////////////////////

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
    // notify user if errors with data
    renderNoDataNotification(
      "Restaurant is closed"
      ,
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


//////////////////////////////////////////////BG-Image//////////////////////////////////////////
/**
 * Changes campus image
 * size according to screen size
 * @returns {string} - Current campus image file name
 */
const getOriginPicturesize = () => {
  if (window.innerWidth >= 400 && window.innerWidth < 900) {
    kampusPictureSize = '-kampus-medium.jpg';
  } else if (window.innerWidth >= 900) {
    kampusPictureSize = '-kampus-big.jpg';
  } else {
    kampusPictureSize = '-kampus-small.jpg';
  }
  return kampusPictureSize;
};

/**
 * Checks what current screen size is
 */
const resizePicture = () => {
    window.addEventListener('resize', () => {
      const picSize = getOriginPicturesize();
      changeBackgroundImage(picSize);
    });
};

/**
 * Change campus background image
 *
 * @param {string} kampusPictureSize - Name of the image file
 */
const changeBackgroundImage = (kampusPictureSize) => {
  document.querySelector("#hero").style["background"] =
    "url('./assets/img/" +
    campus +
    kampusPictureSize +
    "') no-repeat center center/cover";
};


//////////////////////////////////////////////HSL//////////////////////////////////////////
/**
 * Loads transportation information based on each
 * campuses transportation vehicle stops
 *
 * @param {array} stopid -Array of stop ids for current campus.
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
 * Adds transportation vehicle icon to HSL data
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
  return `<img class="hsl-icon filter-white" src="./assets/icons/${vehicle}.svg" alt="hsl icon">`;
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

//////////////////////////////////////////////Campus-info//////////////////////////////////////////
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
  changeBackgroundImage(kampusPictureSize);
  resizePicture();
  changeCampusName();
  campusContactInfo();
};


/**
 * Renders contact information of the current campus on footer
 */
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
 * Runs when app is first opened
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
  getOriginPicturesize();
  changeBackgroundImage(kampusPictureSize);
  resizePicture();
  campusContactInfo();

  if (languageSetting == "en") {
    document.querySelector("#togBtn").checked = true;
  }
};


//////////////////////////////////////////////Weather//////////////////////////////////////////
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
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherIconValue}.png" alt="${descValue}">`;
  desc.innerHTML = descValue;
  temp.innerHTML = `${tempValue.toFixed(1)} &deg;C`;
  // desc.innerHTML = descValue;
};

//////////////////////////////////////////////Eventlisteners//////////////////////////////////////////

//event listener for message right button
const btnPlusM = document.querySelector("#btn-message-right");
btnPlusM.addEventListener("click", () => {
  Messages.plusSlidesMessages(1);
  Messages.pauseMessages();
});

//event listener for message left button
const btnMinusM = document.querySelector("#btn-message-left");
btnMinusM.addEventListener("click", () => {
  Messages.plusSlidesMessages(-1);
  Messages.pauseMessages();
});


messageSlidesContainer.addEventListener("mouseenter", () => {
  Messages.pauseMessages();
});
messageSlidesContainer.addEventListener("mouseleave", () => {
  Messages.resumeMessages();
});

let touchstartX = 0;
let touchendX = 0;

let slider = document.querySelector('.metropolia-messages');

const handleGesture= () => {
  if (touchendX < touchstartX){
    Messages.plusSlidesMessages(1);
    Messages.pauseMessages();
  }
  if (touchendX > touchstartX) {
    Messages.plusSlidesMessages(-1);
    Messages.pauseMessages();
  }
};


slider.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
}, {passive: true});

slider.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  handleGesture();
}, {passive: true});

//////////////////////////////////////////////Update//////////////////////////////////////////
/**
 * Updates info every minute
 */
const everyMinute = () => {
  setInterval(async () => {
    await loadHSLData(CampusData[campus]["hslstopid"]);
    await loadAllMenuData();
    await loadWeatherData(CampusData[campus]["location"], languageSetting);
  }, 60000);
};


//////////////////////////////////////////////Serviceworker//////////////////////////////////////////
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


//////////////////////////////////////////////Init//////////////////////////////////////////
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
  Messages.showAllMessages(languageSetting);

  setModalControls();

  registerServiceWorkers();
};
init();

