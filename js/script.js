
// const apiURL = "http://api.openweathermap.org/data/2.5/weather"  
const apiURL = "https://uwpce-weather-proxy.herokuapp.com/data/2.5/weather"
const appid = "&appid=36b77110cb8dde5daabb4b6771250ce2"
const units  = "&units=imperial"
const googleApi = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
const googleKey = "&key=AIzaSyDyuSf8uGbqpI6hjzkrs3Cqmj9mx0Ek0Uc"

// Will run after all HTML is done rendering
window.onload = function(){
  document.getElementById("Seattle").onclick = processData;
  document.getElementById("London").onclick = processData;
  document.getElementById("CurrentLoc").onclick = getCurrentAddress;
}


///////////////////////////////
// get current lat/lon
let currentLat =""
let currentLon=""
let varURL =""
let request = new XMLHttpRequest()
let currentAdress =""
let success = function(position){
  currentLat = position.coords.latitude
  currentLon = position.coords.longitude
  varURL =  googleApi + currentLat + "," + currentLon + googleKey
  console.log(varURL);
}
let error = function(){
  console.log("Error occured!");
}
navigator.geolocation.getCurrentPosition(success, error)

// get address based on current lat/lon. Fires when Get Current button clicked
function getCurrentAddress() {

  request.open("GET", varURL, true)
  request.onload = onloadFunc
  request.onerror = onerrorFunc
  request.send()
}

// onload callback, get current address
function onloadFunc(){
  console.log("success!");
  const resp = JSON.parse(request.response)
  console.log(resp)

  if(resp.results.length>0){
    currentAdress = resp.results[0].formatted_address
  }
  else {
    currentAdress = "No Address found!"
  }

  // now call get weatherData based on current Lat/Lon
  let values = {lat:currentLat, lon:currentLon}
  let queryString = queryBuilder(values)
  getWeather(queryString, currentAdress)
}

// onerror callback
function onerrorFunc(){
  console.log("uh oh");
  document.getElementById('cityName').innerHTML="Sorry, programming error in onerrorFunc()!"
}


/////////////////////////////
var seattle = { lat: 47.6762, lon: -122.3182 }
var london  = { lat: 51.5074, lon: 0.1278}
var weatherData = {
  "Lat_Lon": "",
  "Description": "",
  "Tempurature": "",
  "Pressure": "",
  "Humidity": "",
  "Wind": ""
}

function processData(){
  var values
  if (this.id=="Seattle"){values = {lat:seattle.lat, lon:seattle.lon} }
  if (this.id=="London") {values = {lat:london.lat, lon:london.lon} }

  // serialize them into a query string
  let queryString = queryBuilder(values)
  getWeather(queryString, this.id)
}


function getWeather(queryString, currentAdress) {
  console.log("enter getWeather().."+ currentAdress);
  let request = new XMLHttpRequest()

  // starts talk to API - 3 params
  // request method, url, (optional) async flag (default true)
  let URLstring = apiURL + queryString + appid + units
  console.log("url: " + URLstring);

  request.open("GET", URLstring, true)

  // fires when the request is complete
  // long term - I want to update the DOM
  request.onload = function () {
    let quoteDiv = document.getElementById("list-container")
    let response = JSON.parse(request.response).body
    console.log(response)
    console.log(response.main.temp); // temp
    console.log(response.main.pressure); // pressure
    console.log(response.main.humidity); // humidity
    console.log(response.wind.speed); // wind speed
    console.log(response.weather[0].main) // cloud or rain
    console.log(response.weather[0].description) // cloud or rain
    console.log(response.coord.lat, response.coord.lon) // Lat/Lon

    // update new weather data to JSON weather obj
    weatherData.Lat_Lon = response.coord.lat + ", " + response.coord.lon
    weatherData.Description = response.weather[0].description
    weatherData.Tempurature = response.main.temp
    weatherData.Pressure = response.main.pressure
    weatherData.Humidity = response.main.humidity
    weatherData.Wind = response.wind.speed

    // insert weather data into DOM
    displayWeather(currentAdress)
  }

  // fires if something goes wrong
  request.error = function (errorObject) {
    console.log("bwoken :(")
    console.log(errorObject)
  }

  // send the request!
  request.send()
}

// insert text into DOM
function displayWeather(currentAdress) {
  console.log("enter displayWeather()..."+currentAdress);
  var cityText = document.getElementById('cityName');
  cityText.innerHTML = currentAdress

  var table = document.getElementById('myTable');
  table.innerHTML="" // clear out old data
  var count = 0
  for (key in weatherData) {
    console.log(key + " = " + weatherData[key]);
    var row = table.insertRow(count);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = key;
    cell2.innerHTML = weatherData[key];
    count +=1
  }
}

function queryBuilder(queryObj){
  let holder = []
  // loop through queryObj key value pairs
  for(let key in queryObj){
    // turn each one into "key=value"
    //let convert = `${encodeURIComponent(key)}=${encodeURIComponent(queryObj[key])}`
	  let convert = encodeURIComponent(key)+"="+encodeURIComponent(queryObj[key])

    // encodeURIComponent converts spaces and & to URI friendly values so we don't have to worry about them
    holder.push(convert)
  }
  // concatenate the pairs together, with & between
  let longString = holder.join("&")
  // prepend a ? to concatenated string
  //return `?${longString}`
  return "?"+ longString
}
