const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = 'Weather';
const countryCollectionName = 'Countries';
const cityCollectionName = 'Cities';

const csvFilePath = 'Cities.csv';

async function uploadData() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const countryCollection = db.collection(countryCollectionName);
        const cityCollection = db.collection(cityCollectionName);
        
        const countriesMap = new Map(); // To map country names to MongoDB _id
        const cities = [];
        
        // Read and process CSV file
        fs.createReadStream(csvFilePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            if (!countriesMap.has(row.country)) {
                // Insert new country into Countries collection and get the inserted id
                countriesMap.set(row.country, null);
            }
            cities.push({
                city: row.city,
                country: row.country
            });
        })
        .on('end', async () => {
            // Insert countries into the Countries collection
            const countriesArray = Array.from(countriesMap.keys()).map(name => ({ name }));
            const result = await countryCollection.insertMany(countriesArray);
            console.log(`Inserted ${result.insertedCount} countries into MongoDB.`);
            
            // Update countriesMap with the inserted ids
            const insertedIds = result.insertedIds;
            for (const [index, countryName] of Array.from(countriesMap.keys()).entries()) {
                const id = insertedIds[index];
                countriesMap.set(countryName, id);
            }

            // Insert cities into the Cities collection
            const citiesWithCountryId = cities.map(city => ({
                city: city.city,
                countryId: countriesMap.get(city.country)
            }));
            
            if (citiesWithCountryId.length > 0) {
                await cityCollection.insertMany(citiesWithCountryId);
                console.log(`Inserted ${citiesWithCountryId.length} cities into MongoDB.`);
            } else {
                console.log("No cities to insert.");
            }

            await client.close();
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

uploadData();
