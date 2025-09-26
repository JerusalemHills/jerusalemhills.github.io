/**
 * Jerusalem Time & Weather Widget
 * ================================
 * Displays live Jerusalem time and weather information
 */

class JerusalemWidget {
    constructor() {
        this.apiKey = 'demo'; // Replace with actual API key for production
        this.jerusalemTimezone = 'Asia/Jerusalem';
        this.updateInterval = 1000; // Update time every second
        this.weatherInterval = 600000; // Update weather every 10 minutes

        this.init();
    }

    init() {
        this.createWidget();
        this.startClock();
        this.fetchWeather();

        // Update weather periodically
        setInterval(() => this.fetchWeather(), this.weatherInterval);
    }

    createWidget() {
        const widgetHTML = `
            <div class="jerusalem-widget" id="jerusalemWidget">
                <div class="widget-header">
                    <span>🕊️</span>
                    <span>Jerusalem</span>
                </div>
                <div class="jerusalem-time" id="jerusalemTime">--:--:--</div>
                <div class="jerusalem-date" id="jerusalemDate">Loading...</div>
                <div class="jerusalem-weather" id="jerusalemWeather">
                    <span class="weather-icon">☀️</span>
                    <span class="weather-temp">--°C</span>
                    <span class="weather-desc">Loading...</span>
                </div>
            </div>
        `;

        // Add widget to page if container exists
        const container = document.getElementById('widgetContainer');
        if (container) {
            container.innerHTML = widgetHTML;
        }
    }

    startClock() {
        const updateTime = () => {
            const now = new Date();
            const jerusalemTime = new Date(now.toLocaleString("en-US", {timeZone: this.jerusalemTimezone}));

            // Format time
            const hours = jerusalemTime.getHours().toString().padStart(2, '0');
            const minutes = jerusalemTime.getMinutes().toString().padStart(2, '0');
            const seconds = jerusalemTime.getSeconds().toString().padStart(2, '0');

            // Format date
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const dateStr = jerusalemTime.toLocaleDateString('en-US', options);

            // Hebrew date (simplified - would need Hebrew calendar library for accuracy)
            const hebrewMonths = [
                'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
                'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
            ];

            // Update DOM
            const timeElement = document.getElementById('jerusalemTime');
            const dateElement = document.getElementById('jerusalemDate');

            if (timeElement) {
                timeElement.textContent = `${hours}:${minutes}:${seconds}`;
            }

            if (dateElement) {
                dateElement.textContent = dateStr;
            }
        };

        updateTime();
        setInterval(updateTime, this.updateInterval);
    }

    async fetchWeather() {
        // Using mock data for demo - replace with actual API call
        const mockWeather = this.getMockWeather();
        this.updateWeatherDisplay(mockWeather);

        /* Production code with OpenWeatherMap API:
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=Jerusalem&appid=${this.apiKey}&units=metric`
            );
            const data = await response.json();
            this.updateWeatherDisplay({
                temp: Math.round(data.main.temp),
                description: data.weather[0].main,
                icon: this.getWeatherIcon(data.weather[0].icon)
            });
        } catch (error) {
            console.error('Weather fetch error:', error);
        }
        */
    }

    getMockWeather() {
        // Simulate different weather conditions based on time
        const hour = new Date().getHours();
        const conditions = [
            { temp: 28, description: 'Sunny', icon: '☀️' },
            { temp: 24, description: 'Partly Cloudy', icon: '⛅' },
            { temp: 22, description: 'Cloudy', icon: '☁️' },
            { temp: 18, description: 'Clear Night', icon: '🌙' }
        ];

        if (hour >= 6 && hour < 12) return conditions[0];
        if (hour >= 12 && hour < 17) return conditions[1];
        if (hour >= 17 && hour < 20) return conditions[2];
        return conditions[3];
    }

    updateWeatherDisplay(weather) {
        const weatherElement = document.getElementById('jerusalemWeather');
        if (weatherElement) {
            weatherElement.innerHTML = `
                <span class="weather-icon">${weather.icon}</span>
                <span class="weather-temp">${weather.temp}°C</span>
                <span class="weather-desc">${weather.description}</span>
            `;
        }
    }

    getWeatherIcon(code) {
        const icons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return icons[code] || '☀️';
    }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new JerusalemWidget();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JerusalemWidget;
}