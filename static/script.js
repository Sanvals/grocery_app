document.addEventListener("DOMContentLoaded", function() {
    // Catch the divs
    const itemButton = document.querySelectorAll(".item");
    const titles = document.getElementById("shopping").querySelectorAll(".title");
    const listButton = document.querySelector("#listButton");
    const search = document.querySelector("#search");
    const searchBar = document.querySelector("#searchBar");
    const settingsButton = document.querySelector("#settingsButton");
    const imgPack = JSON.parse(document.getElementById("button_img").textContent)["pack"]
    const imgList = JSON.parse(document.getElementById("button_img").textContent)["list"]
    const imgSettings = JSON.parse(document.getElementById("button_img").textContent)["settings"]
    
    // Assign the btutons the proper images
    listButton.getElementsByTagName("img")[0].src = imgList;
    settingsButton.getElementsByTagName("img")[0].src = imgSettings;

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
