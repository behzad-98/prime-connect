// ============================================================
// MAIN.JS - Common scripts
// ============================================================

console.log("PRIME CONNECT & SOLUTIONS - main.js loaded ✅");

// ---------- 3D Tilt on floating icons + image ----------
document.addEventListener("DOMContentLoaded", function () {
    const tiltEls = document.querySelectorAll("[data-tilt]");

    tiltEls.forEach((el) => {
        const inner = el.querySelector(".fi-inner") || el;

        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            inner.style.transform =
                `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
        });

        el.addEventListener("mouseleave", () => {
            inner.style.transform = "";
        });
    });
});

// ============================================================
// ABOUT SECTION - Scroll Reveal Animation
// ============================================================
document.addEventListener("DOMContentLoaded", function () {

    const aboutSection = document.querySelector(".about-section");
    if (!aboutSection) return;

    // IntersectionObserver se reveal
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    // Content + visual + branding reveal
    const revealEls = aboutSection.querySelectorAll(
        ".about-content, .about-visual, .about-branding, .highlight-card"
    );

    revealEls.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = `opacity 0.8s ${i * 0.08}s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s ${i * 0.08}s cubic-bezier(0.22, 1, 0.36, 1)`;
        observer.observe(el);
    });

    // Revealed state
    const style = document.createElement("style");
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}); 

// ============================================================
// SERVICE CARDS - 3D Tilt on Hover
// ============================================================
document.addEventListener("DOMContentLoaded", function () {

    const serviceCards = document.querySelectorAll(".service-card[data-tilt]");
    if (!serviceCards.length) return;

    // Touch device check (mobile pe tilt skip)
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    serviceCards.forEach((card) => {
        let rafId = null;

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Reduced intensity for smooth feel
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
            });
        });

        card.addEventListener("mouseleave", () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transform = "";
        });
    });
});

// ============================================================
// EXPERTISE SLIDER
// 2 cards per view desktop, 1 mobile. Prev/Next, Dots, Autoplay, Swipe.
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    const track   = document.getElementById("expertiseTrack");
    const prevBtn = document.getElementById("expertisePrev");
    const nextBtn = document.getElementById("expertiseNext");
    const dotsBox = document.getElementById("expertiseDots");
    if (!track || !prevBtn || !nextBtn || !dotsBox) return;

    const cards = Array.from(track.children);
    const total = cards.length;

    let currentIndex = 0;
    let perView = getPerView();
    let autoplayId = null;
    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let deltaX = 0;

    function getPerView() {
        return window.innerWidth <= 800 ? 1 : 2;
    }

    function getMaxIndex() {
        return Math.max(0, total - perView);
    }

    function getGap() {
        const styles = getComputedStyle(track);
        return parseFloat(styles.gap || styles.columnGap || 0) || 0;
    }

    function getMovePercent() {
        // Move by 1 card at a time
        // Each card width = 100/perView %, minus gap contribution
        const gap = getGap();
        const cardWidth = track.clientWidth / perView - gap * (perView - 1) / perView;
        return ((cardWidth + gap) / track.clientWidth) * 100;
    }

    function updatePositions() {
        perView = getPerView();
        const maxIndex = getMaxIndex();
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        const movePercent = getMovePercent();
        track.style.transform = `translateX(-${currentIndex * movePercent}%)`;

        // Buttons state
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;

        renderDots(maxIndex);
    }

    function renderDots(maxIndex) {
        dotsBox.innerHTML = "";
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement("button");
            dot.className = "expertise-dot" + (i === currentIndex ? " active" : "");
            dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
            dot.addEventListener("click", () => {
                currentIndex = i;
                updatePositions();
                restartAutoplay();
            });
            dotsBox.appendChild(dot);
        }
    }

    function goNext() {
        const maxIndex = getMaxIndex();
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updatePositions();
    }

    function goPrev() {
        const maxIndex = getMaxIndex();
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        updatePositions();
    }

    nextBtn.addEventListener("click", () => { goNext(); restartAutoplay(); });
    prevBtn.addEventListener("click", () => { goPrev(); restartAutoplay(); });

    // ---------- AUTOPLAY ----------
    function startAutoplay() {
        stopAutoplay();
        autoplayId = setInterval(() => {
            if (!isHovered && !isDragging && !document.hidden) {
                goNext();
            }
        }, 4500);
    }
    function stopAutoplay() {
        if (autoplayId) clearInterval(autoplayId);
        autoplayId = null;
    }
    function restartAutoplay() {
        startAutoplay();
    }

    track.addEventListener("mouseenter", () => { isHovered = true; });
    track.addEventListener("mouseleave", () => { isHovered = false; });

    // Pause when page/tab hidden
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    // ---------- SWIPE (Mobile) ----------
    function onDragStart(x) {
        isDragging = true;
        startX = x;
        deltaX = 0;
        track.style.transition = "none";
    }
    function onDragMove(x) {
        if (!isDragging) return;
        deltaX = x - startX;
        const movePercent = getMovePercent();
        const dragPercent = (deltaX / track.clientWidth) * 100;
        track.style.transform = `translateX(-${currentIndex * movePercent - dragPercent}%)`;
    }
    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = "";
        const threshold = track.clientWidth * 0.12;
        if (deltaX > threshold) goPrev();
        else if (deltaX < -threshold) goNext();
        else updatePositions();
        deltaX = 0;
    }

    track.addEventListener("touchstart", (e) => onDragStart(e.touches[0].clientX), { passive: true });
    track.addEventListener("touchmove", (e) => onDragMove(e.touches[0].clientX), { passive: true });
    track.addEventListener("touchend", onDragEnd);

    // Mouse drag (desktop optional)
    track.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onDragStart(e.clientX);
        const onMove = (ev) => onDragMove(ev.clientX);
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            onDragEnd();
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });

    // ---------- RESIZE ----------
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updatePositions();
        }, 150);
    });

    // ---------- INIT ----------
    updatePositions();
    startAutoplay();
});

// ============================================================
// CONTACT FORM — WhatsApp Modal, Other Service, FormSubmit integration
// ============================================================
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("primeContactForm");
    if (!form) return;

    const serviceSelect = document.getElementById("cfService");
    const otherServiceWrap = document.getElementById("cfOtherServiceWrap");
    const otherServiceInput = document.getElementById("cfOtherService");
    const successOverlay = document.getElementById("cfSuccessOverlay");
    const successClose = document.getElementById("cfSuccessClose");
    const submitBtn = document.getElementById("cfSubmitBtn");

    // ---------- 1. "Other" service reveal ----------
    if (serviceSelect && otherServiceWrap && otherServiceInput) {
        serviceSelect.addEventListener("change", function () {
            if (this.value === "Other") {
                otherServiceWrap.classList.add("active");
                otherServiceInput.required = true;
                setTimeout(() => otherServiceInput.focus(), 150);
            } else {
                otherServiceWrap.classList.remove("active");
                otherServiceInput.required = false;
                otherServiceInput.value = "";
            }
        });
    }

    // ---------- 2. Form validation ----------
    function validateForm() {
        // Simple native check
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        // Extra: phone length check
        const phone = document.getElementById("cfPhone");
        if (phone && phone.value.trim().length < 7) {
            phone.focus();
            phone.reportValidity();
            return false;
        }
        return true;
    }

    // ---------- 3. Form submit ----------
    form.addEventListener("submit", function (e) {
        // Stop if invalid
        if (!validateForm()) {
            e.preventDefault();
            return;
        }

        // Add loading state
        if (submitBtn) {
            submitBtn.classList.add("loading");
            submitBtn.disabled = true;
            submitBtn.querySelector("span").textContent = "Submitting...";
        }

        // Show success overlay after short delay
        // (FormSubmit will submit in background; we show success on submit start)
        setTimeout(() => {
            if (successOverlay) {
                successOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }, 900);
    });

    // ---------- 4. Close success modal ----------
    function closeSuccess() {
        if (successOverlay) {
            successOverlay.classList.remove("active");
            document.body.style.overflow = "";
        }
        // Reset form
        form.reset();
        if (otherServiceWrap) otherServiceWrap.classList.remove("active");
        if (otherServiceInput) otherServiceInput.required = false;

        // Reset button
        if (submitBtn) {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Submit Your Enquiry";
        }
    }

    if (successClose) {
        successClose.addEventListener("click", closeSuccess);
    }

    if (successOverlay) {
        successOverlay.addEventListener("click", function (e) {
            if (e.target === successOverlay) closeSuccess();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && successOverlay && successOverlay.classList.contains("active")) {
            closeSuccess();
        }
    });

    // ---------- 5. URL param check (fallback if user gets redirected) ----------
    const params = new URLSearchParams(window.location.search);
    if (params.get("submitted") === "true" && successOverlay) {
        successOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

});