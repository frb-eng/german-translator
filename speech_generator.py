
from os import environ
from openai import OpenAI
import base64

openAIClient = OpenAI(
    api_key=environ.get("OPEN_API_TOKEN"),
)

def generate_speech(text: str, word: bool) -> str:
    speech_response = openAIClient.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input= "..." + text if word else text
    )
    speech_base64 = base64.b64encode(speech_response.content).decode('utf-8')
    return speech_base64