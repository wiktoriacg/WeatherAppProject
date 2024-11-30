function submitForm() {
    const city = document.getElementById('city').value;
    localStorage.setItem('city', city); // Zapisz miasto w localStorage
    //const dropdownOptions = document.getElementById('dropdownOptions');
    //dropdownOptions.classList.toggle('show');

    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('cityName').textContent = 'City not found';
            document.getElementById('temperature').textContent = '';
            document.getElementById('description').textContent = '';
            document.getElementById('icon').src = '';
            document.getElementById('icon').style.display = 'none';
        } else {
            const tempCelsius = data.temperature;
            const tempFahrenheit = (tempCelsius * 9/5) + 32;

            document.getElementById('cityName').textContent = `Weather in ${data.city}`;
            document.getElementById('temperature').textContent = `Temperature: ${tempFahrenheit.toFixed(1)}°F / ${data.temperature}°C`;
            document.getElementById('description').textContent = `Description: ${data.description}`;
            document.getElementById('icon').src = `http://openweathermap.org/img/wn/${data.icon}.png`;
            document.getElementById('icon').alt = `${data.description}`;
            document.getElementById('icon').style.display = 'block';
            document.getElementById('goToIndex2').style.display = 'block'; // Wyświetl przycisk do prognozy na pięć dni

            switch (data.icon) {
                case '01d': // Słonecznie w dzień
                case '02d':
                    document.body.style.backgroundImage = "url('/static/images/sun.jpg')";
                    break;
                case '02d': // Lekkie zachmurzenie
                case '03d': // Pochmurnie
                case '04d': // Mocne zachmurzenie
                case '02n': // Lekkie zachmurzenie w nocy
                case '03n': // Pochmurnie w nocy
                case '04n': // Mocne zachmurzenie w nocy (w tym broken clouds)
                    document.body.style.backgroundImage = "url('/static/images/clouds.png')";
                    break;
                case '09d': // Przelotne opady
                case '10d': // Deszcz
                case '09n': // Przelotne opady
                case '10n': // Deszcz
                    document.body.style.backgroundImage = "url('/static/images/rain.png')";
                    break;
                case '11d': // Burza
                case '11n': // Burza
                    document.body.style.backgroundImage = "url('/static/images/storm.jpg')";
                    break;
                case '13d': // Śnieg
                case '13n': // Śnieg w nocy
                    document.body.style.backgroundImage = "url('/static/images/snow.png')";
                    break;
                case '50d': // Mgła
                case '50n':
                    document.body.style.backgroundImage = "url('/static/images/fog.png')";
                    break;
                default: // Domyślne tło
                    document.body.style.backgroundImage = '';
            }
            document.body.style.backgroundSize = 'cover'; // Dopasuj obraz do ekranu
            document.body.style.backgroundRepeat = 'no-repeat';
        }
    })
    .catch(error => console.error('Error:', error));

    return false; // Zatrzymaj domyślne działanie formularza
}

function goToIndex2() {
    window.location.href = '/index2';
}
function showWeatherMap(layer) {
    localStorage.setItem('weatherLayer', layer);
    window.location.href = '/index3';
}
function toggleDropdown() {
    const dropdownOptions = document.getElementById('dropdownOptions');
    dropdownOptions.style.display = dropdownOptions.style.display === 'none' ? 'block' : 'none';
}



