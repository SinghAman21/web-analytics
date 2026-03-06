#!/bin/bash

# Navigate to the frontend directory and run "bun run dev"
cd frontend
# Start a new screen session to run "bun run dev"
screen -dmS frontend_session bash -c "bun run dev; exec bash"

# Navigate back to the root directory
cd ..

# Start another screen session to activate the virtual environment and run the Python script
screen -dmS backend_session bash -c "source venv/bin/activate && python backend/main.py; exec bash"


# #!/bin/bash

# cd backend
# source venv/bin/activate
# python main.py