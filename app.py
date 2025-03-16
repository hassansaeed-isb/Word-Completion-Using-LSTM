# app.py - Flask application for Shakespeare word completion

from flask import Flask, render_template, request, jsonify, url_for
import tensorflow as tf
import numpy as np
import pickle
import re  # Use regular expressions for tokenization instead of NLTK
from tensorflow.keras.preprocessing.sequence import pad_sequences
import os

app = Flask(__name__, static_folder='static')

# Global variables to store model parameters
model = None
tokenizer = None
max_sequence_length = 10

# Initialize the model
def load_model():
    global model, tokenizer, max_sequence_length
    
    # Check if model files exist (try both .h5 and .keras extensions)
    model_path = None
    if os.path.exists('shakespeare_lstm_model.keras'):
        model_path = 'shakespeare_lstm_model.keras'
    elif os.path.exists('shakespeare_lstm_model.h5'):
        model_path = 'shakespeare_lstm_model.h5'
    
    if not model_path or not os.path.exists('tokenizer.pickle'):
        return False, "Model or tokenizer file not found. Please download from Kaggle first."
    
    try:
        # Load the model
        model = tf.keras.models.load_model(model_path)
        
        # Load the tokenizer
        with open('tokenizer.pickle', 'rb') as handle:
            tokenizer = pickle.load(handle)
        
        # Try to load max_sequence_length from params file if it exists
        if os.path.exists('model_params.txt'):
            with open('model_params.txt', 'r') as f:
                for line in f:
                    if line.startswith('max_sequence_length'):
                        max_sequence_length = int(line.split('=')[1].strip())
                        break
        
        print(f"Model loaded successfully from {model_path}")
        print(f"Using max_sequence_length: {max_sequence_length}")
        
        return True, f"Model loaded successfully from {model_path}!"
    except Exception as e:
        return False, f"Error loading model: {str(e)}"

# Custom tokenizer function (avoids NLTK dependency issues)
def simple_tokenize(text):
    """Simple word tokenizer that splits on whitespace and punctuation"""
    # Convert to lowercase
    text = text.lower()
    
    # Replace punctuation with spaces to ensure they're separated
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Split on whitespace and filter out empty strings
    words = [word for word in text.split() if word]
    
    return words

# Route for the main page
@app.route('/')
def index():
    if model is None or tokenizer is None:
        success, message = load_model()
        if not success:
            return render_template('error.html', error_message=message)
    
    return render_template('index.html')

# API route for word prediction
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or tokenizer is None:
        success, message = load_model()
        if not success:
            return jsonify({"error": message})
    
    # Get the text from the request
    data = request.get_json()
    input_text = data.get('text', '')
    temperature = float(data.get('temperature', 1.0))
    top_k = int(data.get('top_k', 5))
    
    # Predict next words
    predictions = predict_next_word(input_text, temperature, top_k)
    
    return jsonify(predictions)

# Function to predict the next word
def predict_next_word(input_text, temperature=1.0, top_k=5):
    """Predict the next word given an input text."""
    # Tokenize the input text using our simple tokenizer
    words = simple_tokenize(input_text)
    
    # If input text is shorter than max_sequence_length, use the whole text
    if len(words) < max_sequence_length:
        sequence = words
    else:
        sequence = words[-max_sequence_length:]
    
    # Convert to sequence
    sequence_text = ' '.join(sequence)
    sequence = tokenizer.texts_to_sequences([sequence_text])
    
    # Check if sequence is empty (unknown words)
    if not sequence[0]:
        return [{"word": "No suggestions available", "probability": 0}]
    
    # Pad the sequence
    padded_sequence = pad_sequences(sequence, maxlen=max_sequence_length)
    
    # Predict the next word
    predictions = model.predict(padded_sequence, verbose=0)[0]
    
    # Apply temperature to adjust prediction distribution
    if temperature != 1.0:
        predictions = np.log(predictions + 1e-10) / temperature
        predictions = np.exp(predictions)
        predictions = predictions / np.sum(predictions)
    
    # Get the top k predictions
    top_indices = np.argsort(predictions)[-top_k:][::-1]
    top_words = []
    
    for idx in top_indices:
        for word, index in tokenizer.word_index.items():
            if index == idx:
                top_words.append({
                    "word": word,
                    "probability": float(predictions[idx])
                })
                break
    
    return top_words

# Route for completing a sentence
@app.route('/complete_sentence', methods=['POST'])
def complete_sentence():
    if model is None or tokenizer is None:
        success, message = load_model()
        if not success:
            return jsonify({"error": message})
    
    # Get the text from the request
    data = request.get_json()
    input_text = data.get('text', '')
    max_words = int(data.get('max_words', 20))
    temperature = float(data.get('temperature', 1.0))
    
    # Complete the sentence
    completed_text = generate_sentence(input_text, max_words, temperature)
    
    return jsonify({"completed_text": completed_text})

def generate_sentence(seed_text, max_words=20, temperature=1.0):
    """Generate a sentence starting with seed_text."""
    result = seed_text.lower()
    
    # Add a space if needed
    if result and not result.endswith(' '):
        result += ' '
    
    # End characters to stop generation
    end_chars = ['.', '!', '?']
    
    # Generate words
    for _ in range(max_words):
        # Predict next word
        predictions = predict_next_word(result, temperature, top_k=1)
        
        # Check if we have a valid prediction
        if not predictions or predictions[0]["word"] == "No suggestions available":
            break
        
        next_word = predictions[0]["word"]
        result += next_word + ' '
        
        # Stop if we generate a sentence end character
        if any(next_word.endswith(char) for char in end_chars):
            break
    
    return result.strip()

# Instructions route
@app.route('/instructions')
def instructions():
    return render_template('instructions.html')

# Health check route
@app.route('/health')
def health_check():
    if model is None or tokenizer is None:
        success, message = load_model()
        if success:
            return jsonify({"status": "healthy", "message": message})
        else:
            return jsonify({"status": "unhealthy", "message": message})
    return jsonify({"status": "healthy", "message": "Model is loaded and ready"})

# Start the Flask application
if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    # Try to load the model at startup
    success, message = load_model()
    if success:
        print(message)
    else:
        print(f"Warning: {message}")
        print("The model will be loaded when the first request is made.")
    
    # Run the app
    app.run(debug=True)
    # tf_env\Scripts\activate