
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. ELEMENTS AND SETTINGS
    // =========================================

    const nav = document.querySelector(".site-nav");
    const themeToggle = document.getElementById("theme-toggle");
    const menuToggle = document.getElementById("menu-toggle");
    const mobileNavigation = document.getElementById("mobile-navigation");
    const backToTop = document.getElementById("back-to-top");

    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const motionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const THEME_KEY = "portfolio-theme";

    const navLinks = Array.from(
        document.querySelectorAll('.nav-links a[href^="#"]')
    );

    const sections = navLinks
        .map(link => {
            const id = link.getAttribute("href").slice(1);
            return document.getElementById(id);
        })
        .filter(Boolean);


    // =========================================
    // 2. LUCIDE ICONS
    // =========================================

    function initializeIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function changeIcon(button, iconName) {
        if (!button) return;

        button.innerHTML =
            `<i data-lucide="${iconName}" aria-hidden="true"></i>`;

        initializeIcons();
    }

    initializeIcons();


    // =========================================
    // 3. LOCAL STORAGE HELPERS
    // =========================================

    function readTheme() {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch (error) {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (error) {
            // The website remains functional without storage.
        }
    }


    // =========================================
    // 4. DARK MODE
    // =========================================

    function setTheme(theme) {
        const isDark = theme === "dark";

        document.body.classList.toggle("dark-mode", isDark);

        document.documentElement.style.colorScheme =
            isDark ? "dark" : "light";

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "aria-pressed",
                String(isDark)
            );

            changeIcon(themeToggle, isDark ? "sun" : "moon");
        }
    }

    const savedTheme = readTheme();

    setTheme(savedTheme === "dark" ? "dark" : "light");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.contains(
                "dark-mode"
            );

            const nextTheme = isDark ? "light" : "dark";

            setTheme(nextTheme);
            saveTheme(nextTheme);
        });
    }


    // =========================================
    // 5. HAMBURGER MENU
    // =========================================

    function isMenuOpen() {
        return mobileNavigation
            ? mobileNavigation.classList.contains("open")
            : false;
    }

    function setMenuState(open) {
        if (!menuToggle || !mobileNavigation) return;

        const shouldOpen = Boolean(open && mobileQuery.matches);

        mobileNavigation.classList.toggle("open", shouldOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            shouldOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        changeIcon(menuToggle, shouldOpen ? "x" : "menu");
    }

    if (menuToggle && mobileNavigation) {

        menuToggle.addEventListener("click", () => {
            setMenuState(!isMenuOpen());
        });

        // Close menu when a link is selected.
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                setMenuState(false);
            });
        });

        // Close menu with Escape.
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && isMenuOpen()) {
                setMenuState(false);
                menuToggle.focus();
            }
        });

        // Close menu when clicking outside it.
        document.addEventListener("click", event => {
            if (!isMenuOpen()) return;

            const target = event.target;

            if (
                !mobileNavigation.contains(target) &&
                !menuToggle.contains(target)
            ) {
                setMenuState(false);
            }
        });

        // Reset when crossing the mobile breakpoint.
        mobileQuery.addEventListener("change", () => {
            setMenuState(false);
            scheduleUpdate();
        });

        setMenuState(false);
    }


    // =========================================
    // 6. ACTIVE NAVIGATION
    // =========================================

    function updateActiveNavigation() {
        if (sections.length === 0) return;

        const navHeight = nav ? nav.offsetHeight : 0;

        const scrollPosition =
            window.scrollY + navHeight + 100;

        let activeId = null;

        for (const section of sections) {
            if (section.offsetTop <= scrollPosition) {
                activeId = section.id;
            }
        }

        const atBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 5;

        if (atBottom && document.getElementById("contact")) {
            activeId = "contact";
        }

        navLinks.forEach(link => {
            const targetId =
                link.getAttribute("href").slice(1);

            const active = targetId === activeId;

            link.classList.toggle("active", active);

            if (active) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }


    // =========================================
    // 7. BACK TO TOP
    // =========================================

    function updateBackToTop() {
        if (!backToTop) return;

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 400
        );
    }

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: motionQuery.matches
                    ? "auto"
                    : "smooth"
            });
        });
    }


    // =========================================
    // 8. OPTIMIZED SCROLL AND RESIZE
    // =========================================

    let updateScheduled = false;

    function updatePageState() {
        updateActiveNavigation();
        updateBackToTop();
    }

    function scheduleUpdate() {
        if (updateScheduled) return;

        updateScheduled = true;

        window.requestAnimationFrame(() => {
            updatePageState();
            updateScheduled = false;
        });
    }

    window.addEventListener("scroll", scheduleUpdate, {
        passive: true
    });

    window.addEventListener("resize", scheduleUpdate, {
        passive: true
    });

    window.addEventListener("load", scheduleUpdate);

    window.addEventListener("hashchange", scheduleUpdate);


    // =========================================
    // 9. INITIAL STATE
    // =========================================

    updatePageState();

});
