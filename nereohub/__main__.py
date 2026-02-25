"""Entry point: python -m nereohub or nereohub command."""
import uvicorn
from .api import create_app

def main():
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8888)

if __name__ == "__main__":
    main()
