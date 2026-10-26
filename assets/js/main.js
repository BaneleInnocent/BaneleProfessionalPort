/* Banele Monamudi — portfolio behaviour.
   Everything here is an enhancement: with JavaScript disabled the page
   content, navigation links and contact form still work. */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Mobile navigation ─────────────────────────────────────────── */
  var toggle = doc.getElementById("menu-toggle");
  var links = doc.getElementById("nav-links");

  function setMenu(open) {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    doc.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" &&
          !links.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setMenu(false);
    });
  }

  /* ── Active section highlighting ───────────────────────────────── */
  var navAnchors = Array.prototype.slice.call(doc.querySelectorAll(".nav-links a[href^='#']"));
  var targets = navAnchors
    .map(function (a) { return doc.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ── Reveal on scroll (skipped for reduced motion / no IO) ─────── */
  var revealEls = doc.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ── Contact form ──────────────────────────────────────────────── */
  var form = doc.getElementById("contact-form");
  var status = doc.getElementById("form-status");
  var submit = doc.getElementById("form-submit");

  function show(kind, html) {
    if (!status) return;
    status.className = "form-status is-visible form-status--" + kind;
    status.innerHTML = html;
  }

  if (form && window.fetch) {
    form.addEventListener("submit", function (e) {
      // Let the browser show its native validation messages first.
      if (!form.checkValidity()) return;
      e.preventDefault();

      var label = submit ? submit.textContent : "";
      if (submit) { submit.disabled = true; submit.textContent = "Sending…"; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            show("ok", "Thanks — your message was submitted. I will reply by email.");
          } else {
            show("err", "The message could not be sent. Please email me directly at " +
              '<a href="mailto:monamudi.banele9@gmail.com">monamudi.banele9@gmail.com</a>.');
          }
        })
        .catch(function () {
          show("err", "Network error — the message was not sent. Please email me directly at " +
            '<a href="mailto:monamudi.banele9@gmail.com">monamudi.banele9@gmail.com</a>.');
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = label; }
        });
    });
  }
})();
