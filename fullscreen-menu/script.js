function toggleMenu() {
  const menu = document.getElementById("fullscreenMenu");
  const hamburger = document.getElementById("hamburger");
  menu.classList.toggle("show");
  hamburger.classList.toggle("active");
}

// Close menu with ESC key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const menu = document.getElementById("fullscreenMenu");
    const hamburger = document.getElementById("hamburger");
    if (menu.classList.contains("show")) {
      menu.classList.remove("show");
      hamburger.classList.remove("active");
    }
  }
});
