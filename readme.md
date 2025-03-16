# Shakespeare Word Completion using LSTM
## Project Overview

This project implements a word-level LSTM (Long Short-Term Memory) neural network for sentence completion, trained on Shakespeare's plays. The model can predict the next word in a sequence based on the preceding words, mimicking Shakespeare's distinctive writing style. A web-based user interface allows real-time interaction with the model.

## Repository Structure

```
shakespeare-lstm-completion/
│
├── notebooks/
│   ├── Shakespeare_LSTM_Training.ipynb    # Notebook for model training on Kaggle
│   └── model_evaluation.ipynb             # Notebook for model evaluation
│
├── app/
│   ├── app.py                   # Flask application 
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css        # Application styling
│   │   └── js/
│   │       └── script.js        # Client-side JavaScript
│   │
│   └── templates/
│       ├── index.html           # Main UI template
│       ├── error.html           # Error page template
│       └── instructions.html    # Instructions page
│
├── model/
│   ├── shakespeare_lstm_model.keras  # Trained model file
│   ├── tokenizer.pickle              # Saved tokenizer
│   └── model_params.txt              # Model parameters
│
├── data/
│   └── Shakespeare_data.csv     # Shakespeare plays dataset (from Kaggle)
│
├── docs/
│   ├── technical_report.pdf     # IEEE format technical report
│   └── screenshots/             # UI and results screenshots
│
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Jupyter Notebook Usage

### Training Notebook (`Shakespeare_LSTM_Training.ipynb`)

The notebook for training the LSTM model contains the following sections:

1. **Data Loading and Preprocessing**
   - Loading Shakespeare's plays dataset from Kaggle
   - Text cleaning and normalization
   - Word tokenization
   - Sequence generation

2. **Model Architecture**
   - Embedding layer (50 dimensions)
   - LSTM layer (50 units)
   - Dropout layer (0.2 rate)
   - Dense output layer (softmax activation)

3. **Training Process**
   - Hyperparameter settings
   - Memory optimization techniques
   - Early stopping implementation
   - Loss and accuracy visualization

4. **Model Saving**
   - Save the trained model (.keras format)
   - Save the tokenizer (pickle format)
   - Save model parameters (text file)

### Evaluation Notebook (`model_evaluation.ipynb`)

The evaluation notebook contains:

1. **Model Loading**
   - Load the saved model and tokenizer
   - Set up evaluation parameters

2. **Word Prediction Testing**
   - Test the model with sample Shakespeare phrases
   - Analyze prediction probabilities
   - Adjust temperature parameter and observe effects

3. **Sentence Completion Evaluation**
   - Generate full sentences from seed phrases
   - Evaluate coherence and style matching
   - Compare with original Shakespeare quotes

4. **Visualization**
   - Plot training history
   - Visualize prediction confidence
   - Create comparison tables

## Flask Application

### Setup and Installation

1. Clone the repository
2. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Ensure the model files are in the `model/` directory
4. Run the application:
   ```
   python app/app.py
   ```
5. Access the web interface at http://127.0.0.1:5000

### Application Features

- **Text Input Area**: Enter text and receive real-time word suggestions
- **Word Suggestions Panel**: Displays top predicted next words with probabilities
- **Click-to-Add**: Add suggested words to your text with a single click
- **Sentence Completion**: Automatically complete sentences in Shakespeare's style
- **Temperature Control**: Adjust the creativity/randomness of predictions
- **History Tracking**: View previously generated texts

### Troubleshooting

- **NLTK Tokenization Error**: If you encounter a "Resource punkt_tab not found" error, the application will automatically fall back to a custom tokenizer implementation.
- **Memory Issues**: If the application uses too much memory, reduce the `max_words` parameter in the configuration.
- **Model Loading Failure**: Ensure the model file paths are correct and the model version is compatible with your TensorFlow version.

## Training Notes

- The model was trained on Kaggle's GPU environment with memory optimization techniques
- Training parameters were reduced to fit within memory constraints:
  - Dataset limited to 50,000 lines
  - Vocabulary limited to 5,000 words
  - Embedding dimension: 50
  - LSTM units: 50
  - Batch size: 32
- Early stopping was implemented with a patience of 2 epochs
- The model achieved approximately 20% validation accuracy

## Resources

- [Shakespeare Plays Dataset on Kaggle](https://www.kaggle.com/datasets/kingburrito666/shakespeare-plays)
- [LSTM Neural Networks Documentation](https://www.tensorflow.org/api_docs/python/tf/keras/layers/LSTM)
- [Flask Web Framework](https://flask.palletsprojects.com/)

## Technical Report

A complete technical report in IEEE conference paper format is available in the `docs/` directory. It includes:
- Methodology details
- Results analysis
- Discussion of challenges and solutions
- Future improvement suggestions

## License

This project is provided for educational purposes.

## Author

Hassan Saeed  
Department of Artificial Intelligence and Data Science  
FAST National University  
hassansaeed07.23@gmail.com
