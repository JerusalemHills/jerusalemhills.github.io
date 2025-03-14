// hebcal.js - Implementing Hebrew date and Jerusalem time using Hebcal's JavaScript API

document.addEventListener("DOMContentLoaded", () => {
  const hebrewDateElement = document.getElementById("hebrew-date");

  if (!hebrewDateElement) {
    console.error("Element with ID 'hebrew-date' not found");
    return;
  }

  try {
    // Check if Hebcal is available
    if (typeof window.Hebcal === 'undefined') {
      console.error("Hebcal library not loaded");
      hebrewDateElement.textContent = "Hebrew date service unavailable.";
      return;
    }

    // Setup for Jerusalem time zone
    const jerusalemTZ = "Asia/Jerusalem";
    
    // Create a function to update the date and time
    function updateDateTime() {
      try {
        // Get current date in Jerusalem time zone
        const now = new Date();
        
        // Format Jerusalem time with AM/PM
        const formattedTime = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit", // Adding seconds for more accurate live updates
          hour12: true,
          timeZone: jerusalemTZ
        });
        
        // Format the Gregorian date
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: jerusalemTZ };
        const formattedDate = now.toLocaleDateString("en-US", options);
        
        // Get Jerusalem date
        const jerusalemDate = new Date(now.toLocaleString("en-US", {timeZone: jerusalemTZ}));
        const year = jerusalemDate.getFullYear();
        const month = jerusalemDate.getMonth() + 1; // JavaScript months are 0-indexed
        const day = jerusalemDate.getDate();
        
        // Create a new HDate object with the correct date
        const hDate = new window.Hebcal.HDate(day, month, year);
        
        // Get formatted Hebrew date
        const hebrewDateFormatted = hDate.render('h');
        
        // Update the Hebrew date element with all information
        hebrewDateElement.innerHTML = `
          <div class="jerusalem-time">${formattedTime}</div>
          <div class="hebrew-date-text">${hebrewDateFormatted}</div>
          <div class="greg-date">Jerusalem, Israel • ${formattedDate}</div>
        `;
      } catch (innerError) {
        console.error("Error in updateDateTime:", innerError);
        hebrewDateElement.textContent = "Error updating Jerusalem time and Hebrew date.";
      }
    }
    
    // Initial update
    updateDateTime();
    
    // Update every second for a more live experience
    setInterval(updateDateTime, 1000);
    
  } catch (error) {
    console.error("Error with Hebrew date setup:", error);
    hebrewDateElement.textContent = "Error displaying Jerusalem time and Hebrew date.";
  }
});
