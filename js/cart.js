(function () {
  "use strict";

  function cartItemTemplate(item, formatPrice) {
    return [
      '<article class="cart-item" data-product-id="' + item.id + '">',
      '  <img src="' + item.image + '" alt="' + item.name + '">',
      "  <div>",
      '    <h3>' + item.name + '</h3>',
      '    <p class="muted">' + item.category + '</p>',
      '    <p class="price">' + formatPrice(item.price) + '</p>',
      '    <div class="cart-controls">',
      '      <button class="qty-btn" type="button" data-cart-action="minus">-</button>',
      '      <strong>' + item.quantity + '</strong>',
      '      <button class="qty-btn" type="button" data-cart-action="plus">+</button>',
      '      <button class="btn btn-ghost" type="button" data-cart-action="remove">Supprimer</button>',
      "    </div>",
      "  </div>",
      '  <p class="price">' + formatPrice(item.lineTotal) + '</p>',
      "</article>"
    ].join("");
  }

  function renderCart() {
    var cartNode = document.getElementById("cartItems");
    if (!cartNode) {
      return;
    }

    var formatPrice = window.ThrinaApp.formatPrice;
    var items = window.ThrinaStore.getCartDetailed();

    if (!items.length) {
      cartNode.innerHTML = [
        '<div class="empty-state">',
        "Votre panier est vide.",
        ' <a href="index.html#catalogue">Voir la boutique</a>',
        "</div>"
      ].join("");
    } else {
      cartNode.innerHTML = items.map(function (item) {
        return cartItemTemplate(item, formatPrice);
      }).join("");
    }

    document.getElementById("cartCountSummary").textContent = String(window.ThrinaStore.getCartCount());
    document.getElementById("cartSubTotal").textContent = formatPrice(window.ThrinaStore.getCartTotal());
    document.getElementById("cartTotal").textContent = formatPrice(window.ThrinaStore.getCartTotal());
    window.ThrinaApp.refreshCartBadges();
  }

  function updateResult(message, type) {
    var node = document.getElementById("orderResult");
    if (!node) {
      return;
    }

    node.textContent = message || "";
    node.classList.remove("success", "error");
    if (type) {
      node.classList.add(type);
    }
  }

  function setupCartActions() {
    var cartNode = document.getElementById("cartItems");
    if (!cartNode) {
      return;
    }

    cartNode.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      var actionNode = target.closest("[data-cart-action]");
      if (!actionNode) {
        return;
      }

      var action = actionNode.getAttribute("data-cart-action");
      var itemNode = actionNode.closest("[data-product-id]");
      if (!itemNode) {
        return;
      }

      var productId = itemNode.getAttribute("data-product-id");
      var items = window.ThrinaStore.getCartDetailed();
      var item = items.find(function (entry) { return entry.id === productId; });
      if (!item) {
        return;
      }

      if (action === "plus") {
        window.ThrinaStore.updateCartQuantity(productId, item.quantity + 1);
      }

      if (action === "minus") {
        window.ThrinaStore.updateCartQuantity(productId, item.quantity - 1);
      }

      if (action === "remove") {
        window.ThrinaStore.removeFromCart(productId);
      }

      renderCart();
    });
  }

  function setupClearCartButton() {
    var clearButton = document.getElementById("clearCartBtn");
    if (!clearButton) {
      return;
    }

    clearButton.addEventListener("click", function () {
      window.ThrinaStore.clearCart();
      renderCart();
      updateResult("Panier vide.", null);
    });
  }

  function prefillCheckout() {
    var user = window.ThrinaStore.getCurrentUser();
    if (!user) {
      return;
    }

    var nameInput = document.getElementById("fullName");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");

    if (nameInput && !nameInput.value) {
      nameInput.value = user.name || "";
    }

    if (emailInput && !emailInput.value) {
      emailInput.value = user.email || "";
    }

    if (phoneInput && !phoneInput.value) {
      phoneInput.value = user.phone || "";
    }
  }

  function setupCheckoutForm() {
    var form = document.getElementById("checkoutForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var paymentMethod = String(formData.get("paymentMethod") || "livraison");
      var paymentDetailsResult = buildPaymentDetails(formData, paymentMethod);
      if (!paymentDetailsResult.ok) {
        updateResult(paymentDetailsResult.message, "error");
        return;
      }

      var payload = {
        fullName: String(formData.get("fullName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetailsResult.details
      };

      var result = window.ThrinaStore.createOrder(payload);

      if (!result.ok) {
        updateResult(result.message || "Impossible de valider la commande.", "error");
        return;
      }

      var order = result.order;
      updateResult(
        "Commande envoyee avec succes. Reference: " + order.id + " | Total: " + window.ThrinaApp.formatPrice(order.total) + " | Paiement: " + order.payment.label,
        "success"
      );
      form.reset();
      renderPaymentFields();
      prefillCheckout();
      renderCart();
    });
  }

  function buildPaymentDetails(formData, method) {
    if (method === "livraison") {
      return { ok: true, details: { note: "Paiement a la livraison" } };
    }

    if (method === "mobile_money") {
      var operator = String(formData.get("mmOperator") || "").trim();
      var number = String(formData.get("mmNumber") || "").trim();
      var reference = String(formData.get("mmReference") || "").trim();

      if (!operator || !number) {
        return { ok: false, message: "Veuillez renseigner l'operateur et le numero Mobile Money." };
      }

      return {
        ok: true,
        details: {
          operator: operator,
          number: number,
          reference: reference
        }
      };
    }

    if (method === "carte") {
      var holder = String(formData.get("cardHolder") || "").trim();
      var cardNumber = String(formData.get("cardNumber") || "").trim();
      var expiry = String(formData.get("cardExpiry") || "").trim();

      if (!holder || !cardNumber || !expiry) {
        return { ok: false, message: "Veuillez renseigner toutes les informations de carte." };
      }

      return {
        ok: true,
        details: {
          holder: holder,
          cardNumber: cardNumber,
          expiry: expiry
        }
      };
    }

    return { ok: false, message: "Moyen de paiement non valide." };
  }

  function renderPaymentFields() {
    var select = document.getElementById("paymentMethod");
    var target = document.getElementById("paymentExtraFields");
    if (!select || !target) {
      return;
    }

    var method = select.value;

    if (method === "mobile_money") {
      target.innerHTML = [
        '<label for="mmOperator">Operateur Mobile Money</label>',
        '<select id="mmOperator" name="mmOperator" required>',
        '  <option value="">Choisir un operateur</option>',
        '  <option value="Airtel Money">Airtel Money</option>',
        '  <option value="MTN Mobile Money">MTN Mobile Money</option>',
        '  <option value="Moov Money">Moov Money</option>',
        "</select>",
        '<label for="mmNumber">Numero Mobile Money</label>',
        '<input id="mmNumber" name="mmNumber" type="tel" required>',
        '<label for="mmReference">Reference transaction (optionnel)</label>',
        '<input id="mmReference" name="mmReference" type="text">'
      ].join("");
      return;
    }

    if (method === "carte") {
      target.innerHTML = [
        '<label for="cardHolder">Nom sur la carte</label>',
        '<input id="cardHolder" name="cardHolder" type="text" required>',
        '<label for="cardNumber">Numero de carte</label>',
        '<input id="cardNumber" name="cardNumber" type="text" inputmode="numeric" required>',
        '<label for="cardExpiry">Expiration (MM/AA)</label>',
        '<input id="cardExpiry" name="cardExpiry" type="text" placeholder="MM/AA" required>'
      ].join("");
      return;
    }

    target.innerHTML = [
      '<div class="result-box delivery-note">',
      "Paiement a la livraison selectionne. Cette mention sera enregistree sur la commande.",
      "</div>"
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("cartItems")) {
      return;
    }

    renderCart();
    setupCartActions();
    setupClearCartButton();
    setupCheckoutForm();
    prefillCheckout();
    renderPaymentFields();

    var paymentMethod = document.getElementById("paymentMethod");
    if (paymentMethod) {
      paymentMethod.addEventListener("change", renderPaymentFields);
    }
  });
})();
