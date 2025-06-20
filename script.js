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
