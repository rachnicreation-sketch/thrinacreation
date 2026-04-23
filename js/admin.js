(function () {
  "use strict";

  var ORDER_STATUSES = ["Nouvelle", "En preparation", "Expediee", "Livree", "Annulee"];

  function setMessage(node, message, type) {
    if (!node) {
      return;
    }
    node.textContent = message || "";
    node.classList.remove("success", "error");
    if (type) {
      node.classList.add(type);
    }
  }

  function formatDate(value) {
    var date = new Date(value);
    return date.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  function renderOrders() {
    var tbody = document.getElementById("ordersBody");
    if (!tbody) {
      return;
    }

    var orders = window.ThrinaStore.getOrders();

    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted">Aucune commande pour le moment.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(function (order) {
      var options = ORDER_STATUSES.map(function (status) {
        var selected = status === order.status ? " selected" : "";
        return '<option value="' + status + '"' + selected + '>' + status + '</option>';
      }).join("");
      var paymentLabel = order.payment && order.payment.label ? order.payment.label : "Non precise";
      var paymentStatus = order.payment && order.payment.status ? order.payment.status : "";

      return [
        "<tr>",
        "<td>" + order.id + "</td>",
        "<td>" + formatDate(order.date) + "</td>",
        "<td><strong>" + order.customer.name + "</strong><br><small>" + order.customer.phone + "</small></td>",
        "<td>" + window.ThrinaApp.formatPrice(order.total) + "</td>",
        "<td><strong>" + paymentLabel + "</strong><br><small>" + paymentStatus + "</small></td>",
        '<td><select class="status-select" data-order-id="' + order.id + '">' + options + "</select></td>",
        "</tr>"
      ].join("");
    }).join("");
  }

  function renderProducts() {
    var tbody = document.getElementById("productsBody");
    if (!tbody) {
      return;
    }

    var products = window.ThrinaStore.getProducts();

    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">Aucun produit.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(function (product) {
      return [
        "<tr>",
        "<td>" + product.name + "</td>",
        "<td>" + product.category + "</td>",
        "<td>" + window.ThrinaApp.formatPrice(product.price) + "</td>",
        "<td>" + product.stock + "</td>",
        '<td><button type="button" class="delete-btn" data-delete-product="' + product.id + '">Supprimer</button></td>',
        "</tr>"
      ].join("");
    }).join("");
  }

  function showDashboard(show) {
    var loginSection = document.getElementById("adminLoginSection");
    var dashboard = document.getElementById("adminDashboard");

    if (!loginSection || !dashboard) {
      return;
    }

    if (show) {
      loginSection.classList.add("hidden");
      dashboard.classList.remove("hidden");
      renderOrders();
      renderProducts();
      return;
    }

    loginSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
  }

  function setupAdminLogin() {
    var form = document.getElementById("adminLoginForm");
    var messageNode = document.getElementById("adminLoginMessage");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = document.getElementById("adminEmail").value;
      var password = document.getElementById("adminPassword").value;

      var result = window.ThrinaStore.loginAdmin(email, password);

      if (!result.ok) {
        setMessage(messageNode, result.message || "Connexion admin impossible.", "error");
        return;
      }

      setMessage(messageNode, "Connexion admin reussie.", "success");
      form.reset();
      showDashboard(true);
    });
  }

  function setupAdminLogout() {
    var button = document.getElementById("adminLogoutBtn");
    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      window.ThrinaStore.logoutAdmin();
      showDashboard(false);
    });
  }

  function setupOrderStatusUpdate() {
    var body = document.getElementById("ordersBody");
    if (!body) {
      return;
    }

    body.addEventListener("change", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLSelectElement)) {
        return;
      }

      var orderId = target.getAttribute("data-order-id");
      if (!orderId) {
        return;
      }

      window.ThrinaStore.updateOrderStatus(orderId, target.value);
      window.ThrinaApp.showToast("Statut commande mis a jour");
    });
  }

  function setupProductForm() {
    var form = document.getElementById("productForm");
    var message = document.getElementById("productMessage");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var payload = {
        name: document.getElementById("productName").value,
        category: document.getElementById("productCategory").value,
        price: document.getElementById("productPrice").value,
        stock: document.getElementById("productStock").value,
        image: document.getElementById("productImage").value,
        description: document.getElementById("productDescription").value
      };

      var result = window.ThrinaStore.addProduct(payload);

      if (!result.ok) {
        setMessage(message, result.message || "Publication impossible.", "error");
        return;
      }

      form.reset();
      setMessage(message, "Article publie avec succes.", "success");
      renderProducts();
      window.ThrinaApp.showToast("Nouveau produit publie");
    });
  }

  function setupDeleteProduct() {
    var body = document.getElementById("productsBody");
    if (!body) {
      return;
    }

    body.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      var button = target.closest("[data-delete-product]");
      if (!button) {
        return;
      }

      var productId = button.getAttribute("data-delete-product");
      window.ThrinaStore.deleteProduct(productId);
      renderProducts();
      window.ThrinaApp.showToast("Produit supprime");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("adminPage")) {
      return;
    }

    setupAdminLogin();
    setupAdminLogout();
    setupOrderStatusUpdate();
    setupProductForm();
    setupDeleteProduct();

    if (window.ThrinaStore.isAdminLoggedIn()) {
      showDashboard(true);
    } else {
      showDashboard(false);
    }
  });
})();
