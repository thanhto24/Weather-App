const request = require('request');

const openWeatherMap = {
    BASE_URL: "https://api.openweathermap.org/data/2.5/weather?q=",
    SECRET_KEY: "c549d74721cd86cb85ddbb504f41266c"
}

const weatherData = (address, callback) => {
    const url = openWeatherMap.BASE_URL + encodeURIComponent(address) + "&APPID=" + openWeatherMap.SECRET_KEY;
    // console.log(url);
    request({ url, json: true }, (error, { body, statusCode }) => {
        if (error) {
            callback(true, "Can't connect to the weather service: " + error);
        } else if (statusCode !== 200) {
            callback(true, `Error: Received status code ${statusCode}. ${body.message}`);
        } else {
            callback(false, body);
        }
    });
}

module.exports = weatherData;