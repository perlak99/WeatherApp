"use strict";
const key = "6c7c00d2e76b9195e3b6c63a39ed988a";
const clock = document.querySelector(".clock");
const clockTime = document.querySelector("h2");
const form = document.querySelector("form");
const weather = document.querySelector(".weather");
const city = document.querySelector(".card-title");
const conditions = document.querySelector(".conditions");
const temperature = document.querySelector(".temperature");
const img = document.querySelector("img");
const error = document.querySelector(".error");
let date;
let offset;
let clockInterval;

//returns date with utc time, but wrong timezone
const getUtcTime = () => {
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  return utcTime;
};

const renderError = (message) => {
  clearInterval(clockInterval);
  error.innerHTML = message;
  clockTime.innerHTML = "";
  conditions.innerHTML = "";
  temperature.innerHTML = "";
  city.innerHTML = "";
  img.setAttribute("src", "");
};

const getWeather = async (city) => {
  try {
    const call = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;

    const response = await fetch(call);
    if (!response.ok) {
      if (response.status == 404)
        throw new Error("There is no city of given name!");
      else throw new Error("Problem getting location data!");
    }

    const data = await response.json();

    return data;
  } catch (err) {
    throw err;
  }
};

const setClock = () => {
  const utcDate = getUtcTime();
  date = new Date(utcDate.getTime() + offset * 1000);

  let cityTime = "";
  cityTime +=
    date.getHours() < 10 ? "0" + date.getHours() + ":" : date.getHours() + ":";
  cityTime +=
    date.getMinutes() < 10
      ? "0" + date.getMinutes() + ":"
      : date.getMinutes() + ":";
  cityTime +=
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  clockTime.innerHTML = cityTime;
};

const checkDayTime = (sunrise, sunset) => {
  const utcDate = new Date(getUtcTime().getTime());
  const time = utcDate.getHours() * 3600 + utcDate.getMinutes() * 60 + offset;
  //Sunrise and sunset parameters are UTC unix timestamps
  const sunriseDate = new Date(sunrise * 1000);
  //converting time to seconds
  let sunriseTime =
    sunriseDate.getUTCHours() * 3600 +
    sunriseDate.getUTCMinutes() * 60 +
    offset;
  if (sunriseTime < 0) sunriseTime += 86400;
  const sunsetDate = new Date(sunset * 1000);
  let sunsetTime =
    sunsetDate.getUTCHours() * 3600 + sunsetDate.getUTCMinutes() * 60 + offset;
  if (sunsetTime < 0) sunsetTime += 86400;

  time >= sunriseTime && time < sunsetTime
    ? img.setAttribute("src", "day.jpg")
    : img.setAttribute("src", "night.jpg");
};

const updateUi = (data) => {
  offset = data.timezone;
  conditions.innerHTML = data.weather[0].description;
  temperature.innerHTML = data.main.temp + "&deg;C";
  city.innerHTML = data.name;
  checkDayTime(data.sys.sunrise, data.sys.sunset);

  setClock();
  clockInterval = setInterval(setClock, 1000);

  if (weather.classList.contains("d-none")) weather.classList.remove("d-none");
  if (clock.classList.contains("d-none")) clock.classList.remove("d-none");

  error.innerHTML = "";
};

form.addEventListener("submit", async (e) => {
  try {
    e.preventDefault();
    let formCity = form.city.value.trim();
    let data = await getWeather(formCity);
    updateUi(data);
    localStorage.setItem("city", formCity);
    form.reset();
  } catch (err) {
    renderError(`${err.message}`);
  }
});

if (localStorage.getItem("city")) {
  (async function () {
    try {
      let formCity = localStorage.getItem("city");
      let data = await getWeather(formCity);
      updateUi(data);
    } catch (err) {
      renderError(`${err.message}`);
      console.log(err);
    }
  })();
}
