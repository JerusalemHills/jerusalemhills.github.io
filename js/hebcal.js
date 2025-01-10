// hebcal.js

// Fetching Hebrew date and time from Hebcal API and displaying it
// fetch("https://www.hebcal.com/hebcal?v=1&cfg=json&gs=1")
//   .then(response => response.json())
//   .then(data => {
//     const hebrewDate = data.hebrew;
//     const dateElement = document.getElementById('hebrew-date');
//     dateElement.innerHTML = `Hebrew Date: ${hebrewDate}`;
//   })
//   .catch(error => console.log("Error fetching Hebrew date:", error));
document.addEventListener("DOMContentLoaded", async () => {
    const hebrewDateElement = document.getElementById("hebrew-date");
  
    if (!hebrewDateElement) {
      console.error("Element with ID 'hebrew-date' not found");
      return;
    }
  
    try {
      const response = await fetch("https://www.hebcal.com/converter?cfg=json&gy=2025&gm=1&gd=10&g2h=1");
      if (!response.ok) {
        throw new Error("Failed to fetch Hebrew date");
      }
  
      const data = await response.json();
      if (data && data.hebrew) {
        hebrewDateElement.textContent = `Hebrew Date: ${data.hebrew}`;
      } else {
        hebrewDateElement.textContent = "Hebrew Date: Unavailable";
      }
    } catch (error) {
      console.error("Error fetching Hebrew date:", error);
      hebrewDateElement.textContent = "Hebrew Date: Error";
    }
  });
  