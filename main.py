import json
from os import environ
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

# llm = ChatOllama(model='llama3.1').bind(response_format={"type": "json_object"})
llm = ChatOpenAI(model='gpt-4o', api_key=environ.get('OPEN_API_TOKEN')).bind(response_format={"type": "json_object"})

load_dotenv()

class Word(BaseModel):
    text: str

app = FastAPI()

@app.post("/api")
async def read_root(word: Word):
    system_message = SystemMessage("""
        You are a helpful assitante. You will receive a single word in any language.
        Your task is to translate to german.
        Please reply with translation and an example sentence.
        Please return JSON.
        Example success response:
        {
            "translation": "apple",
            "example": "The apple is red."
        }
        In case you notice the user provided multiple words or sentence please return the following error JSON:
        {
            "error": "Multiple words are not supported"
        }
        """)
    human_message = HumanMessage(word.text)
    response = json.loads(llm.invoke([system_message, human_message]).content)
    if 'error' in response:
        raise HTTPException(status_code=400, detail=response['error'])
    return response

# app.mount("/", StaticFiles(directory="static", html=True), name="static")


if environ.get('ENV') == 'development':
    subprocess.Popen(['npm', 'run', 'dev'], cwd='client')