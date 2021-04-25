const key = '6c7c00d2e76b9195e3b6c63a39ed988a';
const clock = document.querySelector(".clock");
const time = document.querySelector("h1");
const form = document.querySelector("form");
const weather = document.querySelector(".weather");
const city = document.querySelector(".card-title");
const conditions = document.querySelector(".conditions");
const temperature = document.querySelector(".temperature")
const img = document.querySelector("img");
let date;
let offset;

const getWeather = async (city) => {
    const call = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`

    const response = await fetch(call);
    const data = await response.json();

    return data;
}

const setClock = () => {
    const localDate = new Date();
    const localTime = localDate.getTime();
    const localOffset = localDate.getTimezoneOffset() * 60000; // conversion to ms
    const utc = localTime + localOffset;
    date = new Date(utc + (offset * 1000)); // conversion seconds to ms

    let cityTime = "";
    cityTime += date.getHours() < 10 ? '0' + date.getHours() + ":" : date.getHours() + ":"
    cityTime += date.getMinutes() < 10 ? '0' + date.getMinutes() + ":" : date.getMinutes() + ":"
    cityTime += date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    time.innerHTML = cityTime;
}

const checkDayTime = (sunrise, sunset) => {
    const localDate = new Date();
    const localTime = localDate.getTime();
    const localOffset = localDate.getTimezoneOffset() * 60000; // conversion to ms
    const utc = localTime + localOffset;
    const utcDate = new Date(utc);

    const sunriseDate = new Date((sunrise * 1000) + localOffset);
    const sunsetDate = new Date((sunset * 1000) + localOffset);
    
    utcDate >= sunriseDate && utcDate < sunsetDate ? img.setAttribute("src", "day.jpg") : img.setAttribute("src", "night.jpg");
}

const updateUi = (data) => {
    offset = data.timezone;
    conditions.innerHTML = data.weather[0].description;
    temperature.innerHTML = data.main.temp;

    checkDayTime(data.sys.sunrise, data.sys.sunset);

    setClock();
    setInterval(setClock, 1000);

    if(weather.classList.contains("d-none"))
        weather.classList.remove("d-none");
    if(clock.classList.contains("d-none"))
        clock.classList.remove("d-none");
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    formCity = form.city.value.trim();
    city.innerHTML = formCity;
    getWeather(formCity)
        .then((data) => updateUi(data))
        .catch(() => alert("Wrong city name!"));
    form.reset();
});