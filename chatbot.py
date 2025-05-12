import asyncio
import spacy
import uuid
import json
from typing import AsyncIterable

# Load spaCy model
nlp = spacy.load("en_core_web_md")

# Load content
with open('scraped_content.txt', 'r', encoding="utf-8") as file:
    content = file.read()

doc = nlp(content)
sentences = list(doc.sents)
sentence_vectors = [sent.vector for sent in sentences]

conversation_id = str(uuid.uuid4())

def get_best_response(user_input):
    input_doc = nlp(user_input)
    best_score = 0
    best_sentence = "Hmm... I couldn't find a relevant answer."

    for sent, vec in zip(sentences, sentence_vectors):
        score = input_doc.similarity(sent)
        if score > best_score:
            best_score = score
            best_sentence = sent.text

    if best_score < 0.5:
        best_sentence = "🤔 I'm not sure how to answer that, but I'm still learning!"

    return best_sentence

# Function to stream data over SSE
async def stream_response(text: str, conversation_id: str) -> AsyncIterable[str]:
    chunks = text.split()
    for word in chunks:
        data = {
            "type": "message_chunk",
            "content": word,
            "conversation_id": conversation_id
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(0.1)  # simulate typing delay

    # End the stream
    yield f'data: {{"type": "message_stream_complete", "conversation_id": "{conversation_id}"}}\n\n'
    yield f'data: {{"type": "conversation_detail_metadata", "banner_info": null, "blocked_features": [], "model_limits": [], "limits_progress": [{{"feature_name": "deep_research", "remaining": 2, "reset_after": "2025-05-31T09:18:53.561783+00:00"}}], "default_model_slug": "auto", "conversation_id": "{conversation_id}"}}\n\n'
    yield "data: [DONE]\n\n"

# FastAPI instance
# To run the app: uvicorn app_name:app --reload
