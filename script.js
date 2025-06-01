const DATA_URL = "movieData.json";
const IMAGE_BASE_PATH = "posters/";

fetch(DATA_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load movie data");
    }
    return response.json();
  })
  .then((movies) => {
    const container = document.getElementById("movieContainer");

    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${IMAGE_BASE_PATH + movie.image_name}" alt="${
        movie.movie_name
      }" />
        <div class="movie-details">
          <div class="movie-title">${movie.movie_name} (${
        movie.release_year
      })</div>
          <button class="review-btn" onclick="reviewMovie('${
            movie.movie_name
          }')">Review</button>
        </div>
      `;
      container.appendChild(card);
    });
  })
  .catch((error) => {
    console.error("Error loading movies:", error);
  });

function reviewMovie(title) {
  alert(`You clicked Review for "${title}"`);
}
