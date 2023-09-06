document.addEventListener("DOMContentLoaded", function() {
    // Catch the divs
    const itemButton = document.querySelectorAll(".item");
    // Catch the titles
    const titles = document.getElementById("shopping").querySelectorAll(".title");
    // Catch the buttons
    const listButton = document.querySelector("#listButton");
    // Catch the areas
    const search = document.querySelector("#search");
    // Catch the search bar
    const searchBar = document.querySelector("#searchBar");
    // Button icons
    const imgPack = "https://prod-files-secure.s3.us-west-2.amazonaws.com/598f8c84-f294-4784-94b9-f7d2a817ea25/76671d29-1a88-4885-b15e-06b75eefbc4e/shopping-bag.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20230906%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230906T151334Z&X-Amz-Expires=3600&X-Amz-Signature=49530ddcbd30e5efde9ddf2441edf7a378ad117aa6b8940631a886886b8a7757&X-Amz-SignedHeaders=host&x-id=GetObject"
    const imgList = "https://prod-files-secure.s3.us-west-2.amazonaws.com/598f8c84-f294-4784-94b9-f7d2a817ea25/6ae5ea60-f65b-4244-a8bf-9b224c01b5ec/shopping-list.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20230906%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230906T151428Z&X-Amz-Expires=3600&X-Amz-Signature=49516b38d205b38a5bee2ae08cc53f414e3f3267ea24e448e9f1767af16c50db&X-Amz-SignedHeaders=host&x-id=GetObject"
    // Set the starting button icon
    listButton.getElementsByTagName("img")[0].src = imgList;

    // Elaborate the eventListeners
    itemButton.forEach(btn => {
        btn.addEventListener("click", function() {

            // Switch item from the database
            
            newForm = new FormData()
            newForm.append("id", btn.id)

            fetch("/checkItem", {
                method: 'POST',
                body: newForm,
            })
            

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
            })

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
