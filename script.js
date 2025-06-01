// Supabase setup
const SUPABASE_URL = "https://gvcerhropofwoobxjdcj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y2VyaHJvcG9md29vYnhqZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzA2NzYsImV4cCI6MjA2NDM0NjY3Nn0.kVSB7rzp3gMb_3t6hvvz8U1-ZKruxIjAkEpc2RQ5BaI";

// Fetch movie data from Supabase
async function fetchMovies() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/movies?select=id,movie_name,release_year,image_url`;
    console.log("Fetching from URL:", url); // Debug: Log the URL
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!res.ok) {
      const errorDetail = await res.text();
      throw new Error(`HTTP error! Status: ${res.status}, Detail: ${errorDetail}`);
    }

    const movies = await res.json();
    console.log("Movies fetched:", movies); // Debug: Log the response
    if (!movies || movies.length === 0) {
      document.getElementById('movies-container').innerHTML = '<p>No movies found in the database.</p>';
      return;
    }
    displayMovies(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    document.getElementById('movies-container').innerHTML = '<p>Error loading movies. Please try again later.</p>';
  }
}

// Render movie cards
function displayMovies(movies) {
  const container = document.getElementById('movies-container');
  container.innerHTML = '';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img src="${movie.image_url || 'https://via.placeholder.com/150'}" alt="${movie.movie_name || 'Unknown Movie'}" />
      <div class="movie-info">
        <h3>${movie.movie_name || 'Unknown Movie'}</h3>
        <p>${movie.release_year || 'Unknown Year'}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// Call fetchMovies when the page loads
document.addEventListener('DOMContentLoaded', fetchMovies);