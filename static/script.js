document.addEventListener("DOMContentLoaded", function() {
    // Catch the divs
    const shopping = document.querySelector("#shopping");
    const recipes = document.querySelector("#recipes");
    const titles = document.getElementById("shopping").querySelectorAll(".title");
    const itemButton = document.querySelectorAll(".item");
    const listButton = document.querySelector("#listButton");
    const recipesButton = document.querySelector("#recipesButton");
    const emptyButton = document.querySelector("#emptyButton");
    const itemRecipes = document.querySelectorAll(".recipe");
    const imgPack = JSON.parse(document.getElementById("button_img").textContent)["pack"];
    const imgList = JSON.parse(document.getElementById("button_img").textContent)["list"];
    const imgRecipes = JSON.parse(document.getElementById("button_img").textContent)["recipes"];
    const imgCart = JSON.parse(document.getElementById("button_img").textContent)["cart"];
    const imgEmpty = JSON.parse(document.getElementById("button_img").textContent)["empty"];
    const search = document.querySelector("#search");
    const searchBar = document.querySelector("#searchBar");
    
    // Assign the btutons the proper images
    listButton.getElementsByTagName("img")[0].src = imgList;
    recipesButton.getElementsByTagName("img")[0].src = imgRecipes;
    emptyButton.getElementsByTagName("img")[0].src = imgEmpty;

    // Hide the recipes area
    recipes.style.display = "none";

    // Elaborate the eventListeners
    itemButton.forEach(btn => {
        btn.addEventListener("click", function() {
            // Switch item from the database
            newForm = new FormData()
            newForm.append("id", btn.id)

            fetch("/checkItem", {
                method: 'POST',
                body: newForm,
            });
            
            if (this.classList.contains("x")) {
                this.classList.remove("x");
            } else {
                this.classList.add("x");
            }

            // Play the animation
            this.style.animationPlayState = "running";
            this.addEventListener('animationend', () => {
                // Once it ends, hide the div
                this.style.display = "none";
                this.style.animationPlayState = "paused"
            });

            displayIngredients();
        });
    });

    // EventListeners for the recipe buttons
    itemRecipes.forEach(recipe => {
        recipe.addEventListener("click", function() {
            newForm = new FormData()
            newForm.append("id", this.id)

            fetch("/addRecipe", {
                method: 'POST',
                body: newForm,
            });
            
            // Extract and parse the ingredients on the div
            const ingredients = this.dataset.ingredients.replace(/'/g, '"');
            const ingredientsArray = JSON.parse(ingredients);
            // console.log(ingredientsArray);
            
            // Identify and translate the ingredients' id into names
            const ingredientsName = [];
            
            ingredientsArray.forEach(ing => {
                itemButton.forEach(btn => {
                    if (ing == btn.getAttribute("id")) {
                        ingredientsName.push(btn.getAttribute("name"));

                        if (!btn.classList.contains("x")) {
                            // Add the class to be visible
                            btn.classList.add("x");
                            
                            // Get the ID and mark the checkbox
                            newForm = new FormData();
                            newForm.append("id", ing);

                            fetch("/checkItem", {
                                method: 'POST',
                                body: newForm,
                            });
                        }
                    }
                });
            });

            displayIngredients();
        });
    });

    // Pivot between the two modes
    listButton.addEventListener("click", function() {
        // Display the elements
        if (search.style.display === "block") {
            // Hide the search bar
            search.style.animationName = "search-disappear";
            search.style.animationPlayState = "running";
            setTimeout(() => {
                search.style.animationPlayState = "paused";
                search.style.display = "none";
            }, 500)

            // Show the recipe button
            recipesButton.style.animationName = "button-appear";
            recipesButton.style.animationPlayState = "running";

        } else {
            // Show the search bar
            search.style.display = "block";
            search.style.animationName = "search-appear";
            search.style.animationPlayState = "running";

            // Hide the recipe button
            recipesButton.style.animationName = "button-disappear";
            recipesButton.style.animationPlayState = "running";
            setTimeout(() => {
                recipesButton.style.animationPlayState = "paused";
                recipesButton.style.display = "none";
            }, 500)
        }

        // Switch the elements
        if (this.getElementsByTagName("img")[0].src == imgList) {
            this.getElementsByTagName("img")[0].src = imgPack;

            // Switch the ingredients' display
            itemButton.forEach(itm => {
                if (itm.style.display == "flex") {
                    itm.style.display = "none";
                } else {
                    itm.style.display = "flex";
                }
            });
        } else {
            this.getElementsByTagName("img")[0].src = imgList;

            // Show the recipes button
            recipesButton.style.display = "block";

            // Switch the ingredients' display
            itemButton.forEach(itm => {
                if(itm.classList.contains("x")) {
                    itm.style.display = "flex";
                } else {
                    itm.style.display = "none";
                }
            });
        }
    })

    // Pivot between recipes and cart mode
    recipesButton.addEventListener("click", function() {
        if (this.getElementsByTagName("img")[0].src == imgRecipes) {
            // Manage the areas
            recipes.style.display = "flex";
            shopping.style.display = "none";
    
            // Change the image
            this.getElementsByTagName("img")[0].src = imgCart;

            // Hide the listButton
            listButton.style.animationName = "button-disappear";
            listButton.style.animationPlayState = "running";
            setTimeout(() => {
                listButton.style.animationPlayState = "paused";
                listButton.style.display = "none";
            }, 500)

            // Hide the empty list button
            emptyButton.style.animationName = "button-disappear";
            emptyButton.style.animationPlayState = "running";
            setTimeout(() => {
                emptyButton.style.animationPlayState = "paused";
                emptyButton.style.display = "none";
            }, 500)

        } else {
            // Manage the areas
            recipes.style.display = "none";
            shopping.style.display = "flex";

            // Change the image
            this.getElementsByTagName("img")[0].src = imgRecipes;

            // Show the listButton
            listButton.style.display = "block";
            listButton.style.animationName = "button-appear";
            listButton.style.animationPlayState = "running";

            // Show the empty list button
            emptyButton.style.display = "block";
            emptyButton.style.animationName = "button-appear";
            emptyButton.style.animationPlayState = "running";

            // Show all the tagged icons
            itemButton.forEach(itm => {
                if(itm.classList.contains("x")) {
                    itm.style.display = "flex";
                } else {
                    itm.style.display = "none";
                }
            });

            // Change the listButton img to list
            listButton.getElementsByTagName("img")[0].src = imgList;
        }

        displayIngredients();
    })

    // Search engine
    searchBar.addEventListener("input", function () {
        const query = searchBar.value.toLowerCase();

        let total = itemButton.length;
        for (let i = 0; i < total; i++){
            const name = itemButton[i].getElementsByClassName("text")[0].textContent.trim().toLowerCase();
            const show = itemButton[1].classList.contains("x");
            if (name.includes(query) && !show) {
                itemButton[i].style.display = "flex";
            } else {
                itemButton[i].style.display = "none";
            }
        }
    });

    // Create the function to display the ingredients
    function displayIngredients() {
        // On each of the recipe elements
        itemRecipes.forEach(recipe => {
            // First empty the list
            recipe.getElementsByClassName("ingredients-area")[0].innerHTML = "";

            // Extract and parse the ingredients
            const ingredients = recipe.dataset.ingredients.replace(/'/g, '"');
            const ingredientsIDArray = JSON.parse(ingredients);

            // Identify and translate the ingredients' id into names
            let ingredientsNAMEArray = [];
            ingredientsIDArray.forEach(ing => {
                itemButton.forEach(btn => {
                    if (ing == btn.getAttribute("id")) {
                        ingredientsNAMEArray.push(btn.getAttribute("name"));
                    }
                });
            })
            
            // Add the ingredients to ingredients-area as divs
            ingredientsNAMEArray.forEach(ing => {
                const ingDiv = document.createElement("div");
                ingDiv.textContent = ing;
                // Color in green if this item exists on the list
                itemButton.forEach(btn => {
                    // First find the appropiate ingredient
                    if (ing === btn.getAttribute("name")){
                        // Then check if it has "x" on the classlist
                        if (btn.classList.contains("x")){
                            ingDiv.style.color = "green";
                        }
                    }
                })
                // Append the ingredient to the recipe
                recipe.getElementsByClassName("ingredients-area")[0].appendChild(ingDiv);
            })
        })
    }

    displayIngredients();
});
