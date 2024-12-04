from os import environ
from openai import OpenAI
import uuid
from data_store import data_store

openAIClient = OpenAI(
    api_key=environ.get("OPEN_API_TOKEN"),
)

def generate_speech(text: str, word: bool) -> str:
    speech_response = openAIClient.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input= "..." + text if word else text
    )
    speech_key = str(uuid.uuid4())
    data_store[speech_key] = speech_response.content
    return speech_key