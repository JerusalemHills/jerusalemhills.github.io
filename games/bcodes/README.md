# Torah Codes - ELS Search Application

A client-side JavaScript implementation of Torah codes (Equidistant Letter Sequences) search, integrated with the Jerusalem Hills platform.

## Overview

This application allows users to search for ELS patterns in Hebrew biblical texts directly in their browser. It's based on the methodology from the [torahcodes_fork repository](https://github.com/roni762583/torahcodes_fork) but reimplemented as a modern web application.

## Features

### Core Functionality
- **ELS Search**: Find Equidistant Letter Sequences in Torah texts
- **Hebrew Text Processing**: Normalize and validate Hebrew input
- **Multiple Text Sources**: Search across Genesis, Exodus, Leviticus, Numbers, Deuteronomy, or the complete Torah
- **Real-time Progress**: Visual progress indicators during search
- **Interactive Visualization**: Canvas-based matrix display with zoom and pan

### Hebrew Language Support
- **Hebrew Keyboard**: Virtual on-screen Hebrew keyboard
- **RTL Display**: Proper right-to-left text direction
- **Text Normalization**: Automatic removal of vowels and punctuation
- **Gematria Calculations**: Multiple gematria systems (Standard, Mispar Katan, Ordinal, Atbash)

### Advanced Features
- **Pattern Analysis**: Statistical analysis of found patterns
- **Results Export**: Download results as JSON
- **Caching**: Intelligent caching of text data and search results
- **Mobile Responsive**: Touch-friendly interface for mobile devices

## Architecture

### Data Source
Text data is loaded directly from the [torahcodes_fork repository](https://github.com/roni762583/torahcodes_fork) using the Leningrad Codex JSON files:
- `text_leningrad_1genesis.json`
- `text_leningrad_2exodus.json`
- `text_leningrad_3leviticus.json`
- `text_leningrad_4numbers.json`
- `text_leningrad_5deuteronomy.json`

### File Structure
```
/games/bcodes/
├── bcodes.html              # Main interface
├── css/
│   └── bcodes.css          # Hebrew-optimized styling
├── js/
│   ├── hebrew-utils.js     # Hebrew text processing
│   ├── gematria.js        # Gematria calculations
│   ├── torah-data-loader.js # Data loading from repository
│   ├── els-objects.js     # Data structures
│   ├── els-engine.js      # Core search algorithm
│   ├── els-visualizer.js  # Canvas visualization
│   └── bcodes-main.js     # Main application controller
├── data/
│   └── genesis-real.json  # Sample data structure
├── IMPLEMENTATION_PLAN.md  # Detailed implementation plan
└── README.md              # This file
```

### Core Classes

#### `TorahDataLoader`
- Fetches Hebrew text data from the torahcodes_fork repository
- Supports both individual books and complete Torah
- Implements caching for performance
- Processes Leningrad Codex JSON format

#### `ELSEngine`
- Core search algorithm implementation
- Supports forward and backward searches
- Progress tracking and cancellation
- Result caching and validation

#### `ELSVisualizer`
- Canvas-based matrix visualization
- Interactive zoom, pan, and highlighting
- Mobile-responsive touch controls
- Export visualization as image

#### `HebrewUtils`
- Text normalization and validation
- Hebrew character processing
- Letter frequency analysis
- Text statistics generation

#### `Gematria`
- Multiple gematria calculation methods
- Hebrew letter-to-number mapping
- Numerical pattern analysis
- Atbash cipher support

## Usage

### Basic Search
1. Enter a Hebrew search term using the virtual keyboard or direct input
2. Select the text source (individual book or complete Torah)
3. Set the maximum skip distance (1-1000)
4. Click "חפש" (Search) to begin

### Search Results
- Results are sorted by skip distance (smallest first)
- Click on any result to highlight it in the visualization
- View detailed statistics including gematria values
- Export results as JSON for further analysis

### Visualization
- Interactive matrix display shows the text in grid format
- Found ELS patterns are highlighted in different colors
- Use zoom controls to examine details
- Pan by dragging or use touch gestures on mobile

## Integration with Jerusalem Hills

The Torah codes application is fully integrated with the Jerusalem Hills platform:
- Consistent styling and navigation
- Responsive design matching the site theme
- Added to the games directory and main games page
- SEO-optimized for Hebrew content search

## Performance Considerations

### Optimization Strategies
- **Chunked Processing**: Large searches are broken into manageable chunks
- **Web Workers**: Intensive computations run off the main thread (planned)
- **Progressive Loading**: Text data is loaded on-demand
- **Result Caching**: Prevents redundant calculations
- **Memory Management**: Automatic cleanup of large data structures

### Browser Compatibility
- Modern browsers supporting ES6+ features
- Canvas API support required for visualization
- UTF-8 support for Hebrew text display
- Local storage for caching (optional)

## Technical Specifications

### Text Processing
- **Normalization**: Removes vowels, punctuation, and non-Hebrew characters
- **Validation**: Ensures Hebrew-only input with proper length limits
- **Encoding**: UTF-8 throughout the application
- **Direction**: RTL display for Hebrew text

### Search Algorithm
- **Formula**: n, (n + d), (n + 2d), (n + 3d)... (n + (k-1)d)
- **Parameters**: n = start position, d = skip distance, k = term length
- **Efficiency**: O(N × M × D) where N = text length, M = term length, D = max skip distance
- **Memory**: Optimized for client-side constraints

### Gematria Systems
- **Standard**: Traditional Hebrew letter values (א=1, ב=2, etc.)
- **Mispar Katan**: Reduced values (modulo 9)
- **Ordinal**: Position in alphabet (א=1, ב=2, ..., ת=22)
- **Atbash**: Reverse alphabet cipher

## Development

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for loading Torah texts
- Hebrew font support (Noto Sans Hebrew included)

### Local Development
1. Clone or download the files
2. Serve from a web server (required for CORS)
3. Open `bcodes.html` in your browser
4. The application will automatically load Genesis by default

### Testing
- Test with common Hebrew words like "משיח" (Messiah), "אמת" (Truth)
- Verify text loading from the repository
- Check responsive design on mobile devices
- Test Hebrew keyboard functionality

## Future Enhancements

### Planned Features
- **Multi-term Search**: Search for multiple terms simultaneously
- **Pattern Recognition**: Identify common ELS patterns
- **Statistical Analysis**: Compare results against random text
- **Community Features**: Share interesting findings
- **Advanced Visualization**: 3D matrix representation
- **Voice Input**: Hebrew speech recognition

### Performance Improvements
- **Web Workers**: Move search computation to background threads
- **Progressive Web App**: Offline functionality with service workers
- **Compression**: Optimize text data storage and transmission
- **Indexing**: Pre-computed indices for faster searches

## Contributing

This implementation is part of the Jerusalem Hills platform. Contributions should focus on:
- Performance optimization
- Mobile user experience
- Hebrew language accuracy
- Search algorithm improvements
- Documentation and examples

## License

This application uses Hebrew texts from the public domain Leningrad Codex. The implementation code follows the same license as the Jerusalem Hills platform.

## Acknowledgments

- Based on research and methodology from the torahcodes_fork repository
- Hebrew text data from the Leningrad Codex
- Font support from Google Fonts (Noto Sans Hebrew)
- Canvas visualization techniques adapted from modern web standards

## Support

For issues or questions related to the Torah codes application:
1. Check the browser console for error messages
2. Verify internet connection for text loading
3. Ensure browser supports modern JavaScript features
4. Test with a simple Hebrew word to isolate issues

The application includes fallback mechanisms and will use sample text if the repository is unavailable.