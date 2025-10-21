/**
 * ELS Visualization Engine for Torah Codes
 * Canvas-based matrix visualization with zoom, pan, and highlighting
 */

class ELSVisualizer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.text = '';
        this.textArray = [];
        this.results = [];
        
        // Matrix configuration
        this.matrixColumns = 50; // Default columns
        this.matrixRows = 0;     // Calculated based on text length
        
        // Visual properties
        this.cellSize = 16;
        this.cellPadding = 2;
        this.fontSize = 12;
        this.fontFamily = 'Noto Sans Hebrew, Arial, sans-serif';
        
        // Colors
        this.colors = {
            background: '#ffffff',
            text: '#333333',
            grid: '#e0e0e0',
            highlight: '#ff6b6b',
            highlight2: '#4ecdc4',
            highlight3: '#45b7d1',
            highlight4: '#96ceb4',
            selected: '#ffd93d'
        };
        
        // View state
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Highlighting
        this.highlightedPositions = new Map(); // position -> color
        this.selectedResult = null;
        
        // Mobile support
        this.isMobile = this.detectMobile();
        
        this.setupEventListeners();
        this.resizeCanvas();
    }

    /**
     * Set the text to visualize
     * @param {string} text - Hebrew text
     */
    setText(text) {
        this.text = HebrewUtils.normalizeText(text);
        this.textArray = HebrewUtils.textToLetterArray(this.text);
        this.calculateMatrixDimensions();
        this.render();
    }

    /**
     * Set ELS results to highlight
     * @param {ELSResult[]} results - Array of ELS results
     */
    setResults(results) {
        this.results = results;
        this.updateHighlights();
        this.render();
    }

    /**
     * Calculate matrix dimensions based on text length
     */
    calculateMatrixDimensions() {
        if (this.textArray.length === 0) {
            this.matrixRows = 0;
            return;
        }
        
        this.matrixRows = Math.ceil(this.textArray.length / this.matrixColumns);
        
        // Adjust canvas size
        const totalWidth = this.matrixColumns * (this.cellSize + this.cellPadding);
        const totalHeight = this.matrixRows * (this.cellSize + this.cellPadding);
        
        this.canvas.style.width = Math.min(totalWidth, 800) + 'px';
        this.canvas.style.height = Math.min(totalHeight, 600) + 'px';
    }

    /**
     * Update highlight positions based on current results
     */
    updateHighlights() {
        this.highlightedPositions.clear();
        
        this.results.forEach((result, index) => {
            const color = this.getResultColor(index);
            result.getPositions().forEach(position => {
                this.highlightedPositions.set(position, color);
            });
        });
    }

    /**
     * Get color for result index
     * @param {number} index - Result index
     * @returns {string} - Color code
     */
    getResultColor(index) {
        const colorKeys = ['highlight', 'highlight2', 'highlight3', 'highlight4'];
        return this.colors[colorKeys[index % colorKeys.length]];
    }

    /**
     * Render the complete visualization
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.textArray.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        this.ctx.save();
        
        // Apply zoom and pan transformations
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(this.offsetX, this.offsetY);
        
        // Render grid and text
        this.renderGrid();
        this.renderText();
        this.renderHighlights();
        
        this.ctx.restore();
        
        // Render UI elements (not affected by zoom/pan)
        this.renderUI();
    }

    /**
     * Render empty state message
     */
    renderEmptyState() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'טען טקסט לתצוגה',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    /**
     * Render the grid background
     */
    renderGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        const totalWidth = this.matrixColumns * (this.cellSize + this.cellPadding);
        const totalHeight = this.matrixRows * (this.cellSize + this.cellPadding);
        
        // Vertical lines
        for (let i = 0; i <= this.matrixColumns; i++) {
            const x = i * (this.cellSize + this.cellPadding);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, totalHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= this.matrixRows; i++) {
            const y = i * (this.cellSize + this.cellPadding);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(totalWidth, y);
            this.ctx.stroke();
        }
    }

    /**
     * Render Hebrew text in matrix format
     */
    renderText() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let i = 0; i < this.textArray.length; i++) {
            const row = Math.floor(i / this.matrixColumns);
            const col = i % this.matrixColumns;
            
            const x = col * (this.cellSize + this.cellPadding) + this.cellSize / 2;
            const y = row * (this.cellSize + this.cellPadding) + this.cellSize / 2;
            
            this.ctx.fillText(this.textArray[i], x, y);
        }
    }

    /**
     * Render highlighted positions
     */
    renderHighlights() {
        for (const [position, color] of this.highlightedPositions) {
            if (position >= this.textArray.length) continue;
            
            const row = Math.floor(position / this.matrixColumns);
            const col = position % this.matrixColumns;
            
            const x = col * (this.cellSize + this.cellPadding);
            const y = row * (this.cellSize + this.cellPadding);
            
            // Highlight background
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // Highlight border
            this.ctx.globalAlpha = 1.0;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Render UI elements (zoom controls, legend, etc.)
     */
    renderUI() {
        // Zoom level indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 30);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`זום: ${Math.round(this.zoom * 100)}%`, 20, 30);
        
        // Legend for results
        if (this.results.length > 0) {
            this.renderLegend();
        }
    }

    /**
     * Render legend for highlighted results
     */
    renderLegend() {
        const legendX = this.canvas.width - 200;
        const legendY = 10;
        const legendWidth = 180;
        const legendHeight = Math.min(this.results.length * 25 + 20, 200);
        
        // Legend background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
        
        // Legend title
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('תוצאות:', legendX + legendWidth - 10, legendY + 15);
        
        // Legend items
        this.ctx.font = '11px Noto Sans Hebrew, Arial';
        const maxItems = Math.floor((legendHeight - 30) / 25);
        const itemsToShow = Math.min(this.results.length, maxItems);
        
        for (let i = 0; i < itemsToShow; i++) {
            const result = this.results[i];
            const color = this.getResultColor(i);
            const itemY = legendY + 30 + (i * 25);
            
            // Color indicator
            this.ctx.fillStyle = color;
            this.ctx.fillRect(legendX + 10, itemY - 8, 15, 15);
            
            // Result text
            this.ctx.fillStyle = '#333';
            this.ctx.fillText(
                `${result.searchTerm} (${result.skipDistance})`,
                legendX + legendWidth - 10,
                itemY
            );
        }
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3.0);
        this.render();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.2);
        this.render();
    }

    /**
     * Reset view to default
     */
    resetView() {
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    }

    /**
     * Set matrix columns
     * @param {number} columns - Number of columns
     */
    setMatrixColumns(columns) {
        this.matrixColumns = Math.max(10, Math.min(columns, 200));
        this.calculateMatrixDimensions();
        this.render();
    }

    /**
     * Highlight specific result
     * @param {ELSResult} result - Result to highlight
     */
    highlightResult(result) {
        this.selectedResult = result;
        this.highlightedPositions.clear();
        
        if (result) {
            result.getPositions().forEach(position => {
                this.highlightedPositions.set(position, this.colors.selected);
            });
        } else {
            this.updateHighlights();
        }
        
        this.render();
    }

    /**
     * Export visualization as image
     * @param {string} format - Image format ('png', 'jpeg')
     * @returns {string} - Data URL
     */
    exportImage(format = 'png') {
        return this.canvas.toDataURL(`image/${format}`);
    }

    /**
     * Setup event listeners for interaction
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        this.offsetX += deltaX / this.zoom;
        this.offsetY += deltaY / this.zoom;
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        this.render();
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    /**
     * Handle wheel event for zooming
     */
    handleWheel(event) {
        event.preventDefault();
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.2, Math.min(3.0, this.zoom * zoomFactor));
        
        // Zoom towards mouse position
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const worldX = (mouseX / this.zoom) - this.offsetX;
        const worldY = (mouseY / this.zoom) - this.offsetY;
        
        this.zoom = newZoom;
        
        this.offsetX = (mouseX / this.zoom) - worldX;
        this.offsetY = (mouseY / this.zoom) - worldY;
        
        this.render();
    }

    /**
     * Handle touch start event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Single touch - pan
            this.isDragging = true;
            this.lastMouseX = event.touches[0].clientX;
            this.lastMouseY = event.touches[0].clientY;
        }
    }

    /**
     * Handle touch move event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1 && this.isDragging) {
            // Single touch - pan
            const deltaX = event.touches[0].clientX - this.lastMouseX;
            const deltaY = event.touches[0].clientY - this.lastMouseY;
            
            this.offsetX += deltaX / this.zoom;
            this.offsetY += deltaY / this.zoom;
            
            this.lastMouseX = event.touches[0].clientX;
            this.lastMouseY = event.touches[0].clientY;
            
            this.render();
        }
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.isDragging = false;
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = Math.min(rect.height, 600);
        
        this.render();
    }

    /**
     * Detect if device is mobile
     * @returns {boolean} - True if mobile device
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Get canvas statistics
     * @returns {Object} - Canvas statistics
     */
    getStats() {
        return {
            textLength: this.textArray.length,
            matrixColumns: this.matrixColumns,
            matrixRows: this.matrixRows,
            zoom: this.zoom,
            offset: { x: this.offsetX, y: this.offsetY },
            highlightedPositions: this.highlightedPositions.size,
            resultsCount: this.results.length,
            canvasSize: { 
                width: this.canvas.width, 
                height: this.canvas.height 
            }
        };
    }

    /**
     * Update visualization colors
     * @param {Object} newColors - New color scheme
     */
    updateColors(newColors) {
        this.colors = { ...this.colors, ...newColors };
        this.render();
    }

    /**
     * Animate to specific position
     * @param {number} position - Text position to center on
     */
    animateToPosition(position) {
        if (position >= this.textArray.length) return;
        
        const row = Math.floor(position / this.matrixColumns);
        const col = position % this.matrixColumns;
        
        const targetX = -(col * (this.cellSize + this.cellPadding)) + this.canvas.width / 2;
        const targetY = -(row * (this.cellSize + this.cellPadding)) + this.canvas.height / 2;
        
        // Simple animation
        const animate = () => {
            const diffX = targetX - this.offsetX;
            const diffY = targetY - this.offsetY;
            
            if (Math.abs(diffX) < 1 && Math.abs(diffY) < 1) {
                this.offsetX = targetX;
                this.offsetY = targetY;
                this.render();
                return;
            }
            
            this.offsetX += diffX * 0.1;
            this.offsetY += diffY * 0.1;
            this.render();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ELSVisualizer;
}