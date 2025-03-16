// hebcal.js - Implementing Hebrew date and Jerusalem time using Hebcal's JavaScript API

// Simple Hebrew calendar implementation
const HebrewCalendar = {
    months: ['Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II'],
    
    // Get Hebrew date
    getHebrewDate() {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        
        return formatter.format(now);
    },
    
    // Get Jerusalem time
    getJerusalemTime() {
        const options = {
            timeZone: 'Asia/Jerusalem',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        return new Date().toLocaleTimeString('en-US', options);
    },
    
    // Update the Hebrew date display
    updateHebrewDate() {
        const dateElement = document.getElementById('hebrew-date');
        if (dateElement) {
            const hebrewDate = this.getHebrewDate();
            const jerusalemTime = this.getJerusalemTime();
            const gregorianDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            dateElement.innerHTML = `
                <div class="jerusalem-time">Jerusalem Time: ${jerusalemTime}</div>
                <div class="hebrew-date-text">${hebrewDate}</div>
                <div class="greg-date">${gregorianDate}</div>
            `;
        }
    }
};

// Update Hebrew date every minute
setInterval(() => HebrewCalendar.updateHebrewDate(), 60000);

// Initial update
document.addEventListener('DOMContentLoaded', () => {
    HebrewCalendar.updateHebrewDate();
});
