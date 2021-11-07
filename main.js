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

const checkDayTime = (sunrise, sunset, dt) => {
  //sunrise and sunset are unix utc times
  const rise = new Date(sunrise * 1000);
  const set = new Date(sunset * 1000);
  const cityTime = new Date(dt * 1000);
  img.src = (cityTime >= rise) & (cityTime <= set) ? "day.jpg" : "night.jpg";
};

const setClock = () => {
  const time = new Date(getUtcTime().getTime() + offset * 1000);
  let h = time.getHours();
  let m = time.getMinutes();
  let s = time.getSeconds();
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  clockTime.innerHTML = h + ":" + m + ":" + s;
};

const updateUi = (data) => {
  //offset is shift in seconds from UTC
  offset = data.timezone;

  conditions.innerHTML = data.weather[0].description;
  temperature.innerHTML = data.main.temp + "&deg;C";
  city.innerHTML = data.name;

  checkDayTime(data.sys.sunrise, data.sys.sunset, data.dt);

  setClock();
  clockInterval = setInterval(setClock, 1000);

  weather.classList.remove("d-none");
  clock.classList.remove("d-none");

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
