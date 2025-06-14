function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");
}

function toggleDropdown(event) {
  event.preventDefault();
  const dropdown = event.target.closest(".dropdown");
  dropdown.classList.toggle("open");
}

// Attach dropdown click handler only on mobile
document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');

  // Only attach toggle if screen is small
  if (window.innerWidth <= 767) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }
});
