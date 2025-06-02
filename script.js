const SUPABASE_URL = "https://gvcerhropofwoobxjdcj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y2VyaHJvcG9md29vYnhqZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzA2NzYsImV4cCI6MjA2NDM0NjY3Nn0.kVSB7rzp3gMb_3t6hvvz8U1-ZKruxIjAkEpc2RQ5BaI";

let currentMovieId = null;
let selectedRating = 0;

async function fetchMovies() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/movies?select=id,movie_name,release_year,image_url`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: "cors",
      cache: "no-cache"
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Status ${res.status} – ${errText}`);
    }

    const movies = await res.json();
    console.log("Fetched movies:", movies);
    if (!movies || movies.length === 0) {
      document.getElementById("movies-container").innerHTML = "<p>No movies found in the database.</p>";
      return;
    }
    displayMovies(movies);

  } catch (error) {
    console.error("Error fetching movies:", error);
    document.getElementById("movies-container").innerHTML =
      "<p>Error loading movies: " + error.message + "</p>";
  }
}

function displayMovies(movies) {
  const container = document.getElementById("movies-container");
  container.innerHTML = "";

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img
        src="${movie.image_url || "https://via.placeholder.com/150"}"
        alt="${movie.movie_name || "Unknown Movie"}"
      />
      <div class="movie-info">
        <h3>${movie.movie_name || "Unknown Movie"}</h3>
        <p>${movie.release_year || "Unknown Year"}</p>
        <button class="review-button" data-movie-id="${movie.id}">
          Add Review
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".review-button").forEach((btn) => {
    btn.addEventListener("click", () => openReviewModal(btn.dataset.movieId));
  });
}

async function fetchReviews(movieId) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/reviews?select=review_text,created_at,rating&movie_id=eq.${encodeURIComponent(movieId)}&order=created_at.desc`;
    console.log("Fetching reviews from URL:", url);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: "cors",
      cache: "no-cache"
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("API response error:", errText);
      throw new Error(`Status ${res.status} – ${errText}`);
    }

    const reviews = await res.json();
    console.log("Raw reviews data for movieId", movieId, ":", reviews);
    displayReviews(reviews);
    return reviews;

  } catch (error) {
    console.error("Error fetching reviews:", error);
    const reviewsList = document.getElementById("reviews-list");
    if (reviewsList) {
      reviewsList.innerHTML = `<p>Error loading reviews: ${error.message}</p>`;
    }
    return [];
  }
}

function displayReviews(reviews) {
  const reviewsList = document.getElementById("reviews-list");
  if (!reviewsList) {
    console.error("Reviews list element not found!");
    return;
  }
  reviewsList.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  reviews.forEach((review) => {
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";
    reviewItem.innerHTML = `
      <p><strong>${review.rating || "No rating"} ⭐</strong></p>
      <p>${review.review_text || "No comment"}</p>
      <p><small>${new Date(review.created_at).toLocaleString()}</small></p>
    `;
    reviewsList.appendChild(reviewItem);
  });
}

function showNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("hidden");
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hidden");
  }, 3000);
}

async function submitReview(movieId, rating, reviewText) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/reviews`;
    console.log("Submitting review with movieId:", movieId);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        movie_id: movieId,
        review_text: reviewText,
        rating: rating
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Status ${res.status} – ${errText}`);
    }

    showNotification();
    await fetchReviews(movieId);

    const textarea = document.getElementById("review-text");
    if (textarea) textarea.value = "";
    resetStarRating();

  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Failed to submit review: " + error.message);
  }
}

function openReviewModal(movieId) {
  currentMovieId = movieId;
  selectedRating = 0;
  const modal = document.getElementById("review-modal");
  if (!modal) {
    console.error("Review modal not found!");
    return;
  }
  modal.classList.remove("hidden");
  fetchReviews(movieId);
  resetStarRating();
  document.getElementById("submit-review").onclick = () => {
    const reviewTextEl = document.getElementById("review-text");
    const reviewText = reviewTextEl ? reviewTextEl.value.trim() : "";
    if (selectedRating && reviewText) {
      submitReview(movieId, parseInt(selectedRating), reviewText);
    } else {
      alert("Please select a rating and write a review.");
    }
  };
  document.getElementById("cancel-review").onclick = () => {
    modal.classList.add("hidden");
    const reviewTextEl = document.getElementById("review-text");
    if (reviewTextEl) reviewTextEl.value = "";
    resetStarRating();
  };
}

function resetStarRating() {
  selectedRating = 0;
  document.querySelectorAll(".star-rating .fa-star").forEach((star) => {
    star.classList.remove("selected");
  });
}

document.querySelectorAll(".star-rating .fa-star").forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = star.dataset.rating;
    document.querySelectorAll(".star-rating .fa-star").forEach((s) => {
      s.classList.remove("selected");
    });
    for (let i = 0; i < selectedRating; i++) {
      document.querySelectorAll(".star-rating .fa-star")[i].classList.add("selected");
    }
  });
});

document.addEventListener("DOMContentLoaded", fetchMovies);