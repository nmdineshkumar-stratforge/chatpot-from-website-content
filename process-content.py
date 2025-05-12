import spacy

# Load the spaCy model
nlp = spacy.load('en_core_web_md')

# Read the content from the file
with open('scraped_content.txt', 'r', encoding="utf-8") as file:
    content = file.read()

# Preprocess the scraped content
doc = nlp(content)

# Remove stopwords and non-alphabetic characters
cleaned_content = ' '.join([token.text for token in doc if not token.is_stop and token.is_alpha])


# Create a list of sentences
sentences = list(doc.sents)

# Precompute sentence vectors
sentence_vectors = [sent.vector for sent in sentences]

def get_best_response(user_input):
    input_doc = nlp(user_input)
    best_score = 0
    best_sentence = "Sorry, I don't know how to respond to that."

    # Compute similarity between user input and each sentence
    for sent, sent_vector in zip(sentences, sentence_vectors):
        score = input_doc.similarity(sent)
        if score > best_score:
            best_score = score
            best_sentence = sent.text

    # Apply a threshold to filter low similarity
    if best_score < 0.5:  # Adjust the threshold as needed
        best_sentence = "Sorry, I couldn't find a relevant answer."

    return best_sentence


print("Chatbot: Ask me anything about the content!")
while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Bot: Goodbye!")
        break
    response = get_best_response(user_input)
    print("Bot:", response)
