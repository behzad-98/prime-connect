// ============================================================
// NAVBAR.JS - Sticky + Hamburger + Mobile Menu Logic
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const navbar    = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link, .mobile-cta");

    // ---------- 1. STICKY SCROLL EFFECT ----------
    function handleScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check

    // ---------- 2. HAMBURGER TOGGLE ----------
    function openMenu() {
        hamburger.classList.add("active");
        mobileMenu.classList.add("active");
        hamburger.setAttribute("aria-label", "Close menu");
        document.body.style.overflow = "hidden"; // scroll lock
    }

    function closeMenu() {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        hamburger.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = "";
    }

    function toggleMenu() {
        if (mobileMenu.classList.contains("active")) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    hamburger.addEventListener("click", toggleMenu);

    // ---------- 3. MENU LINK CLICK => CLOSE ----------
    mobileLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // ---------- 4. OUTSIDE CLICK => CLOSE ----------
    document.addEventListener("click", function (e) {
        if (
            mobileMenu.classList.contains("active") &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            closeMenu();
        }
    });

    // ---------- 5. ESC KEY => CLOSE ----------
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
            closeMenu();
        }
    });

    // ---------- 6. RESIZE => CLOSE IF DESKTOP ----------
    window.addEventListener("resize", function () {
        if (window.innerWidth > 900 && mobileMenu.classList.contains("active")) {
            closeMenu();
        }
    });

});