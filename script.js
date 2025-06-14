
    function toggleMenu() {
      const nav = document.getElementById("navLinks");
      nav.classList.toggle("active");
    }

    document.addEventListener('DOMContentLoaded', () => {
      const dropdownLabel = document.querySelector('.dropdown-label');
      dropdownLabel.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = dropdownLabel.parentElement;
        dropdown.classList.toggle('open');
      });
    });
