document.addEventListener("DOMContentLoaded", function() {
    // Catch the divs
    const shopping = document.querySelector("#shopping");
    const recipes = document.querySelector("#recipes");
    const titles = document.getElementById("shopping").querySelectorAll(".title");
    const itemButton = document.querySelectorAll(".item");
    const listButton = document.querySelector("#listButton");
    const recipesButton = document.querySelector("#recipesButton");
    const itemRecipes = document.querySelectorAll(".recipe");
    const imgPack = JSON.parse(document.getElementById("button_img").textContent)["pack"];
    const imgList = JSON.parse(document.getElementById("button_img").textContent)["list"];
    const imgRecipes = JSON.parse(document.getElementById("button_img").textContent)["recipes"];
    const imgCart = JSON.parse(document.getElementById("button_img").textContent)["cart"];
    const search = document.querySelector("#search");
    const searchBar = document.querySelector("#searchBar");
    
    // Assign the btutons the proper images
    listButton.getElementsByTagName("img")[0].src = imgList;
    recipesButton.getElementsByTagName("img")[0].src = imgRecipes;

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
        })
    })

    // Pivot between the two modes
    listButton.addEventListener("click", function() {

        // Display the search bar
        if (search.style.display === "block") {
            search.style.animationName = "search-disappear";
            search.style.animationPlayState = "running";
            setTimeout(() => {
                search.style.animationPlayState = "paused";
                search.style.display = "none";
            }, 500)
        } else {
            search.style.display = "block";
            search.style.animationName = "search-appear";
            search.style.animationPlayState = "running";
        }

        // Switch the elements
        if (this.getElementsByTagName("img")[0].src == imgList) {
            this.getElementsByTagName("img")[0].src = imgPack;

            itemButton.forEach(itm => {
                if (itm.style.display == "flex") {
                    itm.style.display = "none";
                } else {
                    itm.style.display = "flex";
                }
            });
        } else {
            this.getElementsByTagName("img")[0].src = imgList;

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
    
            // Manage the buttons
            listButton.style.display = "none";
            this.getElementsByTagName("img")[0].src = imgCart;

            // Hide the searchbar if it's visible
            if (search.style.animationPlayState == "running") {
                search.style.animationName = "search-disappear";
                search.style.animationPlayState = "running";
                setTimeout(() => {
                    search.style.animationPlayState = "paused";
                    search.style.display = "none";
                }, 500)
            }
        } else {
            // Manage the areas
            recipes.style.display = "none";
            shopping.style.display = "flex";

            // Manage the buttons
            listButton.style.display = "block";
            this.getElementsByTagName("img")[0].src = imgRecipes;
        }
    })

    // Clean the screen of empty objects
    titles.forEach(tit => {
        const name = tit.innerHTML.split(" ")[1]
        const items = document.getElementById("shopping").getElementsByClassName(`${name}`)

        if (items.length == 0) {
            tit.style.display = "none";
        }
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
});
