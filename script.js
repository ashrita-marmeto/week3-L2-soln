const API_KEY = '2HD83kjOvFX7E5aKKE5kTbmsvCOjVG4XwW1nXBJYqeq1IoZLrzSq5vtq';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const imageDisplay = document.getElementById('image-display');
const similarImages = document.getElementById('similar-images');
const favoritesImages = document.getElementById('favorites-images');

// Load favorites from localStorage
document.addEventListener('DOMContentLoaded', loadFavorites);

searchButton.addEventListener('click', searchImages);

// Trigger search on pressing 'Enter' key
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchImages();
    }
});

function searchImages() {
    const query = searchInput.value;
    fetch(`https://api.pexels.com/v1/search?query=${query}`, {
        headers: {
            Authorization: API_KEY ,
        }
    })
    .then(response => response.json())
    .then(data => displayImages(data.photos))
    .catch(error => console.error('Error fetching images:', error));
}

function displayImages(images) {
    imageDisplay.innerHTML = ''; // Clear previous image
    similarImages.innerHTML = ''; // Clear similar images

    if (images.length > 0) {
        const firstImage = images[0];
        displayMainImage(firstImage);

        images.slice(1, 5).forEach(image => {
            const imgElement = createImageElement(image);
            similarImages.appendChild(imgElement);
        });
    }
}

function displayMainImage(image) {
    imageDisplay.innerHTML = `
        <div class="image-item">
            <img src="${image.src.medium}" alt="${image.alt}">
            <div class="image-desc">
            <h2>${image.alt}</h2>
            <p>${image.photographer}</p>
            <button class="btn" onclick="window.open('${image.photographer_url}', '_blank')">EXPLORE MORE</button>
            </div>
        </div>
    `;
}

function createImageElement(image) {
    const div = document.createElement('div');
    div.classList.add('image-item');
    div.innerHTML = `
        <img src="${image.src.medium}" alt="${image.alt}">
        <span class="heart-icon" onclick="toggleFavorite(this, ${image.id}, '${image.src.medium}', '${image.alt}')"><i class="fa-solid fa-heart"></i></span>
    `;
    return div;
}

function toggleFavorite(element, id, src, alt) {
    let favorites = getFavorites();
    //console.log("Image URL: ", src)
    if (element.classList.contains('active')) {
        element.classList.remove('active');
        favorites = favorites.filter(fav => fav.id !== id);
    } else {
        element.classList.add('active');
        favorites.push({ id, src: encodeURIComponent(src), alt });
    }
    saveFavorites(favorites);
    renderFavorites();
}

function renderFavorites() {
    favoritesImages.innerHTML = '';
    const favorites = getFavorites();
    favorites.forEach(favorite => {
        const imgElement = createImageElement(favorite);
        imgElement.querySelector('.heart-icon').classList.add('active');
        favoritesImages.appendChild(imgElement);
    });
}

function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function loadFavorites() {
    renderFavorites();
}


const sortButton = document.getElementById('sort-button');

sortButton.addEventListener('click', sortFavorites);

function sortFavorites() {
    let favorites = getFavorites();
    favorites.sort((a, b) => a.alt.localeCompare(b.alt));
    saveFavorites(favorites);
    renderFavorites();
}
