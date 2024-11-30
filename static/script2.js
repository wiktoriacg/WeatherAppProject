document.addEventListener("DOMContentLoaded", () => {
    const city = localStorage.getItem('city'); // Pobierz miasto z localStorage
    const cityNameElement = document.getElementById('cityName'); // Element <h2> dla nazwy miasta

    if (city) {
        cityNameElement.textContent = `Weather forecast for: ${city}`;
        getFiveDaysForecast(city); // Wywołaj funkcję, jeśli miasto istnieje
    } else {
        console.error("City not entered.");
        document.getElementById('forecastContainer').innerHTML = "<p>No information about the city. Return to the home page.</p>";
    }
});

function convertToCST(datetimeString) {
    const date = new Date(datetimeString + ' UTC');
    return date.toLocaleString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' });
}

function convertToFahrenheit(celsius) {
    return (celsius * 9/5 + 32).toFixed(1);
}

function getFiveDaysForecast(city) {
    fetch('/five_days_weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city })
    })
    .then(response => response.json())
    .then(data => {
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';

        if (data.error) {
            forecastContainer.innerHTML = '<p>No forecast found for this city.</p>';
        } else {
            const days = {};
            data.forecast.forEach(forecast => {
                const date = forecast.datetime.split(' ')[0];
                if (!days[date]) days[date] = [];
                days[date].push(forecast);
            });

            Object.keys(days).forEach(day => {
                const dayData = days[day];

                const dayContainer = document.createElement('div');
                dayContainer.classList.add('day-container');

                const dateHeading = document.createElement('h3');
                dateHeading.classList.add('date-heading');
                dateHeading.innerText = `Date: ${day}`;
                dayContainer.appendChild(dateHeading);

                const canvas = document.createElement('canvas');
                canvas.id = `chart-${day}`;
                dayContainer.appendChild(canvas);
                displayTemperatureChart(dayData, canvas);

                const table = generateTableForDay(dayData);
                dayContainer.appendChild(table);

                forecastContainer.appendChild(dayContainer);
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

function displayTemperatureChart(data, canvas) {
    const times = data.map(forecast => convertToCST(forecast.datetime));
    const temperatures = data.map(forecast => forecast.temperature);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Time' }},
                y: { title: { display: true, text: 'Temperature (°C)' }}
            }
        }
    });
}

function generateTableForDay(dayData) {
    const table = document.createElement('table');
    table.classList.add('forecast-table');

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Time</th>
        <th>Temperature (F/°C)</th>
        <th>Feels like (F/°C)</th>
        <th>Humidity (%)</th>
        <th>Description</th>
    `;
    table.appendChild(headerRow);

    dayData.forEach(forecast => {
        const row = document.createElement('tr');
        const cstTime = convertToCST(forecast.datetime);
        const tempF = convertToFahrenheit(forecast.temperature);
        const feelsLikeF = convertToFahrenheit(forecast.feels_like);
        row.innerHTML = `
            <td>${cstTime}</td>
            <td><span class="temperature-fahrenheit">${tempF} F</span> / ${forecast.temperature}°C</td>
            <td><span class="temperature-fahrenheit">${feelsLikeF} F</span> / ${forecast.feels_like}°C</td>
            <td>${forecast.humidity}%</td>
            <td>${forecast.description}</td>
        `;
        table.appendChild(row);
    });

    return table;
}
