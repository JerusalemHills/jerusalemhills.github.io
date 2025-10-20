// Hebrew Virtual Keyboard - Initialize after header loads
(function() {
  'use strict';

  function initHebrewKeyboard() {
    const container = document.getElementById('hebrew-keyboard-container');
    const keys = document.querySelectorAll('.key');
    let isKeyboardActive = false;
    let currentInput = null;

    function toggleKeyboard(e) {
      e.preventDefault();
      isKeyboardActive = !isKeyboardActive;
      container.classList.toggle('active');

      // Try to find search input (may be in header, loaded dynamically)
      const searchInput = document.querySelector('.search-input');

      if (isKeyboardActive && searchInput) {
        searchInput.focus();
        currentInput = searchInput;
      } else {
        currentInput = null;
      }
    }

    function closeKeyboard() {
      isKeyboardActive = false;
      container.classList.remove('active');
      currentInput = null;
    }

    // Attach toggle buttons (they may not exist yet if header hasn't loaded)
    function attachToggleButtons() {
      const toggleBtn = document.getElementById('keyboard-toggle-nav');
      const toggleBtnMobile = document.getElementById('keyboard-toggle-mobile');
      const closeBtn = document.getElementById('keyboard-close');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleKeyboard);
      }
      if (toggleBtnMobile) {
        toggleBtnMobile.addEventListener('click', toggleKeyboard);
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', closeKeyboard);
      }
    }

    // Auto-focus search input when typing in keyboard
    document.addEventListener('focusin', function(e) {
      if (isKeyboardActive && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        currentInput = e.target;
      }
    });

    // Handle keyboard key clicks
    keys.forEach(key => {
      key.addEventListener('click', function() {
        if (!currentInput) {
          const searchInput = document.querySelector('.search-input');
          if (searchInput) {
            searchInput.focus();
            currentInput = searchInput;
          } else {
            return;
          }
        }

        const char = this.getAttribute('data-char');
        const action = this.getAttribute('data-action');

        if (action === 'backspace') {
          const cursorPos = currentInput.selectionStart;
          if (cursorPos > 0) {
            currentInput.value = currentInput.value.substring(0, cursorPos - 1) + currentInput.value.substring(cursorPos);
            currentInput.selectionStart = currentInput.selectionEnd = cursorPos - 1;
          }
        } else if (action === 'enter') {
          if (currentInput.tagName === 'TEXTAREA') {
            const cursorPos = currentInput.selectionStart;
            currentInput.value = currentInput.value.substring(0, cursorPos) + '\n' + currentInput.value.substring(cursorPos);
            currentInput.selectionStart = currentInput.selectionEnd = cursorPos + 1;
          }
        } else if (char) {
          const cursorPos = currentInput.selectionStart;
          currentInput.value = currentInput.value.substring(0, cursorPos) + char + currentInput.value.substring(cursorPos);
          currentInput.selectionStart = currentInput.selectionEnd = cursorPos + 1;
        }
        currentInput.focus();
      });
    });

    // Close keyboard with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isKeyboardActive) {
        closeKeyboard();
      }
    });

    // Attach toggle buttons immediately
    attachToggleButtons();

    // Also watch for header changes (in case it loads late)
    setTimeout(attachToggleButtons, 500);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHebrewKeyboard);
  } else {
    initHebrewKeyboard();
  }

  // Expose init function globally for manual initialization after header load
  window.initHebrewKeyboard = initHebrewKeyboard;
})();
