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
  // Always prevent default
  event.preventDefault();

  // Only toggle dropdown in mobile view
  if (window.innerWidth < 768) {
    const dropdown = event.target.closest('.dropdown');
    dropdown.classList.toggle('open');
  }
}

// ✅ Always attach listener (safe regardless of screen size)
document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');
  if (dropdownLabel) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }
});
