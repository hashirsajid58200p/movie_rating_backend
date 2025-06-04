// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function () {
  // Initialize Supabase
  while (!window.supabase) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const supabaseUrl = 'https://gvcerhropofwoobxjdcj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y2VyaHJvcG9md29vYnhqZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzA2NzYsImV4cCI6MjA2NDM0NjY3Nn0.kVSB7rzp3gMb_3t6hvvz8U1-ZKruxIjAkEpc2RQ5BaI';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Load movies function
  async function loadMovies() {
    try {
      const { data: movies, error } = await supabaseClient
        .from("movies")
        .select("id, movie_name, release_year, image_url");

      if (error) throw error;

      const container = document.getElementById("movies-container");
      container.innerHTML = '';

      if (!movies || movies.length === 0) {
        container.innerHTML = '<p>No movies available</p>';
        return;
      }

      movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.image_url || 'https://via.placeholder.com/150'}" 
               alt="${movie.movie_name || 'Movie poster'}">
          <div class="movie-info">
            <h3>${movie.movie_name || 'Untitled Movie'}</h3>
            <p>${movie.release_year || 'Year unknown'}</p>
            <button class="review-button" data-movie-id="${movie.id}">
              Add Review
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      document.querySelectorAll('.review-button').forEach(btn => {
        btn.addEventListener('click', () => openReviewModal(btn.dataset.movieId));
      });

    } catch (error) {
      console.error("Error loading movies:", error);
      document.getElementById("movies-container").innerHTML =
        '<p class="error">Failed to load movies. Please refresh.</p>';
    }
  }

  // Initial movie load
  await loadMovies();

  // Login modal handlers
  document.getElementById("login-btn").addEventListener("click", function () {
    document.getElementById("login-modal").classList.remove("hidden");
    document.getElementById("login-error").textContent = "";
  });

  document.getElementById("close-login").addEventListener("click", function () {
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("login-error").textContent = "";
  });

  // Login form handler
  document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const loginError = document.getElementById("login-error");
    loginError.textContent = "Logging in with default credentials...";

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: "admin@example.com",
        password: "admin123"
      });

      if (error) {
        console.error("Login error:", error);
        loginError.textContent = "Invalid login credentials";
        return;
      }

      // Redirect to admin page
      window.location.href = "admin.html";
    } catch (err) {
      console.error("Unexpected login error:", err);
      loginError.textContent = "Unexpected error. Please try again.";
    }
  });

  // Review modal functions
  let currentMovieId = null;
  let selectedRating = 0;

  async function openReviewModal(movieId) {
    currentMovieId = movieId;
    const modal = document.getElementById("review-modal");
    modal.classList.remove("hidden");

    try {
      const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("review_text, rating, created_at")
        .eq("movie_id", movieId)
        .order("created_at", { ascending: false });

      const reviewsList = document.getElementById("reviews-list");
      reviewsList.innerHTML = '';

      if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
          reviewsList.innerHTML += `
            <div class="review-item">
              <p><strong>${review.rating} ⭐</strong></p>
              <p>${review.review_text}</p>
              <p><small>${new Date(review.created_at).toLocaleString()}</small></p>
            </div>`;
        });
      } else {
        reviewsList.innerHTML = '<p>No reviews yet</p>';
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }

    document.getElementById("submit-review").onclick = async function () {
      const reviewText = document.getElementById("review-text").value.trim();
      if (!selectedRating || !reviewText) {
        alert("Please select a rating and write a review");
        return;
      }

      try {
        const { error } = await supabaseClient.from("reviews").insert({
          movie_id: currentMovieId,
          rating: selectedRating,
          review_text: reviewText
        });

        if (error) throw error;

        document.getElementById("review-text").value = "";
        showNotification();
        await openReviewModal(currentMovieId);
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    };

    document.getElementById("cancel-review").onclick = function () {
      modal.classList.add("hidden");
      document.getElementById("review-text").value = "";
      selectedRating = 0;
      document.querySelectorAll('.star-rating .fa-star').forEach(star => {
        star.classList.remove('selected');
      });
    };
  }

  // Star rating
  document.querySelectorAll('.star-rating .fa-star').forEach(star => {
    star.addEventListener('click', function () {
      selectedRating = this.dataset.rating;
      document.querySelectorAll('.star-rating .fa-star').forEach((s, i) => {
        s.classList.toggle('selected', i < selectedRating);
      });
    });
  });

  // Notification
  function showNotification() {
    const notification = document.getElementById("notification");
    notification.classList.remove("hidden");
    setTimeout(function () {
      notification.classList.add("hidden");
    }, 3000);
  }
});
