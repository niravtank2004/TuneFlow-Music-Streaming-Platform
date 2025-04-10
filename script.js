// Dark Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

// Check for saved theme preference
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
  sunIcon.classList.remove("hidden");
  moonIcon.classList.add("hidden");
} else {
  document.documentElement.classList.remove("dark");
  sunIcon.classList.add("hidden");
  moonIcon.classList.remove("hidden");
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  sunIcon.classList.toggle("hidden");
  moonIcon.classList.toggle("hidden");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
});

// Music Player Class
class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentSongIndex = 0;
    this.isPlaying = false;
    this.isShuffled = false;
    this.repeatMode = "none"; // 'none', 'one', 'all'

    // DOM Elements
    this.playPauseBtn = document.getElementById("play-pause-btn");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.rewindBtn = document.getElementById("rewind-btn");
    this.forwardBtn = document.getElementById("forward-btn");
    this.progressContainer = document.getElementById("progress-container");
    this.progressBar = document.getElementById("progress-bar");
    this.bufferBar = document.getElementById("buffer-bar");
    this.progressHandle = document.getElementById("progress-handle");
    this.currentTimeEl = document.getElementById("current-time");
    this.durationEl = document.getElementById("duration");
    this.nowPlayingCover = document.getElementById("now-playing-cover");
    this.nowPlayingTitle = document.getElementById("now-playing-title");
    this.nowPlayingArtist = document.getElementById("now-playing-artist");
    this.volumeSlider = document.getElementById("volume-slider");

    // Event Listeners
    this.playPauseBtn.addEventListener("click", () => this.togglePlay());
    this.prevBtn.addEventListener("click", () => this.playPrevious());
    this.nextBtn.addEventListener("click", () => this.playNext());
    this.rewindBtn.addEventListener("click", () => this.rewind());
    this.forwardBtn.addEventListener("click", () => this.forward());
    this.progressContainer.addEventListener("click", (e) =>
      this.setProgress(e)
    );
    this.volumeSlider.addEventListener("input", (e) =>
      this.setVolume(e.target.value)
    );
    this.audio.addEventListener("timeupdate", () => this.updateProgress());
    this.audio.addEventListener("loadedmetadata", () => this.updateDuration());
    this.audio.addEventListener("ended", () => this.handleSongEnd());
    this.audio.addEventListener("progress", () => this.updateBuffer());

    // Initialize
    this.loadSong(songs[0]);
    this.setVolume(70); // Set initial volume
  }

  loadSong(song) {
    this.audio.src = song.audio;
    this.nowPlayingCover.src = song.cover;
    this.nowPlayingTitle.textContent = song.title;
    this.nowPlayingArtist.textContent = song.artist;
    this.durationEl.textContent = song.duration;
  }

  playSong() {
    this.audio.play();
    this.isPlaying = true;
    this.updatePlayPauseButton();
  }

  pauseSong() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayPauseButton();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pauseSong();
    } else {
      this.playSong();
    }
  }

  updatePlayPauseButton() {
    const playIcon = `
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
    const pauseIcon = `
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
    this.playPauseBtn.innerHTML = this.isPlaying ? pauseIcon : playIcon;
  }

  playPrevious() {
    this.currentSongIndex =
      (this.currentSongIndex - 1 + songs.length) % songs.length;
    this.loadSong(songs[this.currentSongIndex]);
    this.playSong();
  }

  playNext() {
    this.currentSongIndex = (this.currentSongIndex + 1) % songs.length;
    this.loadSong(songs[this.currentSongIndex]);
    this.playSong();
  }

  rewind() {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
  }

  forward() {
    this.audio.currentTime = Math.min(
      this.audio.duration,
      this.audio.currentTime + 10
    );
  }

  setVolume(volume) {
    this.audio.volume = volume / 100;
  }

  updateProgress() {
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.progressHandle.style.left = `${progress}%`;

    // Update current time display
    const minutes = Math.floor(this.audio.currentTime / 60);
    const seconds = Math.floor(this.audio.currentTime % 60);
    this.currentTimeEl.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  updateBuffer() {
    if (this.audio.buffered.length > 0) {
      const bufferedEnd = this.audio.buffered.end(
        this.audio.buffered.length - 1
      );
      const bufferPercent = (bufferedEnd / this.audio.duration) * 100;
      this.bufferBar.style.width = `${bufferPercent}%`;
    }
  }

  updateDuration() {
    const minutes = Math.floor(this.audio.duration / 60);
    const seconds = Math.floor(this.audio.duration % 60);
    this.durationEl.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  setProgress(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const progress = (x / width) * 100;
    this.audio.currentTime = (progress / 100) * this.audio.duration;
  }

  handleSongEnd() {
    if (this.repeatMode === "one") {
      this.audio.currentTime = 0;
      this.playSong();
    } else if (this.repeatMode === "all" || this.repeatMode === "none") {
      this.playNext();
    }
  }
}

// Initialize player
const player = new MusicPlayer();

// Create song cards
function createSongCard(song) {
  const card = document.createElement("div");
  card.className =
    "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer";
  card.innerHTML = `
    <img src="${song.cover}" alt="${song.title}" class="w-full h-48 object-cover">
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${song.title}</h3>
      <p class="text-gray-600 dark:text-gray-400">${song.artist}</p>
      <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">${song.duration}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    player.currentSongIndex = songs.indexOf(song);
    player.loadSong(song);
    player.playSong();
  });

  return card;
}

// Populate song sections
const featuredSongs = document.getElementById("featured-songs");
const popularSongs = document.getElementById("popular-songs");

// Add first 5 songs to featured section
songs.slice(0, 5).forEach((song) => {
  featuredSongs.appendChild(createSongCard(song));
});

// Add all songs to popular section
songs.forEach((song) => {
  popularSongs.appendChild(createSongCard(song));
});

// Search functionality
const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const allCards = document.querySelectorAll(".music-card");

  allCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const artist = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(searchTerm) || artist.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Navigation menu functionality
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // Remove active class from all links
    navLinks.forEach((l) =>
      l.classList.remove("text-primary-600", "dark:text-primary-400")
    );
    // Add active class to clicked link
    link.classList.add("text-primary-600", "dark:text-primary-400");
  });
});
