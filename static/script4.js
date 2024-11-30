document.addEventListener('DOMContentLoaded', function() {
    // Funkcja do wysyłania zapytania do serwera Flask
    const submitPollutionForm = () => {
        const city = document.getElementById('pollutionCity').value.trim();
        if (city === '') {
            alert('Please enter the name of the city.');
            return false;
        }

        // Wysyłanie zapytania do serwera Flask
        fetch(`/pollution/${city}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('pollutionResult').innerHTML = `<p>No data found for city: ${city}</p>`;
                } else {
                    document.getElementById('pollutionCityName').textContent = `Pollution in the city: ${data.city}`;
                    updatePollutionLevel('so2', data.so2, [20, 80, 250, 350]);
                    updatePollutionLevel('no2', data.no2, [40, 70, 150, 200]);
                    updatePollutionLevel('pm10', data.pm10, [20, 50, 100, 200]);
                    updatePollutionLevel('pm25', data.pm25, [10, 25, 50, 75]);
                    updatePollutionLevel('o3', data.o3, [60, 100, 140, 180]);
                    updatePollutionLevel('co', data.co, [4400, 9400, 12400, 15400]);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem downloading data.');
            });

        // Zapobiega wysyłaniu formularza
        return false;
    };

    // Funkcja do sprawdzania poziomu zanieczyszczeń i zmiany koloru
    const updatePollutionLevel = (id, value, thresholds) => {
        const element = document.getElementById(id);
        element.textContent = `${id.toUpperCase()}: ${value} µg/m³`;

        // Sprawdzanie, w którym przedziale się mieści wartość
        if (value >= thresholds[3]) {
            element.style.color = 'red';  // Very Poor
        } else if (value >= thresholds[2]) {
            element.style.color = 'red';  // Poor
        } else if (value >= thresholds[1]) {
            element.style.color = 'orange';  // Moderate
        } else {
            element.style.color = 'black';  // Good or Fair
        }
    };

    // Przypisanie funkcji do formularza
    const form = document.getElementById('pollutionForm');
    form.onsubmit = submitPollutionForm;
});
