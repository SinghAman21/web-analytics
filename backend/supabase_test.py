import os
from flask import Flask
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.route('/')
def index():
    try:
        # Fetch data from pageviews table
        response = supabase.table('pageviews').select("*").execute()
        
        if not response.data:
            return '<h1>No data found in pageviews table</h1>'
        
        instruments = response.data
        
        html = '<h1>Pageviews</h1><ul>'
        for item in instruments:
            # Display the columns from your data
            html += f'<li>ID: {item.get("id", "N/A")} | Time: {item.get("visit_time", "N/A")} | Site: {item.get("site_hex", "N/A")} | Path: {item.get("path", "N/A")}</li>'
        html += '</ul>'
        
        return html
    
    except Exception as e:
        return f'<h1>Error</h1><p>{str(e)}</p>'

if __name__ == '__main__':
    app.run(debug=True)