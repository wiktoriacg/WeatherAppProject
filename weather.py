import os
import requests
from dotenv import load_dotenv
from azure.identity import InteractiveBrowserCredential
from azure.keyvault.secrets import SecretClient


#def get_token():
    #"""Pobiera klucz API z pliku .env"""
    #doth_path = '.env'
    #load_dotenv(doth_path)
    #API_KEY = os.getenv('KEY')
    #return API_KEY

api_key = None

def get_token():
    global api_key
    # Jeśli klucz API został już pobrany, zwróć go bez ponownej autoryzacji
    if api_key is not None:
        return api_key

    # Tworzenie obiektu credential i SecretClient, aby pobrać sekret z Azure Key Vault
    credential = InteractiveBrowserCredential(additionally_allowed_tenants=["2384d4a2-ab75-4a4c-94d2-a3ba9c93e713"])
    key_vault_url = "https://apiweatherproject.vault.azure.net/"
    secret_client = SecretClient(vault_url=key_vault_url, credential=credential)

    # Pobieranie wartości sekretu
    secret_name = "waether1"
    secret = secret_client.get_secret(secret_name)

    # Zapisanie sekretu do zmiennej globalnej, aby nie trzeba było go ponownie pobierać
    api_key = secret.value
    return api_key


def get_weather_data(city):
    """Pobiera dane pogodowe dla zadanego miasta"""
    API_KEY = get_token()
    url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'

    response = requests.get(url)
    weather_data = response.json()

    if weather_data['cod'] == 200:
        return {
            'city': weather_data['name'],
            'temperature': weather_data['main']['temp'],
            'description': weather_data['weather'][0]['description'],
            'icon': weather_data['weather'][0]['icon']
        }
    else:
        return {'error': 'City not found'}


def get_five_days_weather(city):
    """Pobiera prognozę godzinową dla pięciu dni dla zadanego miasta"""
    API_KEY = get_token()
    url = f'https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric'

    response = requests.get(url)
    weather_data = response.json()

    if weather_data['cod'] == '200':
        forecast = []
        for entry in weather_data['list']:
            forecast.append({
                'datetime': entry['dt_txt'],
                'temperature': entry['main']['temp'],
                'feels_like': entry['main']['feels_like'],
                'humidity': entry['main']['humidity'],
                'description': entry['weather'][0]['description']
            })

        return {
            'city': weather_data['city']['name'],
            'forecast': forecast
        }
    else:
        return {'error': 'City not found'}

    def get_map(layer):
        """Pobiera mapę z OpenWeather na podstawie wybranej warstwy"""
        API_KEY = get_token()
        base_url = "https://tile.openweathermap.org/map/"
        map_layers = {
            "clouds": "clouds_new",
            "precipitation": "precipitation_new"
        }

        if layer not in map_layers:
            return {"error": "Invalid layer selected"}

        layer_url = f"{base_url}{map_layers[layer]}/{{z}}/{{x}}/{{y}}.png?appid={API_KEY}"
        return {"url": layer_url}

def get_pollution(city):
    """Pobiera dane o zanieczyszczeniu powietrza dla zadanego miasta"""
    API_KEY = get_token()
    # Pobieranie współrzędnych miasta
    geocode_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}"
    response = requests.get(geocode_url)
    data = response.json()

    if response.status_code == 200:
        lat = data['coord']['lat']
        lon = data['coord']['lon']

        # Pobieranie danych o zanieczyszczeniu powietrza za pomocą współrzędnych
        pollution_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
        pollution_response = requests.get(pollution_url)
        pollution_data = pollution_response.json()

        if pollution_response.status_code == 200:
            return {
                'city': city,
                'so2': pollution_data['list'][0]['components']['so2'],
                'no2': pollution_data['list'][0]['components']['no2'],
                'pm10': pollution_data['list'][0]['components']['pm10'],
                'pm25': pollution_data['list'][0]['components']['pm2_5'],
                'o3': pollution_data['list'][0]['components']['o3'],
                'co': pollution_data['list'][0]['components']['co']
            }
        else:
            return {'error': 'Pollution data not found'}
    else:
        return {'error': 'City not found'}
