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
