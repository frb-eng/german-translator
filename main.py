import os
import subprocess
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

@app.get("/api")
async def read_root():
    return {"message": "Hello, World!"}

# app.mount("/", StaticFiles(directory="static", html=True), name="static")


if os.getenv('ENV') == 'development':
    subprocess.Popen(['npm', 'run', 'dev'], cwd='client')