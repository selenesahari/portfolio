function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");

  // Close any open dropdown when menu closes
  if (!nav.classList.contains("active")) {
    const dropdown = document.querySelector('.dropdown');
    dropdown.classList.remove('open');
  }
}

function toggleDropdown(event) {
  event.preventDefault();

  // Only toggle dropdown in mobile view
  if (window.innerWidth < 768) {
    const dropdown = event.target.closest('.dropdown');
    dropdown.classList.toggle('open');
  }
}

// ✅ Attach listener once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');
  if (dropdownLabel) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }
});

// Optional enhancement: close dropdown if clicked outside (on mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth < 768) {
    const isDropdown = e.target.closest(".dropdown");
    if (!isDropdown) {
      document.querySelectorAll(".dropdown").forEach(drop => drop.classList.remove("open"));
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');
  if (dropdownLabel) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }

  // ✅ Dark mode toggle logic
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
});

  // Load navbar into #navbar-container
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;
    });

