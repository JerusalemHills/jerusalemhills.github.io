// Mapping of final letters to non-final forms
const finalToNonFinal = {
    'ם': 'מ',
    'ן': 'נ',
    'ץ': 'צ',
    'ף': 'פ',
    'ך': 'כ'
};

let isRunning = false;
let results = [];

// Function to add a new input box
function addInputBox() {
    const container = document.getElementById("input-container");
    const row = document.createElement("div");
    row.className = "input-row";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter text";

    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.onclick = addInputBox;

    const removeButton = document.createElement("button");
    removeButton.textContent = "-";
    removeButton.onclick = () => container.removeChild(row);

    row.appendChild(input);
    row.appendChild(addButton);
    row.appendChild(removeButton);
    container.appendChild(row);
}

// Function to update the status indicator
function updateStatusIndicator(status) {
    const indicator = document.getElementById("status-indicator");
    indicator.innerHTML = `Status: <span class="${status ? 'running' : 'stopped'}">${status ? 'Running' : 'Stopped'}</span>`;
}

// Function to transform final letters to their non-final forms
function transformFinalLetters(input) {
    return input.replace(/[םןץףך]/g, char => finalToNonFinal[char]);
}

// Function to fetch a simple definition (simulating API call)
async function searchWiktionary(term) {
    const url = `https://he.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(term)}&prop=extracts&format=json&origin=*`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const page = Object.values(data.query.pages)[0];

        // Check if the term exists in the dictionary
        if (page.missing) {
            return null; // Term not found
        }

        // Extract and clean up the definition
        const extract = page.extract || "";
        const parser = new DOMParser();
        const doc = parser.parseFromString(extract, "text/html");
        const definition = doc.body.textContent.split('.')[0].trim(); // Simple first-line definition
        return definition || null;
    } catch (error) {
        console.error("Error fetching data from Wiktionary:", error);
        return null;
    }
}

// Function to generate permutations
async function generatePermutations(inputChars, skipLengths, callback) {
    const len = inputChars.length;

    for (let length = 2; length <= len; length++) {
        if (skipLengths.includes(length)) continue;

        const perms = permute(inputChars, length);

        for (const perm of perms) {
            if (!isRunning) return;

            const definition = await searchWiktionary(perm);
            if (definition) {
                // Check if the result already exists to avoid duplicates
                const resultText = `${perm}: ${definition}`;
                if (!results.includes(resultText)) {
                    results.push(resultText);
                    callback(perm, definition);
                }
            }
        }
    }
}


// Helper function to generate permutations
function permute(chars, length, prefix = "") {
    if (prefix.length === length) return [prefix];
    const permutations = [];
    for (let i = 0; i < chars.length; i++) {
        const newChars = chars.slice(0, i).concat(chars.slice(i + 1));
        permutations.push(...permute(newChars, length, prefix + chars[i]));
    }
    return permutations;
}

// Function to start the search
async function initializeSearch() {
    if (isRunning) return alert("Search is already running!");

    isRunning = true;
    updateStatusIndicator(true);

    const inputs = Array.from(document.querySelectorAll("#input-container input"))
        .map(input => transformFinalLetters(input.value.trim()))
        .filter(val => val);

    const skipLengths = [];
    if (document.getElementById("skip-2").checked) skipLengths.push(2);
    if (document.getElementById("skip-3").checked) skipLengths.push(3);

    results = [];
    document.getElementById("output").innerHTML = "";

    await generatePermutations(inputs.join("").split(""), skipLengths, (word, definition) => {
        const outputElement = document.getElementById("output");
        const resultDiv = document.createElement("div");
        resultDiv.textContent = `Word: ${word} - Definition: ${definition}`;
        outputElement.appendChild(resultDiv);
    });

    isRunning = false;
    updateStatusIndicator(false);
}

// Function to stop the search
function stopSearch() {
    isRunning = false;
    updateStatusIndicator(false);
}

// Function to download results as a .txt file
function downloadResults() {
    if (results.length === 0) return alert("No results to download!");
    const blob = new Blob([results.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "results.txt";
    link.click();
}

// Initialize virtual Hebrew keyboard with the specified layout
const hebrewLetters = [
    ['ק', 'ר', 'א', 'ט', 'ו', 'נ', 'ם', 'פ'],
    ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
    ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ']
];

function createVirtualKeyboard() {
    const keyboardContainer = document.createElement("div");
    keyboardContainer.id = "virtual-keyboard";
    keyboardContainer.style.display = "flex";
    keyboardContainer.style.flexDirection = "column";
    keyboardContainer.style.alignItems = "center";
    keyboardContainer.style.gap = "10px";
    keyboardContainer.style.marginTop = "20px";

    hebrewLetters.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.gap = "5px";
        row.forEach(letter => {
            const button = document.createElement("button");
            button.textContent = letter;
            button.style.padding = "10px";
            button.style.borderRadius = "5px";
            button.style.cursor = "pointer";
            button.style.fontSize = "1.2rem";
            button.onclick = () => addInputBox();
            rowDiv.appendChild(button);
        });
        keyboardContainer.appendChild(rowDiv);
    });

    document.body.appendChild(keyboardContainer);
}

// Trigger the keyboard setup
createVirtualKeyboard();

