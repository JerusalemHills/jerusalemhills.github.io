// hebcal.js - Implementing Hebrew date and Jerusalem time using Hebcal's JavaScript API

// Simple Hebrew calendar implementation
const HebrewCalendar = {
    months: ['Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II'],
    
    // Get Hebrew date with day of week (using Jerusalem timezone)
    getHebrewDate() {
        const now = new Date();
        const hebrewFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jerusalem'
        });

        return hebrewFormatter.format(now);
    },
    
    // Get Jerusalem time with AM/PM
    getJerusalemTime() {
        const options = {
            timeZone: 'Asia/Jerusalem',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date().toLocaleTimeString('en-US', options);
    },

    // Get English day of week
    getEnglishDayOfWeek() {
        const options = {
            timeZone: 'Asia/Jerusalem',
            weekday: 'long'
        };
        return new Date().toLocaleDateString('en-US', options);
    },
    
    // Update the Hebrew date display
    updateHebrewDate() {
        const dateElement = document.getElementById('hebrew-date');
        if (dateElement) {
            const hebrewDate = this.getHebrewDate();
            const jerusalemTime = this.getJerusalemTime();
            const englishDay = this.getEnglishDayOfWeek();
            const gregorianDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Jerusalem'
            });
            
            dateElement.innerHTML = `
                <div class="hebrew-date-text">${hebrewDate}</div>
                <div class="greg-date">${englishDay}, ${gregorianDate}</div>
                <div class="hebrew-date-text jerusalem-time">Jerusalem Time: ${jerusalemTime}</div>
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
