const movies = [
  {
    title: "Inception",
    year: 2010,
    poster: "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SY679_.jpg"
  },
  {
    title: "Interstellar",
    year: 2014,
    poster: "https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SY679_.jpg"
  },
  {
    title: "The Dark Knight",
    year: 2008,
    poster: "https://m.media-amazon.com/images/I/51k0qa6qWGL._AC_.jpg"
  }
];

const container = document.getElementById("movieContainer");

movies.forEach(movie => {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.innerHTML = `
    <img src="${movie.poster}" alt="${movie.title}" />
    <div class="movie-details">
      <div class="movie-title">${movie.title} (${movie.year})</div>
      <button class="review-btn" onclick="reviewMovie('${movie.title}')">Review</button>
    </div>
  `;
  container.appendChild(card);
});

function reviewMovie(title) {
  alert(`You clicked Review for "${title}"`);
}
