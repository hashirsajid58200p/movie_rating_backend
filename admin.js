document.addEventListener('DOMContentLoaded', async function() {
  const supabaseUrl = 'https://gvcerhropofwoobxjdcj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y2VyaHJvcG9md29vYnhqZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzA2NzYsImV4cCI6MjA2NDM0NjY3Nn0.kVSB7rzp3gMb_3t6hvvz8U1-ZKruxIjAkEpc2RQ5BaI';
  const supabaseAdmin = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Check for session using Supabase only
  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.getSession();
  if (sessionError || !sessionData.session) {
    window.location.href = "index.html?error=no_session";
    return;
  }

  // Logout handler
  document.getElementById("logout-button").addEventListener("click", async function() {
    await supabaseAdmin.auth.signOut();
    window.location.href = "index.html";
  });

  async function loadExistingMovies() {
    try {
      const container = document.getElementById("movies-list");
      container.innerHTML = "<p>Loading movies...</p>";

      const { data: movies, error } = await supabaseAdmin
        .from("movies")
        .select("id, movie_name, release_year, image_url")
        .order("created_at", { ascending: false });

      if (error) throw error;

      container.innerHTML = "";

      if (!movies || movies.length === 0) {
        container.innerHTML = "<p>No movies found in database</p>";
        return;
      }

      movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-admin-card";
        card.innerHTML = `
          <img src="${movie.image_url}" 
               onerror="this.src='https://via.placeholder.com/150'"
               alt="${movie.movie_name}">
          <h3>${movie.movie_name}</h3>
          <p>${movie.release_year}</p>
          <button class="delete-button" data-movie-id="${movie.id}">Delete</button>
        `;
        container.appendChild(card);
      });

      document.querySelectorAll(".delete-button").forEach(btn => {
        btn.addEventListener("click", function () {
          deleteMovie(this.dataset.movieId);
        });
      });

    } catch (error) {
      console.error("Failed to load movies:", error);
      document.getElementById("movies-list").innerHTML =
        `<p class="error">Error loading movies: ${error.message}</p>`;
    }
  }

  await loadExistingMovies();

  document.getElementById("add-movie-button").addEventListener("click", async function(e) {
    e.preventDefault();
    const title = document.getElementById("movie-title").value.trim();
    const year = document.getElementById("movie-year").value.trim();
    const file = document.getElementById("movie-poster").files[0];

    document.getElementById("add-error").textContent = "";
    document.getElementById("add-success").textContent = "";

    if (!title || !year || !file) {
      document.getElementById("add-error").textContent = "All fields are required";
      return;
    }

    try {
      this.disabled = true;
      this.textContent = "Uploading...";

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("posters")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("posters")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabaseAdmin.from("movies").insert({
        movie_name: title,
        release_year: year,
        image_url: publicUrl
      });

      if (insertError) throw insertError;

      document.getElementById("movie-title").value = "";
      document.getElementById("movie-year").value = "";
      document.getElementById("movie-poster").value = "";

      document.getElementById("add-success").textContent = "Movie added successfully!";
      setTimeout(() => {
        document.getElementById("add-success").textContent = "";
      }, 3000);

      await loadExistingMovies();

    } catch (error) {
      console.error("Failed to add movie:", error);
      document.getElementById("add-error").textContent = error.message;
    } finally {
      this.disabled = false;
      this.textContent = "Submit New Movie";
    }
  });

  async function deleteMovie(movieId) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const { data: movie, error: fetchError } = await supabaseAdmin
        .from("movies")
        .select("image_url")
        .eq("id", movieId)
        .single();

      if (fetchError) throw fetchError;

      const filePath = movie.image_url.split('/object/public/')[1];
      await supabaseAdmin.storage.from("posters").remove([filePath]);

      const { error: deleteError } = await supabaseAdmin
        .from("movies")
        .delete()
        .eq("id", movieId);

      if (deleteError) throw deleteError;

      await loadExistingMovies();
    } catch (error) {
      console.error("Failed to delete movie:", error);
      alert("Error deleting movie: " + error.message);
    }
  }
});
