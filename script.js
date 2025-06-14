function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");

  // Close dropdown if menu is closed
  if (!nav.classList.contains("active")) {
    const dropdown = document.querySelector('.dropdown');
    dropdown.classList.remove('open');
  }
}

function toggleDropdown(event) {
  event.preventDefault();

  // Only apply dropdown toggle in mobile view
  if (window.innerWidth < 768) {
    const dropdown = event.target.closest('.dropdown');
    dropdown.classList.toggle('open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dropdownLabel = document.querySelector('.dropdown-label');
  if (dropdownLabel) {
    dropdownLabel.addEventListener('click', toggleDropdown);
  }
});
