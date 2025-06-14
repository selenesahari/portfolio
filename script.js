function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");
}

function toggleDropdown(event) {
  event.preventDefault();
  const dropdown = event.target.closest(".dropdown");
  dropdown.classList.toggle("open");
}

// Attach dropdown toggle only for mobile screens
document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');
  if (window.innerWidth <= 767 && dropdownLabel) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }
});
