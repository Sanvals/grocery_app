from flask import Flask, render_template, request
import requests
import os
import json
from utils import callDB as callDB

DB_ID = os.environ['DATABASE_ID']
DB_BUTTONS_ID = os.environ['DB_BUTTONS_ID']

# Initialize the flask project
app = Flask(__name__)
    
# Create the main route
@app.route("/")
def index():

    # Create the main lists of items from Notion
    data = []
    categories = [
        "🍎 Fruit",
        "🥕 Vegetable",
        "🧀 Dairy",
        "🥩 Meat",
        "🍹 Drink",
        "🥯 Bread",
        "🍝 Pasta",
        "🍯 Spread",
        "🍫 Snack",
        "🏠 House",
        "💊 Meds",
    ]
    
    # Execute the filter into the Notion database
    next_cursor = {}
    # Cycle through the pages
    for _ in range(0, 2):
        res = callDB("POST", "database", DB_ID, next_cursor)
        
        # Parse the results into the lists of items for the web
        for i in range(len(res["results"])):
            item = {}
            item["name"] = res["results"][i]["properties"]["Ingredient"]["title"][0]["text"]["content"]
            item["icon"] = res["results"][i]["icon"]["file"]["url"]
            item["id"] = res["results"][i]["id"]
            item["type"] = res["results"][i]["properties"]["Type"]["multi_select"][0]["name"]
            item["tobuy"] = res["results"][i]["properties"]["To buy"]["checkbox"]
            item["season"] = res["results"][i]["properties"]["Season"]["formula"]["boolean"]
            
            # Finish populating the list
            data.append(item)
        
        next = {"start_cursor": res["next_cursor"]}

    # Capture tue button icons
    button_img = {}
        
    resButtonPack = callDB("POST", "database", DB_BUTTONS_ID)
    
    for index, item in enumerate(resButtonPack["results"]):
        name = item["properties"]["Name"]["title"][0]["text"]["content"]
        content = item["icon"]["file"]["url"]
        button_img[name.lower()] = content

    # Render the page, passing the list and categories
    return render_template("index.html", data=data, categories=categories, button_img=json.dumps(button_img))

# Create the route to delete items from the Notion database
@app.route("/checkItem", methods=["POST"])
def remove():
    # Catch the ID of the item
    objectId = request.form.get("id")
    objectUrl = "https://api.notion.com/v1/pages/"
    
    # Check if the object is marked as "To buy"
    fetchItem = callDB("GET", "page", objectId)
    
    # Switch the checkbox in whichever state it is
    fetchValue = not fetchItem["properties"]["To buy"]["checkbox"]
    
    # Crete the modification, in this case, uncheck "To buy"
    payload = {
        "properties": {
            "To buy": {
                'checkbox': fetchValue
            }
        }
    }
    payload = json.dumps(payload)
    
    # Execute the query
    callDB("PATCH", "page", objectId, payload)

    return 0


if __name__ == "__main__":
    app.run()
