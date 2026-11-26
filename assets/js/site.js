(() => {
  "use strict";
  const root = document.documentElement;
  const theme = document.querySelector(".theme-button");
  const menu = document.querySelector(".menu-button");
  const navigation = document.querySelector("#navigation");
  const navDisclosures = Array.from(navigation.querySelectorAll("details"));
  const mobile = matchMedia("(max-width: 1040px)");
  const copy = document.querySelector("#copy");
  root.classList.add("js");
  for (const button of [theme, menu, copy]) {
    if (button) button.hidden = false;
  }

  function applyTheme(value) {
    root.dataset.theme = value === "dark" ? "dark" : "light";
    const dark = root.dataset.theme === "dark";
    theme.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    document.querySelector('meta[name="theme-color"]').content = dark ? "#1b201d" : "#ffffff";
  }
  let savedTheme;
  try { savedTheme = localStorage.getItem("cvip-sogang-theme"); } catch {}
  applyTheme(savedTheme);
  theme.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    try { localStorage.setItem("cvip-sogang-theme", root.dataset.theme); } catch {}
  });

  function toggleMenu(open) {
    navigation.classList.toggle("show", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) navDisclosures.forEach(disclosure => { disclosure.open = false; });
  }
  menu.addEventListener("click", () => toggleMenu(menu.getAttribute("aria-expanded") === "false"));
  mobile.addEventListener("change", () => toggleMenu(false));
  document.addEventListener("click", event => {
    if (!navigation.contains(event.target) && !menu.contains(event.target)) toggleMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const navDisclosure = navDisclosures.find(disclosure => disclosure.open);
    if (navDisclosure) {
      navDisclosure.open = false;
      navDisclosure.querySelector("summary").focus();
    } else if (navigation.classList.contains("show")) {
      toggleMenu(false);
      menu.focus();
    }
  });

  function setUpPaperFilters() {
    const papers = document.getElementById("papers");
    const categories = papers.querySelector(".paper-categories");
    const groups = Array.from(categories.querySelectorAll(".category"));
    const rows = Array.from(categories.querySelectorAll(".paper-entry"));
    const years = [...new Set(rows.map(row => row.dataset.year))].sort((a, b) => b - a);
    const filters = document.createElement("div");
    filters.className = "paper-filters";
    const results = document.createElement("ul");
    results.className = "paper-list";
    results.id = "paper-results";
    const status = document.createElement("p");
    status.className = "paper-status";
    status.setAttribute("role", "status");

    const selected = {type: "all", year: "all"};
    function render() {
      let visible = 0;
      for (const row of rows) {
        row.hidden = (selected.type !== "all" && selected.type !== row.dataset.type) ||
                     (selected.year !== "all" && selected.year !== row.dataset.year);
        if (!row.hidden) visible++;
      }
      for (const button of filters.querySelectorAll("button")) {
        button.setAttribute("aria-pressed", String(selected[button.dataset.field] === button.value));
      }
      status.textContent = visible === 0 ? "No papers match these filters." :
        visible + (visible === 1 ? " paper" : " papers");
    }
    function addFilterGroup(field, label, options) {
      const group = document.createElement("div");
      group.className = "paper-filter-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", label);
      for (const [value, name] of options) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.field = field;
        button.value = value;
        button.textContent = name;
        button.setAttribute("aria-controls", results.id);
        if (field === "type" && value !== "all") button.id = value;
        group.append(button);
      }
      filters.append(group);
    }
    addFilterGroup("type", "Publication type", [["all", "All types"], ...groups.map(group => [group.id, group.dataset.label])]);
    addFilterGroup("year", "Publication year", [["all", "All years"], ...years.map(year => [year, year])]);
    rows.sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year));
    results.append(...rows);
    categories.replaceChildren(filters, status, results);
    filters.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      selected[button.dataset.field] = button.value;
      render();
    });
    render();
    return function openPaperCategory(id) {
      selected.type = id === "papers" ? "all" : id;
      selected.year = "all";
      render();
    };
  }
  const openPaperCategory = setUpPaperFilters();

  function expandDestination(id) {
    const target = document.getElementById(id);
    if (!target) return;
    if (id === "papers" || target.dataset.field === "type") openPaperCategory(id);
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    if (target instanceof HTMLDetailsElement) target.open = true;
    return target;
  }
  navigation.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    toggleMenu(false);
    const target = expandDestination(link.hash.slice(1));
    if (target) {
      if (!target.matches("button")) target.setAttribute("tabindex", "-1");
      target.focus({preventScroll:true});
    }
  });
  function followFragment() {
    const dest = expandDestination(location.hash.slice(1));
    if (dest) requestAnimationFrame(() => dest.scrollIntoView({block:"start",behavior:"instant"}));
  }
  if (location.hash) followFragment();
  window.addEventListener("hashchange", () => expandDestination(location.hash.slice(1)));
  window.addEventListener("pageshow", () => { if (location.hash) expandDestination(location.hash.slice(1)); });


  if (typeof HTMLDialogElement === "function" && typeof HTMLDialogElement.prototype.showModal === "function") {
    const viewer = document.createElement("dialog");
    viewer.className = "figure-dialog";
    viewer.setAttribute("aria-labelledby", "figure-title");
    viewer.innerHTML = '<header><h3 id="figure-title"></h3><button type="button" aria-label="Close figure">Close</button></header><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.append(viewer);
    const largeImage = viewer.querySelector("img");
    const closeButton = viewer.querySelector("button");
    closeButton.addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", event => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    for (const link of document.querySelectorAll("a.project-figure")) {
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const image = link.querySelector("img");
        const article = link.closest("article");
        viewer.querySelector("h3").textContent = article.querySelector("h3").textContent;
        largeImage.src = link.href;
        largeImage.alt = image.alt;
        viewer.querySelector("figcaption").textContent = article.querySelector("figcaption").firstChild.textContent.trim();
        viewer.showModal();
        event.preventDefault();
        closeButton.focus();
      });
    }
  }

  if (copy) copy.addEventListener("click", async () => {
    const emailNode = document.querySelector("#email");
    const status = document.querySelector("#copy-msg");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(emailNode.textContent.trim());
      status.textContent = "Email address copied.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(emailNode);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      let copied = false;
      try { copied = document.execCommand("copy"); } catch {}
      status.textContent = copied ? "Email address copied." : "Please copy the selected email address.";
      if (copied) selection.removeAllRanges();
    }
  });
})();
