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
let updateSun = (sunrise, sunset, totalMinutes, minutesSunUp) => {
  sun = document.querySelector('.js-sun');

  // We gaan de zon verplaatsen
  // We hebben de sunrise en sunset nodig om te weten hoeveel procent van de dag er al voorbij is.

  // We hebben ook de huidige tijd nodig.
  // You have to devide by 1000 because the API gives us the time in milliseconds and the time in JS is in seconds.

  console.log(`NOW ==> \t ${Date.now()}`);
  console.log(`SUNSET ==>  \t ${sunset}`);
  console.log(`NOW / 1000 ==>  \t ${Date.now() / 1000}`);
  console.log(`MINTUS SUN UP ==>  \t ${minutesSunUp}`);

  // Bereken hoeveel procent van de dag er al voorbij is.
  let percentage = (minutesSunUp / totalMinutes) * 100;
  console.log(`PERCENTAGE ==>  \t ${percentage}`);

  // Gebruik CSS om de rotatie van de zon aan te passen.
  sun.style.left = `${percentage}%`;

  let percentageB;
  // If percentage is bigger than 50
  if (percentage > 50) {
    // Than we have to calculate the percentage of the sun going down
    percentageB = (100 - percentage) * 2;
    console.log(`PERCENTAGEB ==>  \t ${percentageB}`);
  } else {
    // Else we have to calculate the percentage of the sun going up
    percentageB = percentage * 2;
    console.log(`PERCENTAGEB ==>  \t ${percentageB}`);
  }
  sun.style.bottom = `${percentageB}%`;

  // Night and day mode
  if (percentageB > 100 || percentageB < 0) {
    document.querySelector('.is-day').classList.add('is-night');
  } else {
    document.querySelector('.is-day').classList.remove('is-night');
  }
};

let updateTimeAndTimeLeft = (sunset) => {
  // We gaan de tijd en het aantal minuten resterend deze dag updaten.
  // We hebben sunrise en sunset nodig om te weten hoeveel minuten er nog resten.
  // We hebben ook de huidige tijd nodig.

  // Bereken hoeveel minuten er nog resten.
  let minutesLeft = Math.floor((sunset - Date.now() / 1000) / 60);
  console.log(`Minutes left ==> ${minutesLeft}`);

  // Bereken hoeveel uur en minuten er nog resten.
  let hoursLeft = Math.floor(minutesLeft / 60);
  let minutesLeftHour = minutesLeft % 60;

  // Zet de tijd en het aantal minuten resterend deze dag in het DOM.
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.querySelector('.js-sun').setAttribute('data-time', timeNow);
  document.querySelector('.js-time-left').innerHTML = `${hoursLeft} uur en ${minutesLeftHour} minuten`;
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise, sunset) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  let timeLeft = document.querySelector('.js-time-left');

  // Bepaal het aantal minuten dat de zon al op is.
  const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);
  console.log(`Minutes the sun is up ==> ${minutesSunUp}`);

  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  updateSun(sunrise, totalMinutes, minutesSunUp);

  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  document.querySelector('body').classList.add('is-loaded');

  // Vergeet niet om het resterende aantal minuten in te vullen.
  updateTimeAndTimeLeft(sunset);

  // Nu maken we een functie die de zon elke minuut zal updaten
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.

  // Funtction to update the sun every minute
  const interval = setInterval(() => {
    const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);
    updateSun(sunrise, sunset, totalMinutes, minutesSunUp);
    if (minutesSunUp >= totalMinutes) {
      clearInterval(interval);
    }
  }, 1000);
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  document.querySelector('.js-location').innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  document.querySelector('.js-sunrise').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
  document.querySelector('.js-sunset').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);

  // Totale tijd dat de zon op is
  const totalMinutes = Math.floor((new Date(queryResponse.city.sunset) - new Date(queryResponse.city.sunrise)) / 60);
  // Bepaal het aantal minuten dat de zon al op is.
  const minutesSunUp = Math.floor((Date.now() / 1000 - queryResponse.city.sunrise) / 60);

  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  updateSun(queryResponse.city.sunset, queryResponse.city.sunrise, totalMinutes, minutesSunUp);

  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  placeSunAndStartMoving(totalMinutes, queryResponse.city.sunrise, queryResponse.city.sunset);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
getData = async (url) => {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error));
};

let getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=b3093883d5fda139b911f2942e60027d&units=metric&lang=nl&cnt=1`;
  // Met de fetch API proberen we de data op te halen.
  const data = await getData(url);
  // Als dat gelukt is, gaan we naar onze showResult functie.
  showResult(data);
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.2097454);
});
