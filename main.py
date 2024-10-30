import os
import subprocess
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Word(BaseModel):
    text: str

app = FastAPI()

@app.post("/api")
async def read_root(word: Word):
    return {"message": word}

# app.mount("/", StaticFiles(directory="static", html=True), name="static")


if os.getenv('ENV') == 'development':
    subprocess.Popen(['npm', 'run', 'dev'], cwd='client')