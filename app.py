from flask import Flask, render_template, request
import os
import json
from utils import callDB as callDB

DB_ID = os.environ['DATABASE_ID']
DB_BUTTONS_ID = os.environ['DB_BUTTONS_ID']
DB_RECIPES_ID = os.environ['DB_RECIPES_ID']

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
        for result in res["results"]:
            item = {}
            item["name"] = result["properties"]["Ingredient"]["title"][0]["text"]["content"]
            item["icon"] = result["icon"]["file"]["url"]
            item["id"] = result["id"]
            item["type"] = result["properties"]["Type"]["multi_select"][0]["name"]
            item["tobuy"] = result["properties"]["To buy"]["checkbox"]
            item["season"] = result["properties"]["Season"]["formula"]["boolean"]
            
            # Finish populating the list
            data.append(item)
        
        next_cursor = {"start_cursor": res["next_cursor"]}

    # Capture the recipes
    recipes = []
    recipesCategories = [
        
    ]
    
    resRecipes = callDB("POST", "database", DB_RECIPES_ID)
    
    for result in resRecipes["results"]:
        recipe = {}
        recipe["name"] = result["properties"]["Name"]["title"][0]["text"]["content"]
        recipe["icon"] = result["icon"]["file"]["url"]
        recipe["id"] = result["id"]
        recipe["Fav"] = result["properties"]["Fav"]["checkbox"]
        
        if recipe["Fav"] == False:
            recipe["Fav"] = ""
        else:
            recipe["Fav"] = "❤️"
            
        if result["cover"] != None:
            recipe["img"] = result["cover"]["file"]["url"]
        else:
            recipe["img"] = "None"
            
        if recipe["name"] != "Daily plan":
            recipes.append(recipe)
    
    # Capture tue button icons
    button_img = {}
        
    resButtonPack = callDB("POST", "database", DB_BUTTONS_ID)
    
    for index, item in enumerate(resButtonPack["results"]):
        name = item["properties"]["Name"]["title"][0]["text"]["content"]
        content = item["icon"]["file"]["url"]
        button_img[name.lower()] = content

    # Render the page, passing the list and categories
    return render_template("index.html", 
                           data=data, 
                           categories=categories, 
                           button_img=json.dumps(button_img),
                           recipes=recipes)

# Create the route to delete items from the Notion database
@app.route("/checkItem", methods=["POST"])
def remove():
    # Catch the ID of the item
    objectId = request.form.get("id")
    
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
    
    # Execute the query
    res = callDB("PATCH", "page", objectId, json.dumps(payload)).json()

    match res["status"]:
        case 400:
            print(f" --- Error: {res['message']} --- ")
            return f"Error: {res['message']}"

    return "Item changed"
    
if __name__ == "__main__":
    app.run()
