(function () {
  "use strict";

  var ORDER_STEPS = ["Nouvelle", "En preparation", "Expediee", "Livree"];

  function formatDate(value) {
    return new Date(value).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  function progressRatio(status) {
    if (status === "Annulee") {
      return 0;
    }

    var index = ORDER_STEPS.indexOf(status);
    if (index < 0) {
      return 0;
    }

    return Math.round(((index + 1) / ORDER_STEPS.length) * 100);
  }

  function ordersTrackingHtml(orders) {
    if (!orders.length) {
      return '<p class="muted">Aucune commande enregistree pour ce compte.</p>';
    }

    return orders.map(function (order) {
      var percent = progressRatio(order.status);
      var paymentLabel = order.payment && order.payment.label ? order.payment.label : "Non precise";

      return [
        '<article class="order-card">',
        '  <p><strong>Reference:</strong> ' + order.id + '</p>',
        '  <p><strong>Date:</strong> ' + formatDate(order.date) + '</p>',
        '  <p><strong>Statut:</strong> ' + order.status + '</p>',
        '  <p><strong>Paiement:</strong> ' + paymentLabel + '</p>',
        '  <p><strong>Total:</strong> ' + window.ThrinaApp.formatPrice(order.total) + '</p>',
        '  <div class="order-progress">',
        '    <span style="width:' + percent + '%;"></span>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderAccountPanel() {
    var panel = document.getElementById("accountPanel");
    if (!panel) {
      return;
    }

    var user = window.ThrinaStore.getCurrentUser();

    if (!user) {
      panel.innerHTML = [
        "<h2>Compte client</h2>",
        '<p class="muted">Aucune session active.</p>',
        '<p class="muted">Le compte est optionnel pour commander.</p>'
      ].join("");
      return;
    }

    var orders = window.ThrinaStore.getOrdersForCurrentUser();

    panel.innerHTML = [
      "<h2>Session active</h2>",
      "<p><strong>Nom:</strong> " + user.name + "</p>",
      "<p><strong>Email:</strong> " + user.email + "</p>",
      "<p><strong>Telephone:</strong> " + user.phone + "</p>",
      "<h3>Progression de vos commandes</h3>",
      ordersTrackingHtml(orders),
      '<button id="logoutBtn" type="button" class="btn btn-ghost">Se deconnecter</button>'
    ].join("");

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        window.ThrinaStore.logoutUser();
        renderAccountPanel();
        updateMessage("Session client fermee.", "success");
      });
    }
  }

  function updateMessage(message, type) {
    var messageBox = document.querySelector("[data-auth-message]");
    if (!messageBox) {
      return;
    }

    messageBox.textContent = message || "";
    messageBox.classList.remove("success", "error");
    if (type) {
      messageBox.classList.add(type);
    }
  }

  function setupRegisterForm() {
    var form = document.getElementById("registerForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var payload = {
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        phone: document.getElementById("registerPhone").value,
        password: document.getElementById("registerPassword").value
      };

      var result = window.ThrinaStore.registerUser(payload);

      if (!result.ok) {
        updateMessage(result.message || "Creation impossible.", "error");
        return;
      }

      form.reset();
      updateMessage("Compte cree. Vous etes connecte.", "success");
      renderAccountPanel();
      window.ThrinaApp.showToast("Compte client cree");
    });
  }

  function setupLoginForm() {
    var form = document.getElementById("loginForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = document.getElementById("loginEmail").value;
      var password = document.getElementById("loginPassword").value;
      var result = window.ThrinaStore.loginUser(email, password);

      if (!result.ok) {
        updateMessage(result.message || "Connexion impossible.", "error");
        return;
      }

      form.reset();
      updateMessage("Connexion reussie.", "success");
      renderAccountPanel();
      window.ThrinaApp.showToast("Session client active");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("accountPanel") && !document.getElementById("registerForm") && !document.getElementById("loginForm")) {
      return;
    }

    renderAccountPanel();
    setupRegisterForm();
    setupLoginForm();
  });
})();
