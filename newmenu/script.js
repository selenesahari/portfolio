// Expose toggleMenu globally so it works with inline onclick
window.toggleMenu = function () {
  const nav = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const closeIcon = document.getElementById("closeIcon");

  nav.classList.toggle("active");

  const isActive = nav.classList.contains("active");
  if (hamburger) hamburger.style.display = isActive ? "none" : "flex";
  if (closeIcon) closeIcon.style.display = isActive ? "flex" : "none";

  if (!isActive) {
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
      
if (hamburger) hamburger.addEventListener('click', window.toggleMenu);
if (closeIcon) closeIcon.addEventListener('click', window.toggleMenu);


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

window.addEventListener("resize", () => {
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const closeIcon = document.getElementById("closeIcon");
  const screenWidth = window.innerWidth;

  if (screenWidth >= 768) {
    navLinks.classList.remove("active");
    navLinks.style.display = "flex";
    if (hamburger) hamburger.style.display = "none";
    if (closeIcon) closeIcon.style.display = "none";
  } else {
    navLinks.classList.remove("active");
    navLinks.style.display = "none";
    if (hamburger) hamburger.style.display = "flex";
    if (closeIcon) closeIcon.style.display = "none";
  }
});

