function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  function injectHTML(list) {
    console.log('fired injectHTML');
    const target = document.querySelector('#station_list');
    target.innerHTML = '';
    list.forEach((item) => {
      const str = `<li>${item.station_name}</li>`
      target.innerHTML += str
    });
  }

/* A quick filter that will return something based on a matching input */
function filterList(list, query) {
  return list.filter((item)=> {
    const lowerCaseName = item.station_name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  })
  /*
    Using the .filter array method, 
    return a list that is filtered by comparing the item name in lower case
    to the query in lower case
    Ask the TAs if you need help with this
  */
}

function cutRestaurantList(list){
  console.log('fired cut List');
  const range = [...Array(15).keys()];
  return newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length -1);
    return list[index]
  })
}

function initMap(){
  const carto = L.map('map').setView([38.94, -76.94], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);

  return carto;
}


function markerPlace(array, map){
  console.log('Array for Markers', array);

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  array.forEach((item) => {
      console.log('markerPlace', item);
      const { latitude, longitude } = item.location_1;

      L.marker([latitude, longitude]).addTo(map);
  })
}

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form');


  //const filterButton = document.querySelector('#filter');
  const loadDataButton = document.querySelector('#data_load');
  const clearDataButton = document.querySelector('#data_clear');
  const generateListButton = document.querySelector('#generate');
  const textField = document.querySelector('#fire');
  
  const loadAnimation = document.querySelector('#data_load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');


  const carto = initMap();

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if(parsedData?.length > 0){
    generateListButton.classList.remove('hidden');
  }

  let currentList = []; // this is "scoped" to the main event function
  
  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */
  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    
    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('Loading Data'); 

    loadAnimation.style.display = 'inline-block';

    const results = await fetch('https://data.princegeorgescountymd.gov/resource/bzf2-94qx.json');

    // This changes the response from the GET into data we can use - an "object"
    const storedList = await results.json();
    localStorage.setItem('storedData', JSON.stringify(storedList));
    
    parsedData = storedList;

    if(parsedData?.length > 0){
      generateListButton.classList.remove('hidden');
    }

    loadAnimation.style.display = 'none';
    //console.table(storedList);
  });

  generateListButton.addEventListener('click', (event)=> {
    console.log('generate new list');
    currentList = cutRestaurantList(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, carto);
  })

  textField.addEventListener('input', (event) => {
      console.log('input', event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      markerPlace(newList, carto);
  })

  clearDataButton.addEventListener("click", (event)=> {
    console.log('clear browser data');
    localStorage.clear();
    console.log('localStorageCheck', localStorage.getItem('storedData'));
  })

}

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests