from base64 import decodebytes
from os import environ
from openai import OpenAI
from data_store import data_store
import uuid

openAIClient = OpenAI(
    api_key=environ.get("OPEN_API_TOKEN"),
)

def generate_image(text: str) -> str:
    image_response = openAIClient.images.generate(
        model="dall-e-3",
        prompt=text,
        size="1024x1024",
        quality="standard",
        style="natural",
        n=1,
        response_format="b64_json"
    )
    image_key = str(uuid.uuid4())
    data_store[image_key] = decodebytes(bytes(image_response.data[0].b64_json, 'utf-8'))
    return image_key
