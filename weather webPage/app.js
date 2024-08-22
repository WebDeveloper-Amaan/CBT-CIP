// Constants for API keys and URLs
const apiKey = "38f016d7193b4fbb1f5d98b1764b2b61"; // API key for OpenWeatherMap
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="; // URL for current weather data
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q="; // URL for 5-day weather forecast

// DOM elements selection
const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.getElementById('locationInput');
const search = document.querySelector('.search');
const btn = document.querySelector('.submit');
const cities = document.querySelector('.cities');
const forecastContainer = document.querySelector('.forecast');

let cityInput = "Delhi"; // Default city to load
let timezoneOffset = 0; // Variable to store the city's timezone offset

// Load cities from local storage
const loadCities = () => {
    const savedCities = JSON.parse(localStorage.getItem('cities')) || []; // Retrieve saved cities from local storage
    savedCities.forEach(city => updateCityList(city)); // Update city list in UI
};

// Save cities to local storage
const saveCities = (newCity) => {
    let savedCities = JSON.parse(localStorage.getItem('cities')) || []; // Retrieve saved cities from local storage
    if (!savedCities.includes(newCity)) { // If city is not already saved
        if (savedCities.length >= 5) { // Limit to the last 5 cities
            savedCities.shift(); // Remove the oldest city
        }
        savedCities.push(newCity); // Add the new city
        localStorage.setItem('cities', JSON.stringify(savedCities)); // Save updated cities list to local storage
    }
};

// Add event listener to the document to focus search input when '/' is pressed
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search');
    const prompt = document.createElement('div'); // Create a prompt for user instruction
    prompt.className = 'prompt';
    prompt.textContent = 'Press / to jump to the search box';
    document.body.appendChild(prompt);

    document.addEventListener('keydown', (event) => {
        if (event.key === '/') { // Focus search input if '/' key is pressed
            searchInput.focus();
            event.preventDefault(); // Prevent default behavior of the '/' key
            prompt.style.display = 'none'; // Hide prompt when search is focused
        } else if (searchInput !== document.activeElement) {
            prompt.style.display = 'block'; // Show prompt if search is not focused
        }
    });

    searchInput.addEventListener('focus', () => {
        prompt.style.display = 'none'; // Hide prompt when search input is focused
    });
});

// Update city list and set click event for each city in the list
const updateCityList = (newCity) => {
    let citiesHTML = "";
    const savedCities = JSON.parse(localStorage.getItem('cities')) || []; // Retrieve saved cities from local storage
    savedCities.forEach(city => {
        citiesHTML += `<li class="city">${city}</li>`; // Generate list items for cities
    });
    cities.innerHTML = citiesHTML; // Insert cities into the DOM

    // Add event listener to each city item to fetch weather data when clicked
    document.querySelectorAll('.city').forEach(city => {
        city.addEventListener('click', (e) => {
            cityInput = e.target.innerHTML; // Update city input with the clicked city
            fetchWeatherData(); // Fetch weather data for the selected city
            app.style.opacity = "0"; // Temporarily hide the app during the update
        });
    });
};

// Event listener for form submission (searching a city)
form.addEventListener('submit', (e) => {
    if (search.value.length === 0) { // If search input is empty, show alert
        alert('Please type in a city name');
    } else {
        cityInput = search.value; // Update city input with the searched city
        fetchWeatherData(); // Fetch weather data for the searched city
        search.value = ""; // Clear the search input
        app.style.opacity = "0"; // Temporarily hide the app during the update
    }
    e.preventDefault(); // Prevent the form from submitting normally
});

// Function to get the day of the week from a date
const dayOfTheWeek = (date) => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[date.getDay()]; // Return the day of the week
};

// Function to fetch weather data for the current city
const fetchWeatherData = () => {
    fetch(`${apiUrl}${cityInput}&appid=${apiKey}`) // API call to get current weather data
        .then(response => {
            if (!response.ok) {
                throw new Error(`City not found: ${response.statusText}`); // Handle errors if city is not found
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            if (data.cod !== 200) { // Additional error handling for unsuccessful responses
                throw new Error(`City not found: ${data.message}`);
            }

            // Update UI with the fetched data
            temp.innerHTML = Math.round(data.main.temp) + "&#176;"; // Display temperature
            conditionOutput.innerHTML = data.weather[0].description; // Display weather condition
            const date = new Date((data.dt + data.timezone) * 1000); // Adjust the date using the city's timezone
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            dateOutput.innerHTML = `${dayOfTheWeek(date)} ${day}, ${month} ${year}`; // Display the date
            nameOutput.innerHTML = data.name; // Display the city name

            const iconId = data.weather[0].icon;
            icon.src = `http://openweathermap.org/img/wn/${iconId}@2x.png`; // Display weather icon

            cloudOutput.innerHTML = data.clouds.all + "%"; // Display cloudiness
            humidityOutput.innerHTML = data.main.humidity + "%"; // Display humidity
            windOutput.innerHTML = Math.round(data.wind.speed) + " km/h"; // Display wind speed

            // Determine time of day based on local time
            const localHours = date.getUTCHours(); // Get local hours considering timezone
            let timeOfDay = "day";
            if (localHours >= 18 || localHours < 6) {
                timeOfDay = "night"; // If it's between 6 PM and 6 AM, set time of day to "night"
            }

            // Set background image based on weather condition and time of day
            const code = data.weather[0].id;
            if (code === 800) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/clear.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#181e27" : "#e5ba92";
            } else if (code >= 801 && code <= 804) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/cloudy.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#181e27" : "#fa6d1b";
            } else if (code >= 500 && code <= 531) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/rainy.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#325c80" : "#647d75";
            } else if (code >= 700 && code <= 781) {
                // New conditions for haze and mist
                app.style.backgroundImage = `url(./images/${timeOfDay}/haze.jpg)`;
                if (code === 701) {
                    app.style.backgroundImage = `url(./images/${timeOfDay}/mist.jpg)`;
                }
                btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
            } else {
                app.style.backgroundImage = `url(./images/${timeOfDay}/snowy.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
            }

            timezoneOffset = data.timezone; // Store the city's timezone offset
            saveCities(cityInput); // Save the searched city to local storage
            updateCityList(cityInput); // Update the city list in the UI
            app.style.opacity = "1"; // Make the app visible again

            fetchForecastData(); // Fetch the forecast data after fetching the weather data
        })
        .catch(error => {
            alert(error.message); // Show error message if something goes wrong
            app.style.opacity = "1"; // Make the app visible again
        });
};

// Function to fetch the 5-day weather forecast
const fetchForecastData = () => {
    fetch(`${forecastUrl}${cityInput}&appid=${apiKey}`) // API call to get weather forecast
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            forecastContainer.innerHTML = ''; // Clear previous forecast data
            const forecastList = data.list;
            for (let i = 0; i < forecastList.length; i += 8) { // Get forecast for every 24 hours (3-hour intervals * 8 = 24 hours)
                const forecast = forecastList[i];
                const forecastDate = new Date(forecast.dt * 1000);
                const forecastDay = dayOfTheWeek(forecastDate);
                const forecastTemp = Math.round(forecast.main.temp) + "&#176;"; // Display forecast temperature
                const forecastIconId = forecast.weather[0].icon;
                const forecastCondition = forecast.weather[0].description;

                // Create a new forecast item and insert it into the DOM
                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="forecast-date">${forecastDay}, ${forecastDate.getDate()}/${forecastDate.getMonth() + 1}</div>
                    <div class="forecast-temp">${forecastTemp}</div>
                    <img class="forecast-icon" src="http://openweathermap.org/img/wn/${forecastIconId}@2x.png" alt="${forecastCondition}">
                    <div class="forecast-condition">${forecastCondition}</div>
                `;

                forecastContainer.appendChild(forecastItem); // Append the forecast item to the container
            }
        })
        .catch(error => {
            console.error("Error fetching forecast data: ", error); // Log errors if something goes wrong
        });
};

// Function to update the time every second
const updateTime = () => {
    const now = new Date(); // Get current date and time
    const localTime = new Date(now.getTime() + timezoneOffset * 1000); // Adjust time according to timezone offset
    const hours = localTime.getUTCHours().toString().padStart(2, '0'); // Format hours with leading zero
    const minutes = localTime.getUTCMinutes().toString().padStart(2, '0'); // Format minutes with leading zero
    const seconds = localTime.getUTCSeconds().toString().padStart(2, '0'); // Format seconds with leading zero
    timeOutput.innerHTML = `${hours}:${minutes}:${seconds}`; // Update time display in the UI
};

// Update time every second
setInterval(updateTime, 1000);

// Initial call to fetch weather data for the default city
fetchWeatherData();