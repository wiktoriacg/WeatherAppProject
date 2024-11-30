from flask import Flask, jsonify, render_template, request
from weather import get_token, get_weather_data, get_five_days_weather, get_pollution

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/index2')
def index2():
    return render_template('index2.html')

@app.route('/weather', methods=['POST'])
def weather():
    city = request.json['city']
    weather_info = get_weather_data(city)
    return jsonify(weather_info) if 'error' not in weather_info else jsonify(weather_info), 404

@app.route('/five_days_weather', methods=['POST'])
def five_days_weather():
    city = request.json.get('city')
    forecast_info = get_five_days_weather(city)
    return jsonify(forecast_info) if 'error' not in forecast_info else jsonify(forecast_info), 404
@app.route('/index3')
def index3():
    layer = request.args.get('layer')
    valid_layers = ['clouds', 'precipitation', 'pressure', 'wind', 'temp']

    if layer not in valid_layers:
        return "Invalid layer selected", 400
    return render_template('index3.html', layer=layer, api_key=get_token())
@app.route('/index4')
def index4():
    return render_template('index4.html')

@app.route('/pollution/<city>')
def pollution(city):
    pollution_data = get_pollution(city)
    if 'error' not in pollution_data:
        return jsonify(pollution_data)
    return jsonify(pollution_data), 404


if __name__ == '__main__':
    app.run(debug=True)
