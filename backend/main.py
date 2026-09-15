from fastapi import FastAPI

app = FastAPI(title="RELIVO")


@app.get("/")
def root():
    return {
        "message": "RELIVO backend is running!"
    }