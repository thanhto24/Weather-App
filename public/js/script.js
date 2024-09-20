document.addEventListener('DOMContentLoaded', async () => {
    const countrySelect = document.getElementById('country-select');
    const citySelect = document.getElementById('city-select');

    // Create and append default option for city select
    const defaultCityOption = document.createElement('option');
    defaultCityOption.value = '';
    defaultCityOption.textContent = 'Select City';
    // citySelect.appendChild(defaultCityOption);

    // Create and append default option for country select
    const defaultCountryOption = document.createElement('option');
    defaultCountryOption.value = '';
    defaultCountryOption.textContent = 'Select Country';
    // countrySelect.appendChild(defaultCountryOption);



    try {
        // Fetch the country data from the API
        const countryResponse = await fetch('/api/country');
        const countries = await countryResponse.json();
        // console.log('Countries:', countries); // Debugging log
        
        // Populate the country select element
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country._id; // Assuming _id is the identifier for countries
            option.textContent = country.name; // Assuming name is the field for country names
            countrySelect.appendChild(option);
        });

        countrySelect.addEventListener('change', async function() {
            const selectedCountryId = countrySelect.value;
            // console.log('Selected country ID:', selectedCountryId); 

            if (!selectedCountryId) {
                citySelect.innerHTML = '';
                citySelect.appendChild(defaultCityOption); // Re-append default city option
                return;
            }

            try {
                const cityResponse = await fetch(`/api/city?country_id=${selectedCountryId}`);
                const cities = await cityResponse.json();
                // console.log('Cities:', cities); 
                
                citySelect.innerHTML = '';
                citySelect.appendChild(defaultCityOption); // Re-append default city option
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city._id;
                    option.textContent = city.city; 
                    citySelect.appendChild(option);
                });
                // console.log(citySelect);
            } catch (error) {
                console.error('Error fetching city data:', error);
            }
        });

    } catch (error) {
        console.error('Error fetching country data:', error);
    }

    document.getElementById('get-weather-btn').addEventListener('click', async () => {
        const cityName = document.getElementById('city-select').selectedOptions[0].textContent;
        window.location.href = `/weather?address=${cityName}`;
    });
});
