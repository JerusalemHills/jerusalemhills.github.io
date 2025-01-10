// hebcal.js

// Fetching Hebrew date and time from Hebcal API and displaying it
fetch("https://www.hebcal.com/hebcal?v=1&cfg=json&gs=1")
  .then(response => response.json())
  .then(data => {
    const hebrewDate = data.hebrew;
    const dateElement = document.getElementById('hebrew-date');
    dateElement.innerHTML = `Hebrew Date: ${hebrewDate}`;
  })
  .catch(error => console.log("Error fetching Hebrew date:", error));
