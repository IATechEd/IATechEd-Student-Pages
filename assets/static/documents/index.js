/* Used basically only for development when I'm too lazy to reload
setTimeout(() => {
  location.reload();
}, 1000);
*/
//console.log(window.innerWidth, window.innerHeight);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".projectDescription").forEach((description) => {
    const button = description.nextElementSibling;
    if (!button?.classList.contains("descriptionToggle")) return;

    if (description.scrollHeight > description.clientHeight) {
      button.hidden = false;
    }

    button.addEventListener("click", () => {
      const expanded = description.classList.toggle("expanded");
      button.textContent = expanded ? "Show less" : "Show more";
      button.setAttribute("aria-expanded", String(expanded));
    });
  });
});
