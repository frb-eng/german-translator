import json
import os
import subprocess
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOllama(model='llama3.1').bind(response_format={"type": "json_object"})

load_dotenv()

class Word(BaseModel):
    text: str

app = FastAPI()

@app.post("/api")
async def read_root(word: Word):
    system_message = SystemMessage("""
        You are a helpful assitante. You will receive a word in german.
        Please reply with translation in english and example sentence.
        Please return JSON.
        Example:
        {
            "translation": "apple",
            "example": "The apple is red."
        }
        """)
    human_message = HumanMessage(word.text)
    response = llm.invoke([system_message, human_message]).content
    return json.loads(response)

# app.mount("/", StaticFiles(directory="static", html=True), name="static")


if os.getenv('ENV') == 'development':
    subprocess.Popen(['npm', 'run', 'dev'], cwd='client')