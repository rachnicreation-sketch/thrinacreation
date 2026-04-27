(function () {
  "use strict";

  var WHATSAPP_PHONE = "242044513390";

  function formatPrice(value) {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0
    }).format(Number(value || 0)) + " XAF";
  }

  function showToast(message) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("show");
    }, 20);
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2200);
  }

  function buildWhatsAppUrl(product) {
    var fullImageUrl = new URL(product.image, window.location.href).href;
    var text = "Bonjour THRINA creation, je souhaite acheter : " + product.name + " (" + formatPrice(product.price) + ").\n\nLien de l'article : " + fullImageUrl;
    return "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(text);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("siteNav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function productCardTemplate(product) {
    return [
      '<article class="product-card">',
      '  <figure><img src="' + product.image + '" alt="' + product.name + '"></figure>',
      '  <div class="product-body">',
      '    <span class="category-badge">' + product.category + '</span>',
      '    <h3>' + product.name + '</h3>',
      '    <p class="muted">' + product.description + '</p>',
      '    <div class="product-meta">',
      '      <p class="price">' + formatPrice(product.price) + '</p>',
      '      <a class="btn btn-primary" href="' + buildWhatsAppUrl(product) + '" target="_blank" rel="noopener">Acheter</a>',
      "    </div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderProducts(filterValue) {
    var grid = document.querySelector("[data-product-grid]");
    if (!grid) {
      return;
    }

    var products = window.ThrinaStore.getProducts();
    var filtered = products.filter(function (product) {
      return !filterValue || filterValue === "all" || product.category === filterValue;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-state">Aucun article dans cette categorie.</div>';
      return;
    }

    grid.innerHTML = filtered.map(productCardTemplate).join("");
  }

  function setupFilters() {
    var filterButtons = document.querySelectorAll("[data-filter]");
    if (!filterButtons.length) {
      return;
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (node) {
          node.classList.remove("is-active");
        });
        button.classList.add("is-active");
        renderProducts(value);
      });
    });

    renderProducts("all");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupFilters();
  });

  window.ThrinaApp = {
    formatPrice: formatPrice,
    showToast: showToast
  };
})();
