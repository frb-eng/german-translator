import json
from os import environ, makedirs
import subprocess
from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from openai import OpenAI
from data_store import data_store
from image_generator import generate_image
from speech_generator import generate_speech

openAIClient = OpenAI(
    # This is the default and can be omitted
    api_key=environ.get("OPEN_API_TOKEN"),
)

llms = [
    {
        'id': 'llama3.1', 'model': ChatOllama(model='llama3.1').bind(response_format={"type": "json_object"}),

    }, {
        'id': 'gpt-4o', 'model': ChatOpenAI(model='gpt-4o', api_key=environ.get('OPEN_API_TOKEN')).bind(response_format={"type": "json_object"})
    }
]

load_dotenv()


class Word(BaseModel):
    text: str
    model: str

class ImageRequest(BaseModel):
    text: str

app = FastAPI()


@app.post("/api")
async def read_root(word: Word):
    llm = next((item['model'] for item in llms if item['id'] == word.model), None)
    if llm is None:
        raise HTTPException(status_code=404, detail="Model not found")
    system_message = SystemMessage("""
        You are a helpful assitante. You will receive a single word in any language.
        Your task is to translate to german.
        Please reply with translation and an example sentence.
        For nouns return the article as well.
        Please return only valid JSON.
        Example response:
        {
            "translation": "der Apfel",
            "example": "Der Apfel ist rot."
        }
        """)
    human_message = HumanMessage(word.text)
    multipleWordsResponse = json.loads(llm.invoke([SystemMessage("""
        Your task is to detect if multiple words are provided. 
        Please return only valid JSON.
        In case yes:
        {
            "result": true
        }
        In case no:
        {
            "result": false
        }
    """), human_message]).content)['result']
    response = json.loads(llm.invoke([system_message, human_message]).content)
    if multipleWordsResponse:
        raise HTTPException(
            status_code=400, detail="Multiple word are not supported")
        
    return {
        "translation": response['translation'],
        "example": response['example'],
        "translationSpeech": "api/speech/" + generate_speech(response['translation'], True),
        "exampleSpeech": "api/speech/" + generate_speech(response['example'], False)
    }

@app.post("/api/generate-image")
async def generate_image_endpoint(request: ImageRequest):
    image_key = generate_image(request.text)
    return {"imageUrl": f"/api/image/{image_key}"}

@app.get("/api/speech/{key}")
async def get_speech(key: str):
    if key not in data_store:
        raise HTTPException(status_code=404, detail="Speech not found")
    return Response(content=data_store[key], media_type="audio/mpeg")

@app.get("/api/image/{key}")
async def get_image(key: str):
    if key not in data_store:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=data_store[key], media_type="image/jpeg")

# app.mount("/speeches", StaticFiles(directory="speeches"), name="static")


if environ.get('ENV') == 'development':
    subprocess.Popen(['npm', 'run', 'dev'], cwd='client')
