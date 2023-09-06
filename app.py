from flask import Flask, render_template, request
import requests
import os
import json

# Initialize the flask project
app = Flask(__name__)

# Create the headers and the endpoints
headers = {
  "Authorization": "Bearer " + os.environ["TOKEN"],
  "Content-type": "application/json",
  "Notion-Version": "2022-06-28"
}

database_url = f"https://api.notion.com/v1/databases/{os.environ['DATABASE_ID']}/query"

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
    next = {}
    # Cycle through the pages
    for i in range(0, 2):
        res = requests.request("POST",
                            database_url,
                            json=next,
                            headers=headers).json()
        
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

    # Render the page, passing the list and categories
    return render_template("index.html", data=data, categories=categories)


# Create the route to delete items from the Notion database
@app.route("/checkItem", methods=["POST"])
def remove():
    
    # Catch the ID of the item
    objectId = request.form.get("id")
    objectUrl = "https://api.notion.com/v1/pages/"
    
    # Check if the object is marked as "To buy"
    fetchItem = requests.request("GET",
                                objectUrl + objectId,
                                headers=headers).json()
    
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
    requests.request("PATCH",
                    objectUrl + objectId,  
                    data=payload, 
                    headers=headers)

    return "Item deleted"

