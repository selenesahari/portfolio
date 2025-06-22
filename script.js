// Expose toggleMenu globally so it works with inline onclick
window.toggleMenu = function () {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");

  // Close any open dropdown when menu closes
  if (!nav.classList.contains("active")) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) dropdown.classList.remove('open');
  }
};

window.toggleDropdown = function (event) {
  event.preventDefault();

  // Only toggle dropdown in mobile view
  if (window.innerWidth < 768) {
    const dropdown = event.target.closest('.dropdown');
    if (dropdown) dropdown.classList.toggle('open');
  }
};

// Optional: close dropdowns if clicking outside (on mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth < 768) {
    const isDropdown = e.target.closest(".dropdown");
    if (!isDropdown) {
      document.querySelectorAll(".dropdown").forEach(drop => drop.classList.remove("open"));
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Load navbar dynamically
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      // Re-attach event listeners after navbar loads
      const hamburger = document.querySelector('.hamburger');
      if (hamburger) {
        hamburger.addEventListener('click', window.toggleMenu);
      }

      const dropdownLabel = document.querySelector('.dropdown-label');
      if (dropdownLabel) {
        dropdownLabel.addEventListener('click', window.toggleDropdown);
      }

      const themeToggle = document.getElementById('themeToggle');
      const currentTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);

      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
        });
      }
    });

  // Load footer dynamically
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
      });
  }
});


function openModal() {
  const modal = document.getElementById("statementModal");
  const isFR = document.body.classList.contains("fr");
  modal.style.display = "block";
  document.getElementById("statement-en").style.display = isFR ? "none" : "block";
  document.getElementById("statement-fr").style.display = isFR ? "block" : "none";
}

function closeModal() {
  document.getElementById("statementModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("statementModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}


function openLightbox(src) {
  const modal = document.getElementById("lightboxModal");
  const img = document.getElementById("lightboxImage");
  modal.style.display = "block";
  img.src = src;
}

function closeLightbox() {
  document.getElementById("lightboxModal").style.display = "none";
}


let currentImageIndex = 0;
let imageSources = [];

document.addEventListener('DOMContentLoaded', () => {
  // Collect all image sources in page order
  imageSources = Array.from(document.querySelectorAll('.photo-card img')).map(img => img.src);

  // Add keyboard arrow support
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById("lightboxModal");
    if (modal.style.display === "block") {
      if (e.key === 'ArrowRight') showNextImage();
      else if (e.key === 'ArrowLeft') showPrevImage();
    }
  });

  // Add swipe support (touch)
  const modal = document.getElementById("lightboxModal");
  let startX = 0;

  modal.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  modal.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) showNextImage();
    else if (endX - startX > 50) showPrevImage();
  });
});

function openLightbox(src) {
  const modal = document.getElementById("lightboxModal");
  const img = document.getElementById("lightboxImage");
  modal.style.display = "block";
  img.src = src;
  currentImageIndex = imageSources.indexOf(src);

  // Wait for image to load before applying panzoom
  img.onload = () => {
    // Destroy any previous panzoom instance
    if (window.currentPanzoom) {
      window.currentPanzoom.destroy();
    }

    // Initialize Panzoom on the container
    const panzoomEl = document.getElementById("lightboxPanzoom");
    window.currentPanzoom = Panzoom(panzoomEl, {
      contain: 'outside',
      maxScale: 5,
      minScale: 1,
      startScale: 1
    });

    // Enable zooming with mouse wheel
    panzoomEl.parentElement.addEventListener('wheel', window.currentPanzoom.zoomWithWheel);
  };
}


function showNextImage() {
  if (currentImageIndex < imageSources.length - 1) {
    currentImageIndex++;
    document.getElementById("lightboxImage").src = imageSources[currentImageIndex];
  }
}

function showPrevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    document.getElementById("lightboxImage").src = imageSources[currentImageIndex];
  }
}



