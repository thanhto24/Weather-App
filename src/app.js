const express = require('express');
const hbs = require('hbs');
const path = require('path');

const app = express();
const weatherData = require('../utils/weatherData');

const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));


const port = process.env.PORT || 3001;

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env' })

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = 'Weather';

async function getCountryData() {
    const collectionName = 'Countries';
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all cities and countries from MongoDB
    const data = await collection.find().toArray();
    await client.close();

    return data;
}

async function getCityOfCountry(country_id){
    const collectionName = 'Cities';
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all cities and countries from MongoDB
    const data = await collection.find({ countryId: new ObjectId(country_id) }).toArray();
    await client.close();
    return data;
}

app.get("/", (req, res) => {
    res.render("index", {title: "Weather App + link: " + uri});
})

app.get("/api/country", async (req, res) => {
    try {
        const data = await getCountryData();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send('Error fetching data');
    }    
})

app.get("/api/city", function(req, res){
    if(!req.query.country_id)
        return res.status(400).send("Please select country");
    getCityOfCountry(req.query.country_id)
        .then(data => res.json(data))
        .catch(err => {
            console.error("Error fetching data from MongoDB:", err);
            res.status(500).send('Error fetching data');
        });
})

app.get("/weather", (req, res) => {
    // console.log(req.query.address);
    if(!req.query.address)
        return res.render("error", {title: "Error", message: "Please provide an address"});
    weatherData(req.query.address, (err, result) => {
        if(err)
            return res.render("error", {title: "Error", message: result});
        res.render("weather", {
            title: "Weather",
            city: req.query.address,
            main_weather: result["weather"][0]["main"],
            description_weather: result["weather"][0]["description"],
            temp: (result["main"]["temp"] / 10).toFixed(1),
            wind: result["wind"]["speed"],
            icon_link: "https://openweathermap.org/img/wn/" + result["weather"][0]["icon"] + "@2x.png",
        });
    });
})

app.get("*", (req, res) => {
    res.render("error", {title: "Error", message: "Page not found"});
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
})