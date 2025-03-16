// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const textInput = document.getElementById('text-input');
    const suggestionsContainer = document.getElementById('suggestions');
    const updateBtn = document.getElementById('update-btn');
    const completeBtn = document.getElementById('complete-btn');
    const clearBtn = document.getElementById('clear-btn');
    const tempSlider = document.getElementById('temperature');
    const tempValue = document.getElementById('temp-value');
    const topKSelect = document.getElementById('top-k');
    const maxWordsInput = document.getElementById('max-words');
    const historyContainer = document.getElementById('history-container');
    
    // Variables
    let typingTimer;
    const doneTypingInterval = 500; // Wait 500ms after typing stops
    
    // Event listeners
    textInput.addEventListener('input', function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(getSuggestions, doneTypingInterval);
    });
    
    updateBtn.addEventListener('click', getSuggestions);
    completeBtn.addEventListener('click', completeSentence);
    clearBtn.addEventListener('click', clearText);
    
    tempSlider.addEventListener('input', function() {
        tempValue.textContent = this.value;
    });
    
    // Functions
    function getSuggestions() {
        const text = textInput.value.trim();
        if (!text) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        // Show loading indicator
        showLoadingIndicator(suggestionsContainer);
        
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                temperature: parseFloat(tempSlider.value),
                top_k: parseInt(topKSelect.value)
            }),
        })
        .then(handleResponse)
        .then(data => {
            suggestionsContainer.innerHTML = '';
            
            if (data.error) {
                showError(suggestionsContainer, data.error);
                return;
            }
            
            displaySuggestions(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showError(suggestionsContainer, 'Error getting suggestions');
        });
    }
    
    function completeSentence() {
        const text = textInput.value.trim();
        if (!text) return;
        
        // Store original text
        const originalText = text;
        
        // Show loading indicator in the text area
        textInput.value += ' ⌛ Generating...';
        
        fetch('/complete_sentence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: originalText,
                max_words: parseInt(maxWordsInput.value),
                temperature: parseFloat(tempSlider.value)
            }),
        })
        .then(handleResponse)
        .then(data => {
            if (data.error) {
                textInput.value = originalText;
                alert(data.error);
                return;
            }
            
            // Update text input
            textInput.value = data.completed_text;
            
            // Add to history
            addToHistory(originalText, data.completed_text);
            
            // Update suggestions
            getSuggestions();
        })
        .catch(error => {
            console.error('Error:', error);
            textInput.value = originalText;
            alert('Error completing sentence');
        });
    }
    
    function clearText() {
        textInput.value = '';
        suggestionsContainer.innerHTML = '';
    }
    
    function handleResponse(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
    
    function showLoadingIndicator(container) {
        container.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="typing-indicator"></div>
                <div class="typing-indicator" style="animation-delay: 0.2s"></div>
                <div class="typing-indicator" style="animation-delay: 0.4s"></div>
                <span class="ms-2">Generating suggestions...</span>
            </div>
        `;
    }
    
    function showError(container, message) {
        container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
    
    function displaySuggestions(suggestions) {
        suggestions.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary suggestion-btn';
            btn.textContent = `${item.word} (${(item.probability * 100).toFixed(1)}%)`;
            
            btn.addEventListener('click', function() {
                let currentText = textInput.value;
                if (currentText && !currentText.endsWith(' ')) {
                    currentText += ' ';
                }
                textInput.value = currentText + item.word + ' ';
                textInput.focus();
                getSuggestions();
            });
            
            suggestionsContainer.appendChild(btn);
        });
    }
    
    function addToHistory(original, completed) {
        // Clear empty history message if it exists
        if (historyContainer.querySelector('.text-muted')) {
            historyContainer.innerHTML = '';
        }
        
        // Create history item
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Format the content to highlight the addition
        const originalWords = original.trim().split(' ');
        const completedWords = completed.trim().split(' ');
        
        let highlightedText = '';
        for (let i = 0; i < completedWords.length; i++) {
            if (i < originalWords.length) {
                highlightedText += completedWords[i] + ' ';
            } else {
                highlightedText += `<span class="text-success fw-bold">${completedWords[i]}</span> `;
            }
        }
        
        historyItem.innerHTML = `
            <small class="text-muted">Original:</small>
            <div class="mb-1">${original}</div>
            <small class="text-muted">Completed:</small>
            <div>${highlightedText}</div>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-secondary reuse-btn">Reuse</button>
            </div>
        `;
        
        // Add "Reuse" button functionality
        const reuseBtn = historyItem.querySelector('.reuse-btn');
        reuseBtn.addEventListener('click', function() {
            textInput.value = completed;
            getSuggestions();
        });
        
        // Add to container (at the top)
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    }
    
    // Add example suggestions
    function addExampleSuggestions() {
        const exampleContainer = document.getElementById('example-sentences');
        if (!exampleContainer) return;
        
        const examples = [
            "to be or not to",
            "all the world's a",
            "the quality of mercy is", 
            "now is the winter of",
            "some are born great some"
        ];
        
        examples.forEach(example => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary me-2 mb-2';
            btn.textContent = example;
            
            btn.addEventListener('click', function() {
                textInput.value = example;
                getSuggestions();
                textInput.focus();
            });
            
            exampleContainer.appendChild(btn);
        });
    }
    
    // Initialize
    function init() {
        // Initial suggestions if there's text
        if (textInput.value.trim()) {
            getSuggestions();
        }
        
        // Add example suggestions
        addExampleSuggestions();
        
        // Focus the text input
        textInput.focus();
    }
    
    // Start the app
} ,init());
