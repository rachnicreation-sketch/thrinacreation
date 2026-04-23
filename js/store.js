(function () {
  "use strict";

  var KEYS = {
    products: "thrina_products_v2",
    cart: "thrina_cart_v2",
    orders: "thrina_orders_v2",
    users: "thrina_users_v2",
    customerSession: "thrina_customer_session_v2",
    admin: "thrina_admin_account_v2",
    adminSession: "thrina_admin_session_v2"
  };

  var DEFAULT_PRODUCTS = [
    {
      id: "sac-001",
      name: "Sac classique marron perle",
      category: "sacs",
      price: 65000,
      stock: 12,
      image: "images/produit/2.jpg",
      description: "Finition main et perles naturelles."
    },
    {
      id: "sac-002",
      name: "Sac eclat multicolore",
      category: "sacs",
      price: 75000,
      stock: 8,
      image: "images/produit/3.jpg",
      description: "Modele lumineux pour sortie et evenement."
    },
    {
      id: "sac-003",
      name: "Sac rouge artisanal",
      category: "sacs",
      price: 65000,
      stock: 10,
      image: "images/produit/4.jpg",
      description: "Texture premium, couture renforcee."
    },
    {
      id: "bij-001",
      name: "Parure perlee bronze",
      category: "bijoux",
      price: 22000,
      stock: 15,
      image: "images/produit/12.jpg",
      description: "Style sobre pour tous les jours."
    },
    {
      id: "bij-002",
      name: "Bracelet duo finition or",
      category: "bijoux",
      price: 18000,
      stock: 20,
      image: "images/produit/13.jpg",
      description: "Bracelet leger et elegant."
    },
    {
      id: "acc-001",
      name: "Pochette soin artisanale",
      category: "accessoires",
      price: 19000,
      stock: 14,
      image: "images/produit/15.jpg",
      description: "Compacte et pratique pour voyage."
    },
    {
      id: "acc-002",
      name: "Set beaute naturel",
      category: "accessoires",
      price: 17000,
      stock: 11,
      image: "images/produit/16.jpg",
      description: "Accessoires utiles pour la routine quotidienne."
    },
    {
      id: "sac-004",
      name: "Sac raphia edition atelier",
      category: "sacs",
      price: 50000,
      stock: 6,
      image: "images/produit/10.jpg",
      description: "Leger, robuste et style local."
    }
  ];

  var DEFAULT_ADMIN = {
    email: "admin@thrina.local",
    password: "admin123",
    name: "Admin Thrina"
  };

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readJSON(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function createRef(prefix) {
    var random = Math.floor(Math.random() * 900 + 100);
    return prefix + "-" + Date.now() + "-" + random;
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function toNumber(value) {
    var numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  function paymentLabel(method) {
    if (method === "mobile_money") {
      return "Mobile Money";
    }
    if (method === "carte") {
      return "Carte bancaire";
    }
    return "Paiement a la livraison";
  }

  function ensureSeedData() {
    if (!localStorage.getItem(KEYS.products)) {
      writeJSON(KEYS.products, DEFAULT_PRODUCTS);
    }

    if (!localStorage.getItem(KEYS.orders)) {
      writeJSON(KEYS.orders, []);
    }

    if (!localStorage.getItem(KEYS.users)) {
      writeJSON(KEYS.users, []);
    }

    if (!localStorage.getItem(KEYS.cart)) {
      writeJSON(KEYS.cart, []);
    }

    if (!localStorage.getItem(KEYS.admin)) {
      writeJSON(KEYS.admin, DEFAULT_ADMIN);
    }
  }

  ensureSeedData();

  function getProducts() {
    return readJSON(KEYS.products, []);
  }

  function saveProducts(products) {
    writeJSON(KEYS.products, products);
  }

  function addProduct(payload) {
    var products = getProducts();
    var product = {
      id: createRef("prod"),
      name: String(payload.name || "").trim(),
      category: String(payload.category || "sacs").trim(),
      price: toNumber(payload.price),
      stock: Math.max(0, Math.floor(toNumber(payload.stock))),
      image: String(payload.image || "images/produit/1.jpg").trim(),
      description: String(payload.description || "Article artisanal").trim(),
      createdAt: nowIso()
    };

    if (!product.name || product.price <= 0) {
      return { ok: false, message: "Nom ou prix invalide." };
    }

    products.unshift(product);
    saveProducts(products);
    return { ok: true, product: product };
  }

  function deleteProduct(productId) {
    var products = getProducts();
    var nextProducts = products.filter(function (item) {
      return item.id !== productId;
    });

    saveProducts(nextProducts);

    var cart = getCart();
    var nextCart = cart.filter(function (item) {
      return item.productId !== productId;
    });
    writeJSON(KEYS.cart, nextCart);

    return { ok: true };
  }

  function getCart() {
    return readJSON(KEYS.cart, []);
  }

  function saveCart(cart) {
    writeJSON(KEYS.cart, cart);
  }

  function addToCart(productId, quantity) {
    var qty = Math.max(1, Math.floor(toNumber(quantity) || 1));
    var products = getProducts();
    var product = products.find(function (item) {
      return item.id === productId;
    });

    if (!product) {
      return { ok: false, message: "Produit introuvable." };
    }

    var cart = getCart();
    var existing = cart.find(function (item) {
      return item.productId === productId;
    });

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ productId: productId, quantity: qty });
    }

    saveCart(cart);
    return { ok: true };
  }

  function updateCartQuantity(productId, quantity) {
    var cart = getCart();
    var qty = Math.floor(toNumber(quantity));

    if (qty <= 0) {
      cart = cart.filter(function (item) {
        return item.productId !== productId;
      });
      saveCart(cart);
      return;
    }

    cart = cart.map(function (item) {
      if (item.productId === productId) {
        return { productId: item.productId, quantity: qty };
      }
      return item;
    });

    saveCart(cart);
  }

  function removeFromCart(productId) {
    var cart = getCart().filter(function (item) {
      return item.productId !== productId;
    });
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartDetailed() {
    var products = getProducts();
    return getCart()
      .map(function (item) {
        var product = products.find(function (entry) {
          return entry.id === item.productId;
        });

        if (!product) {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: toNumber(product.price),
          quantity: item.quantity,
          lineTotal: toNumber(product.price) * item.quantity
        };
      })
      .filter(Boolean);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  function getCartTotal() {
    return getCartDetailed().reduce(function (sum, item) {
      return sum + item.lineTotal;
    }, 0);
  }

  function getOrders() {
    var orders = readJSON(KEYS.orders, []);
    return orders.slice().sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  function createOrder(customerData) {
    var items = getCartDetailed();
    if (items.length === 0) {
      return { ok: false, message: "Le panier est vide." };
    }

    var customer = {
      name: String(customerData.fullName || "").trim(),
      email: normalizeEmail(customerData.email),
      phone: String(customerData.phone || "").trim(),
      address: String(customerData.address || "").trim(),
      notes: String(customerData.notes || "").trim()
    };

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return { ok: false, message: "Informations client incompletes." };
    }

    var method = String(customerData.paymentMethod || "livraison").trim();
    var details = customerData.paymentDetails || {};
    var payment = {
      method: method,
      label: paymentLabel(method),
      status: "Paiement en attente",
      details: {}
    };

    if (method === "livraison") {
      payment.status = "Paiement a la livraison";
      payment.details = {
        note: "A regler a la reception"
      };
    } else if (method === "mobile_money") {
      var operator = String(details.operator || "").trim();
      var number = String(details.number || "").trim();
      var reference = String(details.reference || "").trim();

      if (!operator || !number) {
        return { ok: false, message: "Infos Mobile Money incompletes." };
      }

      payment.details = {
        operator: operator,
        number: number,
        reference: reference || "Aucune"
      };
    } else if (method === "carte") {
      var holder = String(details.holder || "").trim();
      var cardNumberRaw = String(details.cardNumber || "").replace(/\s+/g, "");
      var expiry = String(details.expiry || "").trim();

      if (!holder || cardNumberRaw.length < 8 || !expiry) {
        return { ok: false, message: "Infos carte incompletes." };
      }

      payment.details = {
        holder: holder,
        cardEnding: cardNumberRaw.slice(-4),
        expiry: expiry
      };
    } else {
      return { ok: false, message: "Moyen de paiement invalide." };
    }

    var users = getUsers();
    var linkedUser = users.find(function (user) {
      return normalizeEmail(user.email) === customer.email;
    });

    var order = {
      id: createRef("CMD"),
      date: nowIso(),
      status: "Nouvelle",
      customer: Object.assign({}, customer, {
        userId: linkedUser ? linkedUser.id : null
      }),
      payment: payment,
      items: items,
      itemCount: items.reduce(function (sum, item) { return sum + item.quantity; }, 0),
      total: getCartTotal()
    };

    var orders = readJSON(KEYS.orders, []);
    orders.unshift(order);
    writeJSON(KEYS.orders, orders);

    clearCart();

    return {
      ok: true,
      order: order
    };
  }

  function updateOrderStatus(orderId, status) {
    var orders = readJSON(KEYS.orders, []);
    orders = orders.map(function (order) {
      if (order.id === orderId) {
        return Object.assign({}, order, { status: status });
      }
      return order;
    });

    writeJSON(KEYS.orders, orders);
  }

  function getOrdersForCurrentUser() {
    var user = getCurrentUser();
    if (!user) {
      return [];
    }

    var userEmail = normalizeEmail(user.email);

    return getOrders().filter(function (order) {
      if (!order || !order.customer) {
        return false;
      }

      var byId = order.customer.userId && user.id && order.customer.userId === user.id;
      var byEmail = normalizeEmail(order.customer.email) === userEmail;
      return Boolean(byId || byEmail);
    });
  }

  function getUsers() {
    return readJSON(KEYS.users, []);
  }

  function registerUser(payload) {
    var users = getUsers();
    var email = normalizeEmail(payload.email);

    var alreadyExists = users.some(function (user) {
      return normalizeEmail(user.email) === email;
    });

    if (alreadyExists) {
      return { ok: false, message: "Cet email existe deja." };
    }

    var user = {
      id: createRef("user"),
      name: String(payload.name || "").trim(),
      email: email,
      phone: String(payload.phone || "").trim(),
      password: String(payload.password || "")
    };

    if (!user.name || !user.email || !user.phone || !user.password) {
      return { ok: false, message: "Veuillez remplir tous les champs." };
    }

    users.push(user);
    writeJSON(KEYS.users, users);

    var session = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    writeJSON(KEYS.customerSession, session);

    return { ok: true, user: session };
  }

  function loginUser(email, password) {
    var cleanEmail = normalizeEmail(email);
    var users = getUsers();

    var user = users.find(function (entry) {
      return normalizeEmail(entry.email) === cleanEmail && entry.password === String(password || "");
    });

    if (!user) {
      return { ok: false, message: "Email ou mot de passe incorrect." };
    }

    var session = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    writeJSON(KEYS.customerSession, session);

    return { ok: true, user: session };
  }

  function getCurrentUser() {
    return readJSON(KEYS.customerSession, null);
  }

  function logoutUser() {
    localStorage.removeItem(KEYS.customerSession);
  }

  function getAdminAccount() {
    return readJSON(KEYS.admin, DEFAULT_ADMIN);
  }

  function loginAdmin(email, password) {
    var admin = getAdminAccount();
    if (normalizeEmail(email) !== normalizeEmail(admin.email) || String(password || "") !== admin.password) {
      return { ok: false, message: "Identifiants admin invalides." };
    }

    writeJSON(KEYS.adminSession, {
      email: admin.email,
      name: admin.name,
      loggedAt: nowIso()
    });

    return { ok: true };
  }

  function logoutAdmin() {
    localStorage.removeItem(KEYS.adminSession);
  }

  function isAdminLoggedIn() {
    return Boolean(readJSON(KEYS.adminSession, null));
  }

  window.ThrinaStore = {
    getProducts: getProducts,
    addProduct: addProduct,
    deleteProduct: deleteProduct,
    addToCart: addToCart,
    getCartDetailed: getCartDetailed,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    updateCartQuantity: updateCartQuantity,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    createOrder: createOrder,
    getOrders: getOrders,
    getOrdersForCurrentUser: getOrdersForCurrentUser,
    updateOrderStatus: updateOrderStatus,
    registerUser: registerUser,
    loginUser: loginUser,
    getCurrentUser: getCurrentUser,
    logoutUser: logoutUser,
    loginAdmin: loginAdmin,
    logoutAdmin: logoutAdmin,
    isAdminLoggedIn: isAdminLoggedIn
  };
})();
