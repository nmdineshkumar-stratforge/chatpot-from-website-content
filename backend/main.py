from fastapi import FastAPI
from pydantic import BaseModel
from chatbot import get_best_response, stream_response
from extractcontent import get_url
from fastapi.responses import StreamingResponse
import uuid
from fastapi.middleware.cors import CORSMiddleware

# Define the request model
class UserInput(BaseModel):
    query: str

# FastAPI application
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or "*" for all origins
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Chatbot API! Ask anything."}

@app.post("/website/")
def get_chatboat_url(url: str):
    get_url(url)
    return {"response": 200}

@app.get("/chat/")
def chat(query: str):
    conversation_id = str(uuid.uuid4())  # Create a unique conversation ID
    response = get_best_response(query)  # Pass the query string to get_best_response
    return StreamingResponse(stream_response(response, conversation_id), media_type="text/event-stream")
