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


// document.addEventListener("DOMContentLoaded", async () => {
//     const hebrewDateElement = document.getElementById("hebrew-date");
  
//     if (!hebrewDateElement) {
//       console.error("Element with ID 'hebrew-date' not found");
//       return;
//     }
  
//     try {
//       const response = await fetch("https://www.hebcal.com/converter?cfg=json&gy=2025&gm=1&gd=10&g2h=1");
//       if (!response.ok) {
//         throw new Error("Failed to fetch Hebrew date");
//       }
  
//       const data = await response.json();
//       if (data && data.hebrew) {
//         hebrewDateElement.textContent = `Hebrew Date: ${data.hebrew}`;
//       } else {
//         hebrewDateElement.textContent = "Hebrew Date: Unavailable";
//       }
//     } catch (error) {
//       console.error("Error fetching Hebrew date:", error);
//       hebrewDateElement.textContent = "Hebrew Date: Error";
//     }
//   });
  

// document.addEventListener("DOMContentLoaded", async () => {
//   const hebrewDateElement = document.getElementById("hebrew-date");

//   if (!hebrewDateElement) {
//     console.error("Element with ID 'hebrew-date' not found");
//     return;
//   }

//   try {
//     // Fetch the Hebrew date
//     const hebcalResponse = await fetch("https://www.hebcal.com/converter?cfg=json&gy=2025&gm=1&gd=10&g2h=1");
//     if (!hebcalResponse.ok) {
//       throw new Error("Failed to fetch Hebrew date");
//     }
//     const hebcalData = await hebcalResponse.json();
//     const hebrewDate = hebcalData?.hebrew || "Unavailable";

//     // Fetch the current time in Jerusalem
//     const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jerusalem");
//     if (!timeResponse.ok) {
//       throw new Error("Failed to fetch Jerusalem time");
//     }
//     const timeData = await timeResponse.json();
//     const jerusalemTime = new Date(timeData.datetime).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     // Update the Hebrew date element with the time and date
//     hebrewDateElement.textContent = `ACTUAL TIME IN JERUSALEM: ${jerusalemTime} ${hebrewDate}`;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     hebrewDateElement.textContent = "ACTUAL TIME IN JERUSALEM: Error fetching data";
//   }
// });


document.addEventListener("DOMContentLoaded", async () => {
  const hebrewDateElement = document.getElementById("hebrew-date");

  if (!hebrewDateElement) {
    console.error("Element with ID 'hebrew-date' not found");
    return;
  }

  try {
    // Fetch the Hebrew date
    const hebcalResponse = await fetch("https://www.hebcal.com/converter?cfg=json&gy=2025&gm=1&gd=10&g2h=1");
    if (!hebcalResponse.ok) {
      throw new Error("Failed to fetch Hebrew date");
    }
    const hebcalData = await hebcalResponse.json();
    const hebrewDate = hebcalData?.hebrew || "Unavailable";

    // Fetch the current time in Jerusalem
    const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jerusalem");
    if (!timeResponse.ok) {
      throw new Error("Failed to fetch Jerusalem time");
    }
    const timeData = await timeResponse.json();
    const jerusalemDateTime = new Date(timeData.datetime);

    // Format time as 24-hour clock with leading zeros
    const hours = jerusalemDateTime.getHours().toString().padStart(2, "0");
    const minutes = jerusalemDateTime.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes} PM`;

    // Format the full date string
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const formattedDate = jerusalemDateTime.toLocaleDateString("en-US", options);

    // Update the Hebrew date element
    hebrewDateElement.textContent = `${formattedTime} ${hebrewDate}\nJerusalem, Israel • ${formattedDate}`;
  } catch (error) {
    console.error("Error fetching data:", error);
    hebrewDateElement.textContent = "Error fetching data for Jerusalem time and Hebrew date.";
  }
});
