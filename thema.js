document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("theme-toggle");

    function setTheme(theme) {
        if (theme === "light") {
            document.documentElement.style.setProperty("--background-color", "white");
            document.documentElement.style.setProperty("--text-color", "black");
            toggleButton.textContent = "Light Mode";
        } else {
            document.documentElement.style.setProperty("--background-color", "black");
            document.documentElement.style.setProperty("--text-color", "white");
            toggleButton.textContent = "Dark Mode";
        }
        localStorage.setItem("theme", theme);
    }

    // Check of er al een thema is opgeslagen
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    toggleButton.addEventListener("click", function () {
        const newTheme = document.documentElement.style.getPropertyValue("--background-color") === "black" ? "light" : "dark";
        setTheme(newTheme);
    });
});