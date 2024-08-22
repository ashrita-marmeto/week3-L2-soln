const apiKey = "2HD83kjOvFX7E5aKKE5kTbmsvCOjVG4XwW1nXBJYqeq1IoZLrzSq5vtq";
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const firstImage = document.getElementById("first-image");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Hide the sections initially
document.getElementById("similar-results").style.display = "none";
document.getElementById("favorites-list").style.display = "none";

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  fetchImages(query);
});

searchInput.addEventListener('keydown', function(event) {
         if (event.key === 'Enter') {
            const query = searchInput.value;
            fetchImages(query);
        }
     });

async function fetchImages(query) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${query}`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );
  const data = await response.json();
  displayFirstImage(data.photos[0]);
  displaySimilarResults(data.photos);
}

function displayFirstImage(image) {
  firstImage.innerHTML = `
        <div class="image-item">
                <img src="${image.src.medium}" alt="${image.alt}" />
            <div class="image-desc">
                <h3>${image.alt}</h3>
                <div>
                    <p>Photographer: ${image.photographer}</p>
                    <button class="btn"><a href="${image.photographer_url}" target="_blank">EXPLORE MORE</a></button>
                </div>
            </div>
        </div>`;
}

function displaySimilarResults(images) {
  const similarResults = document.getElementById(
    "similar-results"
  );
  const similarElement = document.getElementById("similar");

  if (images.length > 1) {
    // More than one image means we have similar results
    similarResults.style.display = "block"; // Show the section
    similarElement.innerHTML = ""; // Clear the list

    images.forEach((image, index) => {
      if (index === 0) return; // Skip the first image since it's displayed separately

      const imageCard = document.createElement("li");
      imageCard.classList.add("splide__slide");
      imageCard.innerHTML = `
                <div class="image-grid">
                    <img src="${image.src.medium}" alt="${image.alt}">
                    <button class="wishlist-button" data-index="${index}">
                        🩶
                    </button>
                    <div class="details">
                    <h3>${image.alt}</h3>
                    <p>${image.photographer}</p>
                    </div>
                </div>`;
      similarElement.appendChild(imageCard);
    });

    new Splide("#similar-images", {
      type: "loop",
      perPage: 5,
      gap: "1rem",
      pagination: false,
      breakpoints: {
        1300: {
            perPage: 4,
        },
        1024: {
          perPage: 3, // Number of slides per page for medium screens
        },
        900: {
          perPage: 2, // Number of slides per page for small screens
        },
        600: {
            perPage: 1,
        }
      },
    }).mount();

    attachWishlistListeners();
  } else {
    similarResults.style.display = "none"; // Hide the section if no similar results
  }
}

function attachWishlistListeners() {
  const wishlistButtons = document.querySelectorAll(".wishlist-button");
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const card = event.target.closest(".image-grid"); // Find the closest parent element with the 'relative' class
      const image = card.querySelector("img"); // Find the image within the same card
      const imageData = {
        src: image.src,
        alt: image.alt,
        photographer: card.querySelector("p").textContent, // Photographer's name
      };

      // Add to favorites
      addToFavorites(imageData);

      // Remove the item from the Similar Results section
      card.parentElement.remove();

      // Re-initialize the Splide slider for similar results
      const splide = document.querySelector("#similar-images").splide;
      splide.refresh();
    });
  });
}

function addToFavorites(image) {
  favorites.push(image);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Attach event listener for the sort options
document.getElementById("sort-button").addEventListener("click", function () {
//   const sortBy = this.value;
  sortFavorites();
});

// Function to sort the favorites array and re-render it
function sortFavorites() {
  favorites.sort((a, b) => {
      return a.alt.localeCompare(b.alt); // Sort by alt text
    });

  renderFavorites(); // Re-render the favorites section after sorting
}

// Function to render the favorites section
function renderFavorites() {
  const favoritesResults = document.getElementById("favorites-list");
  const favoritesElement = document.getElementById("favorites");

  if (favorites.length > 0) {
    favoritesResults.style.display = "block"; // Show the section
    favoritesElement.innerHTML = ""; // Clear the list

    favorites.forEach((image, index) => {
      const imageCard = document.createElement("li");
      imageCard.classList.add("splide__slide");
      imageCard.innerHTML = `
                <div class="image-grid">
                    <img src="${image.src}" alt="${image.alt}">
                    <button class="wishlist-button" data-index="${index}">
                        ❤️
                    </button>
                    <div class="details">
                        <h3>${image.alt}</h3>
                        <p>${image.photographer}</p>
                    </div>
                </div>`;
      favoritesElement.appendChild(imageCard);
    });

    new Splide("#favorites-images", {
      perPage: 5,
      gap: "1rem",
      pagination: false,
      breakpoints: {
        1300: {
            perPage: 4,
        },
        1024: {
          perPage: 3, // Number of slides per page for medium screens
        },
        900: {
          perPage: 2, // Number of slides per page for small screens
        },
        600: {
            perPage: 1,
        }
      },
    }).mount();

    attachRemoveListeners();
  } else {
    favoritesResults.style.display = "none"; // Hide the section if no favorites
  }
}

function attachRemoveListeners() {
  const removeButtons = document.querySelectorAll(".wishlist-button");
  removeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.dataset.index;
      removeFromFavorites(index);
    });
  });
}

// Initial render of favorites
renderFavorites();
