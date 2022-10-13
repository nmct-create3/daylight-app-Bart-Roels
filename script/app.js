// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}


// 5 TODO: maak updateSun functie
let updateSun = (minutesSunUp, totalMinutes) => {
  // 5a TODO: bereken hoeveel procent de zon al op is
  let percentage = (minutesSunUp / totalMinutes) * 100;
  // 5b TODO: gebruik dit percentage om de breedte van de sun te bepalen
  let sunHTML = document.querySelector('.js-sun');
  sunHTML.style.left = `${percentage}%`;
  let percentageB;
  if (percentage > 50) {
    percentageB = (100 - percentage) * 2;
  } else {
    percentageB = percentage * 2;
  }
  sunHTML.style.bottom = `${percentageB}%`;
  if (percentageB > 100 || percentageB < 0) {
    document.querySelector('.is-day').classList.add('is-night');
  } else {
    document.querySelector('.is-day').classList.remove('is-night');
  }

  //sunHTML.style.bottom berekenen
  sunHTML.dataset.time = _parseMillisecondsIntoReadableTime(Date.now() / 1000);
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sunHTML = document.querySelector('.js-sun');
  // Bepaal het aantal minuten dat de zon al op is.
  const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);

  console.log(totalMinutes);
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  updateSun(sunHTML, minutesSunUp, totalMinutes);
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  document.querySelector('body').classList.add('is-loaded');
  // Vergeet niet om het resterende aantal minuten in te vullen.
  // Nu maken we een functie die de zon elke minuut zal updaten
  const interval = setInterval(() => {
    // We halen opnieuw het aantal minuten op dat de zon al op is.
    const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);
    // We voeren de updateSun functie uit met de juiste parameters.
    updateSun(sunHTML, minutesSunUp, totalMinutes);
    // Als de zon onder is gaan we de interval clearen.
    if (minutesSunUp >= totalMinutes) {
      clearInterval(interval);
    }
  }, 60000);
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie
  // Als de zon onder is, clearen we de interval.

  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (jsonObject) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  console.log(jsonObject);
  //Stad
  document.querySelector('.js-location').innerHTML = `${jsonObject.city.name}, ${jsonObject.city.country}`;
  //Sunrise
  const timerise = jsonObject.city.sunrise;
  document.querySelector('.js-sunrise').innerHTML = _parseMillisecondsIntoReadableTime(timerise);
  //Sunset
  const timeset = jsonObject.city.sunset;
  document.querySelector('.js-sunset').innerHTML = _parseMillisecondsIntoReadableTime(timeset);
  //Time between now and sunset
  const timebetween = new Date(jsonObject.city.sunset) - Date.now() / 1000;
  const hours = Math.floor(timebetween / 3600);
  const minutes = Math.floor((timebetween % 3600) / 60);
  if(hours > 0){
    document.querySelector('.js-time-left').innerHTML = `${hours} uur en ${minutes} minuten `;
  }else{
    document.querySelector('.js-time-left').innerHTML = `${minutes} minuten`;
  }

  const totalMinutes = Math.floor((new Date(jsonObject.city.sunset) - new Date(jsonObject.city.sunrise))/ 60);
  placeSunAndStartMoving(totalMinutes,timerise);
};

getData = async (url) => {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error));
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=b3093883d5fda139b911f2942e60027d&units=metric&lang=nl&cnt=1`;
  // Met de fetch API proberen we de data op te halen.
  let data = await getData(url);
  // Als dat gelukt is, gaan we naar onze showResult functie.

  showResult(data);
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.2097454);
});
