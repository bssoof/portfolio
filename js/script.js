(() => {
    const html = document.documentElement;
    const isArabic = html.lang === "ar";
    const whatsappNumber = "972569906492";

    const menuToggle = document.getElementById("menuToggle");
    const siteNav = document.getElementById("siteNav");
    const backToTop = document.getElementById("backToTop");
    const siteHeader = document.querySelector(".site-header");
    const themeToggle = document.getElementById("themeToggle");
    const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    window.dataLayer = window.dataLayer || [];
    let hasTracked75 = false;

    const trackEvent = (eventName, payload = {}) => {
        window.dataLayer.push({
            event: eventName,
            ...payload
        });
    };

    const openExternalUrl = (url) => {
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
            window.location.href = url;
        }
    };

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    html.setAttribute("data-theme", initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
            html.setAttribute("data-theme", nextTheme);
            localStorage.setItem("theme", nextTheme);
            trackEvent("theme_toggle", { theme: nextTheme });
        });
    }

    const setMenuOpen = (open) => {
        if (!menuToggle || !siteNav) return;
        menuToggle.setAttribute("aria-expanded", String(open));
        siteNav.classList.toggle("is-open", open);
    };

    if (menuToggle && siteNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            setMenuOpen(!isOpen);
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    const handleSectionFocus = () => {
        const y = window.scrollY + 130;
        let currentId = "";

        sections.forEach((section) => {
            if (y >= section.offsetTop) {
                currentId = section.id;
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            if (href.startsWith("#") && href.length > 1) {
                link.classList.toggle("is-active", href === `#${currentId}`);
            }
        });
    };

    const handleScrollState = () => {
        const y = window.scrollY;

        if (siteHeader) {
            siteHeader.classList.toggle("is-scrolled", y > 10);
        }

        if (backToTop) {
            backToTop.classList.toggle("is-visible", y > 420);
        }

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? y / docHeight : 0;
        if (!hasTracked75 && progress >= 0.75) {
            hasTracked75 = true;
            trackEvent("scroll_75");
        }

        handleSectionFocus();
    };

    window.addEventListener("scroll", handleScrollState, { passive: true });
    handleScrollState();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        anchor.addEventListener("click", (event) => {
            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

            window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
        });
    });

    document.querySelectorAll("[data-track]").forEach((node) => {
        node.addEventListener("click", () => {
            const eventName = node.getAttribute("data-track");
            if (!eventName) return;

            const payload = {};
            Array.from(node.attributes).forEach((attr) => {
                if (attr.name.startsWith("data-") && attr.name !== "data-track") {
                    const key = attr.name.replace("data-", "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                    payload[key] = attr.value;
                }
            });

            trackEvent(eventName, payload);
        });
    });

    const revealNodes = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-revealed");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.16 });

        revealNodes.forEach((node) => revealObserver.observe(node));
    } else {
        revealNodes.forEach((node) => node.classList.add("is-revealed"));
    }

    const form = document.getElementById("qualifyForm");
    const formStatus = document.getElementById("formStatus");

    const validationMessage = isArabic
        ? "رجاءً أكمل الحقول المطلوبة قبل المتابعة."
        : "Please complete the required fields before continuing.";

    const readyMessage = isArabic
        ? "تم تجهيز الرسالة. إذا لم يُفتح واتساب تلقائيًا اضغط زر واتساب مرة أخرى."
        : "Message is ready. If WhatsApp did not open automatically, click your WhatsApp CTA again.";

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!form.reportValidity()) {
                if (formStatus) formStatus.textContent = validationMessage;
                return;
            }

            const getValue = (fieldName) => {
                const field = form.elements.namedItem(fieldName);
                return field && "value" in field ? field.value.trim() : "";
            };

            const values = {
                name: getValue("name"),
                business_type: getValue("business_type"),
                budget_range: getValue("budget_range"),
                timeline: getValue("timeline"),
                project_goal: getValue("project_goal"),
                message: getValue("message")
            };

            const lines = isArabic
                ? [
                    "مرحباً Basil، عندي مشروع جديد.",
                    "",
                    `الاسم: ${values.name}`,
                    `نوع النشاط: ${values.business_type}`,
                    `الميزانية: ${values.budget_range}`,
                    `المدة: ${values.timeline}`,
                    `الهدف الرئيسي: ${values.project_goal}`,
                    `تفاصيل إضافية: ${values.message || "لا يوجد"}`
                ]
                : [
                    "Hi Basil, I have a new project.",
                    "",
                    `Name: ${values.name}`,
                    `Business type: ${values.business_type}`,
                    `Budget range: ${values.budget_range}`,
                    `Timeline: ${values.timeline}`,
                    `Primary goal: ${values.project_goal}`,
                    `Extra details: ${values.message || "N/A"}`
                ];

            const text = encodeURIComponent(lines.join("\n"));
            const url = `https://wa.me/${whatsappNumber}?text=${text}`;

            trackEvent("cta_whatsapp_click", { source: "qualification_form" });
            openExternalUrl(url);

            if (formStatus) formStatus.textContent = readyMessage;
            form.reset();
        });
    }

    document.querySelectorAll("img").forEach((img) => {
        img.addEventListener("error", function onImageError() {
            this.alt = isArabic ? "صورة غير متاحة حاليًا" : "Image unavailable";
        });
    });
})();
