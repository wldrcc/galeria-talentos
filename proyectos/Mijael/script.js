const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const backToTop = document.getElementById("back-to-top");

if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

const goToIndex = document.getElementById("go-to-index");

if (goToIndex) {
    goToIndex.addEventListener("click", () => {
        window.location.href = "index2.html";
    });
}
document.addEventListener("mousemove", (e) => {
    const particle = document.createElement("div");

    particle.classList.add("cursor-particle");

    particle.style.left = e.clientX + "px";
    particle.style.top = e.clientY + "px";

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 600);
});