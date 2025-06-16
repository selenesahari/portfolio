// ✅ Fullscreen Hamburger Menu Toggle
window.toggleMenu = function () {
  const menu = document.getElementById("fullscreenMenu");
  if (menu) {
    menu.classList.toggle("active");
  }
};

// ✅ Dropdown Toggle (Mobile)
window.toggleDropdown = function (event) {
  event.preventDefault();

  if (window.innerWidth < 768) {
    const dropdown = event.target.closest('.dropdown');
    if (dropdown) dropdown.classList.toggle('open');
  }
};

// ✅ Close dropdown if clicking outside (on mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth < 768) {
    const isDropdown = e.target.closest(".dropdown");
    if (!isDropdown) {
      document.querySelectorAll(".dropdown").forEach(drop => drop.classList.remove("open"));
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Load navbar dynamically
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      // Re-attach event listeners
      const hamburger = document.querySelector('.hamburger');
      if (hamburger) {
        hamburger.addEventListener('click', window.toggleMenu);
      }

      const closeBtn = document.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', window.toggleMenu);
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

  // ✅ Load footer dynamically
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
      });
  }
});
