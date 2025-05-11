# README.md

# Flask MongoDB App

This project is a simple Flask application that connects to a MongoDB database. It serves as a template for building web applications using Flask and MongoDB.

## Project Structure

```
flask-mongodb-app
├── src
│   ├── app.py          # Entry point of the application
│   ├── config
│   │   └── database.py # Database configuration
│   └── models
│       └── __init__.py # Data models for the application
├── .env                # Environment variables
├── requirements.txt    # Project dependencies
├── .gitignore          # Files to ignore in Git
└── README.md           # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd flask-mongodb-app
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```
   MONGODB_URI=<your_mongodb_uri>
   PORT=<your_port>
   ```

5. **Run the application:**
   ```bash
   python src/app.py
   ```

## Usage

When the application is running, it will check if MongoDB is running successfully and display the port in the console. You can access the application at `http://localhost:<your_port>`.