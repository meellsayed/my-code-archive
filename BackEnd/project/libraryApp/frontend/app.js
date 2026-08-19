const API = "http://localhost:3000";

const state = {
  token: localStorage.getItem("accessToken") || "",
  user: null,
  cart: null,
  posCart: null,
  activeCategory: "",
  dashTab: "books",
  authors: [],
  categories: [],
};

const $ = (id) => document.getElementById(id);

// ================= helpers =================
const escapeHTML = (str = "") =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const showToast = (message, type = "success") => {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  $("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

const formatPrice = (value) => {
  const n = Number(value) || 0;
  return (
    (n % 1 === 0
      ? n.toLocaleString()
      : n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })) + " EGP"
  );
};

const coverImg = (url, cls = "book-cover") =>
  url
    ? `<img class="${cls}" src="${escapeHTML(url)}" alt="" onerror="this.classList.add('placeholder');this.src=''" loading="lazy" />`
    : `<div class="${cls} placeholder"></div>`;

const stockBadge = (qty, minQty) => {
  if (qty <= 0) return `<span class="stock out">● Out of stock</span>`;
  if (minQty && qty <= minQty)
    return `<span class="stock low">● Low stock (${qty})</span>`;
  return `<span class="stock in">● In stock (${qty})</span>`;
};

const isStaff = () => ["admin", "staff"].includes(state.user?.role);
const isAdmin = () => state.user?.role === "admin";

const authHeaders = () => ({ authorization: `Bearer ${state.token}` });

const api = async (path, opts = {}, useAuth = false, retried = false) => {
  const res = await fetch(API + path, {
    headers: {
      "Content-Type": "application/json",
      ...(useAuth ? authHeaders() : {}),
    },
    ...opts,
  });
  if (res.status === 401 && useAuth && !retried) {
    if (await tryRefreshToken()) return api(path, opts, useAuth, true);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "Request failed");
    err.json = json;
    throw err;
  }
  return json;
};

const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const res = await fetch(API + "/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${refreshToken}`,
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data?.accessToken) return false;
    state.token = json.data.accessToken;
    localStorage.setItem("accessToken", json.data.accessToken);
    if (json.data.username)
      state.user = { ...(state.user || {}), username: json.data.username };
    return true;
  } catch (e) {
    return false;
  }
};

const apiGet = (path, useAuth = false) => api(path, { method: "GET" }, useAuth);
const apiPost = (path, body = {}, useAuth = false) =>
  api(path, { method: "POST", body: JSON.stringify(body) }, useAuth);
const apiPatch = (path, body = {}, useAuth = false) =>
  api(path, { method: "PATCH", body: JSON.stringify(body) }, useAuth);
const apiDelete = (path, useAuth = false) =>
  api(path, { method: "DELETE" }, useAuth);

// ================= views / nav =================
const updateCartBadge = () => {
  const badge = $("cart-badge");
  const items = (state.cart?.order || []).filter((i) => (i.quantity ?? 0) > 0);
  const count = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
};

const loadCart = async () => {
  updateCartBadge();
  renderCart();
};

const showView = (view) => {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  $("view-" + view).classList.add("active");
  document
    .querySelectorAll("#main-nav .nav-link[data-view]")
    .forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  if (view === "cart") {
    renderCart();
    loadCart();
  }
  if (view === "dashboard") renderDashboard();
  if (view === "store") loadBooks();
  if (view === "orders") loadMyOrders("");
};

const updateAuthUI = () => {
  const logged = !!state.token;
  $("nav-dashboard").classList.toggle("hidden", !isStaff());
  $("nav-my-orders").classList.toggle("hidden", !logged);
  const chip = $("user-chip");
  if (logged) {
    chip.textContent = "";
    const name = state.user?.username || state.user?.email || "user";
    const role = state.user?.role || "";
    chip.innerHTML = `${escapeHTML(name)} <span class="role">(${escapeHTML(role)})</span>`;
    chip.classList.remove("hidden");
    $("btn-logout").textContent = "Logout";
  } else {
    chip.classList.add("hidden");
    $("btn-logout").textContent = "Login";
    $("nav-dashboard")?.classList.add("hidden");
  }
  const welcome = $("welcome-msg");
  if (logged) {
    welcome.textContent = `Welcome ${state.user?.username || state.user?.email}!`;
    welcome.classList.remove("hidden");
  } else {
    welcome.classList.add("hidden");
  }
};

// ================= store =================
const renderBooks = (books) => {
  const grid = $("books-grid");
  if (!books.length) {
    grid.innerHTML =
      '<div class="empty-state"><p class="msg">No books found.</p></div>';
    return;
  }
  grid.innerHTML = books
    .map(
      (b) => `
      <div class="book-card ${b.quantity > 0 ? "" : "out-of-stock"}" data-id="${b._id}">
        ${coverImg(b.cover, "book-cover")}
        <h3>${escapeHTML(b.title)}</h3>
        <p class="author">${escapeHTML(b.author?.name || "Unknown author")}</p>
        ${b.subtitle ? `<p class="subtitle">${escapeHTML(b.subtitle)}</p>` : ""}
        ${b.publisher ? `<p class="publisher">${escapeHTML(b.publisher)}</p>` : ""}
        <div class="card-actions">
          <p class="price">${formatPrice(b.price)}</p>
          ${stockBadge(b.quantity)}
          ${b.availableToBorrow ? `<span class="stock borrow">● Borrowable</span>` : ""}
        </div>
        <button class="btn primary small add-to-cart-btn"
          data-id="${b._id}" data-title="${escapeHTML(b.title)}" ${b.quantity > 0 ? "" : "disabled"}>
          ${b.quantity > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>`,
    )
    .join("");
};

const loadBooks = async (search = "") => {
  const grid = $("books-grid");
  grid.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (state.activeCategory) params.set("category", state.activeCategory);
    const sort = $("sort-select")?.value || "";
    if (sort) params.set("sort", sort);
    const publisher = $("publisher-filter")?.value?.trim();
    if (publisher) params.set("publisher", publisher);
    const qs = params.toString();
    const { data } = await apiGet("/book" + (qs ? `?${qs}` : ""));
    renderBooks(data?.books || []);
  } catch (err) {
    grid.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

let currentBook = null;
let qty = 1;

const openQuickAdd = async (id) => {
  await openBook(id, $("book-modal-add"));
};

const openBook = async (id, focusBtn = null) => {
  try {
    const { data } = await apiGet("/book/" + id);
    const book = data?.book;
    if (!book) throw new Error("Book not found");
    currentBook = book;
    qty = 1;
    updateQtyValue();
    const coverWrap =
      $("book-modal-cover-wrap") ||
      (() => {
        const wrap = document.createElement("div");
        wrap.id = "book-modal-cover-wrap";
        $("book-modal-author").insertAdjacentElement("beforebegin", wrap);
        return wrap;
      })();
    coverWrap.innerHTML = coverImg(book.cover, "modal-cover");
    $("book-modal-title").textContent = book.title;
    $("book-modal-author").textContent =
      `${book.author?.name || "Unknown author"}${book.pages ? ` · ${book.pages} pages` : ""}${book.publisher ? ` · ${book.publisher}` : ""}`;
    $("book-modal-price").textContent = formatPrice(book.price);
    $("book-modal-stock").innerHTML =
      stockBadge(book.quantity) +
      (book.availableToBorrow
        ? `<span class="stock borrow">● Borrowable</span>`
        : "");
    $("book-modal-desc").textContent = book.description || "No description.";
    $("book-modal-msg").textContent = "";
    const addBtn = $("book-modal-add");
    addBtn.disabled = book.quantity <= 0;
    addBtn.textContent = book.quantity > 0 ? "Add to Cart" : "Out of Stock";
    $("book-modal").classList.remove("hidden");
    if (focusBtn) focusBtn.focus();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const addToCart = async (bookId, qty, target = "cart") => {
  if (!state.token) {
    showToast("Please login first", "error");
    return false;
  }
  try {
    const { data } = await apiPost(
      `/cart/add-item/${bookId}`,
      { quantity: qty },
      true,
    );
    const cart = await enrichCart(data?.cart || state.cart);
    if (target === "pos") {
      state.posCart = cart;
    } else {
      state.cart = cart;
    }
    return true;
  } catch (err) {
    showToast(err.message, "error");
    return false;
  }
};

// ================= cart =================
const removeCartItem = async (bookId) => {
  if (!state.token) return;
  const bookKey = String(bookId);
  try {
    await apiPost(`/cart/remove-item/${bookId}`, { quantity: -1 }, true);
    if (state.cart?.order) {
      state.cart.order = state.cart.order.filter(
        (i) => String(i.book?._id || i.book) !== bookKey,
      );
    }
    loadCart();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const changeCartQty = async (bookId, delta) => {
  try {
    const { data } = await apiPost(
      `/cart/add-item/${bookId}`,
      { quantity: delta },
      true,
    );
    state.cart = await enrichCart(data?.cart || state.cart);
    loadCart();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const renderCart = () => {
  const wrap = $("cart-items");
  const items = (state.cart?.order || []).filter((i) => (i.quantity ?? 0) > 0);
  if (!items.length) {
    wrap.innerHTML =
      '<div class="empty-state"><p class="msg">Your cart is empty.</p></div>';
    $("cart-summary").classList.add("hidden");
    updateCartBadge();
    return;
  }
  wrap.innerHTML = items
    .map(
      (item) => `
      <div class="cart-item">
        <div class="info">
          <h4>${escapeHTML(item.book?.title || "Unknown book")}</h4>
          <span>${formatPrice(item.book?.price ?? 0)} each</span>
        </div>
        <div class="right">
          <div class="stepper">
            <button data-qty-minus="${item.book?._id}">−</button>
            <span>${item.quantity}</span>
            <button data-qty-plus="${item.book?._id}">+</button>
          </div>
          <span class="line-total">${formatPrice((item.book?.price ?? 0) * item.quantity)}</span>
          <button class="btn ghost small" data-remove-book="${item.book?._id}">Remove</button>
        </div>
      </div>`,
    )
    .join("");
  wrap
    .querySelectorAll("[data-remove-book]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        removeCartItem(btn.dataset.removeBook),
      ),
    );
  wrap
    .querySelectorAll("[data-qty-minus]")
    .forEach((b) =>
      b.addEventListener("click", () => changeCartQty(b.dataset.qtyMinus, -1)),
    );
  wrap
    .querySelectorAll("[data-qty-plus]")
    .forEach((b) =>
      b.addEventListener("click", () => changeCartQty(b.dataset.qtyPlus, 1)),
    );
  const total = items.reduce(
    (s, i) => s + (i.book?.price ?? 0) * i.quantity,
    0,
  );
  $("cart-total").textContent = formatPrice(total);
  $("cart-summary").classList.remove("hidden");
  $("customer-fields").classList.toggle("hidden", !isStaff());
  $("btn-buy").textContent = isStaff() ? "Create Sale" : "Buy Now";
  updateCartBadge();
};

const buyCart = async () => {
  if (!state.cart?._id) return;
  const btn = $("btn-buy");
  btn.disabled = true;
  try {
    const address = $("checkout-address").value.trim();
    const note = $("checkout-note").value.trim();
    let body = { address, note };

    let path = `/order/online/buy/${state.cart._id}`;
    if (isStaff()) {
      // branch sale: attach customer object for the order service
      path = `/order/branch/buy/${state.cart._id}`;
      body.customer = {
        username: $("cust-name").value.trim(),
        phone: $("cust-phone").value.trim(),
        address: $("cust-address").value.trim() || address,
        gender: $("cust-gender").value,
        type: $("cust-type").value,
      };
      if (!body.customer.username || !body.customer.phone) {
        throw new Error("Customer name and phone are required for a sale");
      }
    }

    await apiPost(path, body, true);
    $("cart-msg").className = "msg success";
    $("cart-msg").textContent = "Purchase complete!";
    if (isStaff() && state.cart) clearCartOnBackend(state.cart);
    state.cart = null;
    state.posCart = null;
    $("checkout-address").value = "";
    $("checkout-note").value = "";
    $("cust-name").value = "";
    $("cust-phone").value = "";
    $("cust-address").value = "";
    renderCart();
    loadBooks();
    showToast("Done!");
  } catch (err) {
    $("cart-msg").className = "msg error";
    $("cart-msg").textContent = err.message;
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
  }
};

// ================= dashboard =================
const setDashTab = (tab) => {
  state.dashTab = tab;
  document
    .querySelectorAll("#dash-nav .auth-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.dash === tab));
  document
    .querySelectorAll(".dash-pane")
    .forEach((p) => p.classList.toggle("active", p.id === "dash-" + tab));
  renderDashboardPane();
};

const renderDashboard = () => {
  $("nav-dashboard").classList.remove("hidden");
  setDashTab(state.dashTab);
};

const renderDashboardPane = () => {
  switch (state.dashTab) {
    case "books":
      loadDashBooks("");
      break;
    case "authors":
      loadDashAuthors("");
      break;
    case "categories":
      loadDashCategories("");
      break;
    case "customers":
      loadDashCustomers("");
      break;
    case "orders":
      loadDashOrders("");
      break;
    case "pos":
      renderPosFromCart();
      break;
  }
};

// ---- books (dashboard) ----
const loadDashBooks = async (search = "") => {
  const wrap = $("dash-books-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const { data } = await apiGet("/book" + qs);
    const books = data?.books || [];
    wrap.innerHTML =
      books.length === 0
        ? '<p class="msg">No books.</p>'
        : books
            .map(
              (b) => `
        <div class="dash-row">
          <div class="info">
            ${coverImg(b.cover, "dash-cover")}
            <div>
              <h4>${escapeHTML(b.title)}</h4>
              <span>${escapeHTML(b.author?.name || "Unknown")} · ${formatPrice(b.price)} · ${stockBadge(b.quantity)}</span>
              ${b.publisher ? `<span class="publisher">${escapeHTML(b.publisher)}</span>` : ""}
            </div>
          </div>
          <div class="actions">
            <button class="btn ghost small" data-edit-book="${b._id}">Edit</button>
            ${isAdmin() ? `<button class="btn danger small" data-del-book="${b._id}">Delete</button>` : ""}
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-edit-book]")
      .forEach((btn) =>
        btn.addEventListener("click", () => openBookForm(btn.dataset.editBook)),
      );
    wrap
      .querySelectorAll("[data-del-book]")
      .forEach((btn) =>
        btn.addEventListener("click", () => delBook(btn.dataset.delBook)),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

const delBook = async (id) => {
  if (!confirm("Delete this book?")) return;
  try {
    await apiDelete("/book/" + id, true);
    showToast("Book deleted");
    loadDashBooks($("dash-book-search").value.trim());
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ---- authors (dashboard) ----
const loadDashAuthors = async (search = "") => {
  const wrap = $("dash-authors-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const { data } = await apiGet("/author" + qs);
    const authors = data?.authors || [];
    wrap.innerHTML =
      authors.length === 0
        ? '<p class="msg">No authors.</p>'
        : authors
            .map(
              (a) => `
        <div class="dash-row">
          <div class="info">
            <h4>${escapeHTML(a.name)}</h4>
            <span>Books: ${a.booksCount ?? 0}</span>
          </div>
          <div class="actions">
            <button class="btn ghost small" data-author-books="${a._id}">Books</button>
            <button class="btn ghost small" data-edit-author="${a._id}">Edit</button>
            ${isAdmin() ? `<button class="btn danger small" data-del-author="${a._id}">Delete</button>` : ""}
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-author-books]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openAuthorBooks(btn.dataset.authorBooks),
        ),
      );
    wrap
      .querySelectorAll("[data-edit-author]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openEntityForm("author", btn.dataset.editAuthor),
        ),
      );
    wrap
      .querySelectorAll("[data-del-author]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          delEntity("author", btn.dataset.delAuthor),
        ),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

// ---- categories (dashboard) ----
const loadDashCategories = async (search = "") => {
  const wrap = $("dash-categories-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const { data } = await apiGet("/category" + qs);
    const cats = data?.categories || [];
    wrap.innerHTML =
      cats.length === 0
        ? '<p class="msg">No categories.</p>'
        : cats
            .map(
              (c) => `
        <div class="dash-row">
          <div class="info">
            <h4>${escapeHTML(c.name)}</h4>
            <span>Books: ${c.booksCount ?? 0}</span>
          </div>
          <div class="actions">
            <button class="btn ghost small" data-cat-books="${c._id}">Books</button>
            <button class="btn ghost small" data-edit-category="${c._id}">Edit</button>
            ${isAdmin() ? `<button class="btn danger small" data-del-category="${c._id}">Delete</button>` : ""}
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-cat-books]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openCategoryBooks(btn.dataset.catBooks),
        ),
      );
    wrap
      .querySelectorAll("[data-edit-category]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openEntityForm("category", btn.dataset.editCategory),
        ),
      );
    wrap
      .querySelectorAll("[data-del-category]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          delEntity("category", btn.dataset.delCategory),
        ),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

// ---- customers (dashboard) ----
let orderCountCache = null;
const getCustomerOrderCounts = async () => {
  if (orderCountCache) return orderCountCache;
  const map = new Map();
  try {
    const global = await apiGet("/order", true);
    for (const o of global?.data?.orders || []) {
      const id = String(o.customer?._id || o.customer || "");
      if (!id) continue;
      map.set(id, (map.get(id) || 0) + 1);
    }
  } catch (e) {
    /* fall back to zero counts */
  }
  orderCountCache = map;
  return map;
};
const loadDashCustomers = async (search = "") => {
  const wrap = $("dash-customers-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const gender = $("dash-customer-gender")?.value;
    const type = $("dash-customer-type")?.value;
    if (gender) params.set("gender", gender);
    if (type) params.set("type", type);
    const qs = params.toString();
    const { data } = await apiGet("/customer" + (qs ? `?${qs}` : ""), true);
    const customers = data?.customers || [];
    const orderCount = await getCustomerOrderCounts();
    wrap.innerHTML =
      customers.length === 0
        ? '<p class="msg">No customers.</p>'
        : customers
            .map(
              (c) => `
        <div class="dash-row">
          <div class="info">
            <h4>${escapeHTML(c.username || "—")}</h4>
            <span>${escapeHTML(c.phone || "")} · ${escapeHTML(c.type || "")} · Orders: ${orderCount.get(String(c._id)) || 0}</span>
          </div>
          <div class="actions">
            ${isAdmin() ? `<button class="btn danger small" data-del-customer="${c._id}">Delete</button>` : ""}
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-del-customer]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          delCustomer(btn.dataset.delCustomer),
        ),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

const delCustomer = async (id) => {
  if (!confirm("Delete this customer?")) return;
  try {
    await apiDelete("/customer/" + id, true);
    showToast("Customer deleted");
    loadDashCustomers($("dash-customer-search").value.trim());
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ---- orders (dashboard) ----
const loadDashOrders = async (search = "") => {
  const wrap = $("dash-orders-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const status = $("dash-order-status")?.value;
    let orders = [];
    try {
      const global = await apiGet("/order", true);
      orders = global?.data?.orders || [];
    } catch (e) {
      const own = await apiGet("/order/online", true);
      orders = own?.data?.orders || [];
    }
    const term = search.trim().toLowerCase();
    const filtered = orders.filter(
      (o) =>
        (!status || o.status === status) &&
        (!term ||
          String(o._id).toLowerCase().includes(term) ||
          String(o.customer?.username || "")
            .toLowerCase()
            .includes(term)),
    );
    wrap.innerHTML =
      filtered.length === 0
        ? '<p class="msg">No orders.</p>'
        : filtered
            .map(
              (o) => `
        <div class="dash-row">
          <div class="info">
            <h4>Order ${escapeHTML(o._id)}</h4>
            <span>Customer: ${escapeHTML(o.customer?.username || "—")} · ${formatPrice(o.total ?? 0)} · Status: ${escapeHTML(o.status || "—")}</span>
            ${o.address ? `<span>${escapeHTML(o.address)}</span>` : ""}
            <span>${new Date(o.createdAt).toLocaleString()}</span>
          </div>
          <div class="actions">
            <button class="btn ghost small" data-order-detail="${o._id}">View</button>
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-order-detail]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openOrderDetail(btn.dataset.orderDetail),
        ),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

// ---- my orders (customer's own online orders) ----
const loadMyOrders = async (search = "") => {
  const wrap = $("my-orders-list");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const status = $("my-order-status")?.value;
    const { data } = await apiGet("/order/online", true);
    const all = data?.orders || [];
    const term = search.trim().toLowerCase();
    const orders = all.filter(
      (o) =>
        (!status || o.status === status) &&
        (!term ||
          String(o._id).toLowerCase().includes(term) ||
          String(o.customer?.username || "")
            .toLowerCase()
            .includes(term)),
    );
    wrap.innerHTML =
      orders.length === 0
        ? '<p class="msg">No orders yet.</p>'
        : orders
            .map(
              (o) => `
        <div class="dash-row">
          <div class="info">
            <h4>Order ${escapeHTML(o._id)}</h4>
            <span>${formatPrice(o.total ?? 0)} · Status: ${escapeHTML(o.status || "—")} · ${new Date(o.createdAt).toLocaleString()}</span>
            ${o.address ? `<span>${escapeHTML(o.address)}</span>` : ""}
          </div>
          <div class="actions">
            <button class="btn ghost small" data-my-order-detail="${o._id}">View</button>
          </div>
        </div>`,
            )
            .join("");
    wrap
      .querySelectorAll("[data-my-order-detail]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openOrderDetail(btn.dataset.myOrderDetail),
        ),
      );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

let bookCache = null;
const getBookMap = async () => {
  if (!bookCache) {
    try {
      const { data } = await apiGet("/book?limit=1000");
      bookCache = new Map((data?.books || []).map((b) => [String(b._id), b]));
    } catch (e) {
      bookCache = new Map();
    }
  }
  return bookCache;
};
const getBookTitle = async (id) => {
  const book = (await getBookMap()).get(String(id));
  return book?.title || `Book (${String(id).slice(-6)})`;
};
const enrichCart = async (cart) => {
  if (!cart?.order?.length) return cart;
  const map = await getBookMap();
  cart.order = cart.order.map((it) => {
    if (it.book && typeof it.book === "object" && it.book.title) return it;
    const book = map.get(String(it.book?._id || it.book));
    if (book) it.book = book;
    return it;
  });
  return cart;
};

const openOrderDetail = async (id) => {
  try {
    const { data } = await apiGet(`/order/online/${id}`, true);
    const o = data?.order;
    if (!o) throw new Error("Order not found");
    const map = await getBookMap();
    const cartItems = o.cart?.order || [];
    const items = cartItems.map((it) => {
      const book = map.get(String(it.book?._id || it.book)) || {};
      return {
        title: book.title || `Book (${String(it.book?._id || it.book).slice(-6)})`,
        price: book.price ?? 0,
        qty: it.quantity ?? 0,
      };
    });
    const itemsHtml = items
      .map(
        (it) => `
          <div class="dash-row">
            <div class="info">
              <h4>${escapeHTML(it.title)}</h4>
              <span>${formatPrice(it.price ?? 0)} × ${it.qty} = ${formatPrice((it.price ?? 0) * it.qty)}</span>
            </div>
          </div>`,
      )
      .join("");
    const html = `
      <p><strong>Total:</strong> ${formatPrice(o.total ?? 0)}</p>
      <p><strong>Status:</strong> ${escapeHTML(o.status || "—")} · ${new Date(o.createdAt).toLocaleString()}</p>
      ${o.customer?.username ? `<p><strong>Customer:</strong> ${escapeHTML(o.customer.username)}</p>` : ""}
      ${o.address ? `<p><strong>Address:</strong> ${escapeHTML(o.address)}</p>` : ""}
      ${o.note ? `<p><strong>Note:</strong> ${escapeHTML(o.note)}</p>` : ""}
      ${items.length ? `<h4>Items (${items.length})</h4>${itemsHtml}` : ""}`;
    showInfoModal("Order Details", html);
  } catch (err) {
    showToast(err.message, "error");
  }
};

const delEntity = async (type, id) => {
  if (!confirm(`Delete this ${type}?`)) return;
  try {
    await apiDelete(`/${type}/${id}`, true);
    showToast(`${capitalize(type)} deleted`);
    if (type === "author")
      loadDashAuthors($("dash-author-search").value.trim());
    if (type === "category")
      loadDashCategories($("dash-category-search").value.trim());
  } catch (err) {
    showToast(err.message, "error");
  }
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ================= info modal (books / orders listing) =================
const showInfoModal = (title, html) => {
  $("info-modal-heading").textContent = title;
  $("info-modal-body").innerHTML = html;
  $("info-modal").classList.remove("hidden");
};

const bookListHtml = (books) =>
  books.length
    ? books
        .map(
          (b) => `
      <div class="dash-row">
        <div class="info">
          ${coverImg(b.cover, "dash-cover")}
          <div>
            <h4>${escapeHTML(b.title)}</h4>
            <span>${escapeHTML(b.author?.name || "Unknown")} · ${formatPrice(b.price ?? 0)} · ${stockBadge(b.quantity)}</span>
          </div>
        </div>
      </div>`,
        )
        .join("")
    : '<p class="msg">No books found.</p>';

const openAuthorBooks = async (id) => {
  try {
    const { data } = await apiGet(`/author/books/${id}`);
    showInfoModal("Author Books", bookListHtml(data?.books || []));
  } catch (err) {
    showToast(err.message, "error");
  }
};

const openCategoryBooks = async (id) => {
  try {
    const { data } = await apiGet(`/category/books/${id}`);
    showInfoModal("Category Books", bookListHtml(data?.books || []));
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ================= entity form modal =================
const loadMeta = async () => {
  try {
    const [a, c] = await Promise.all([
      apiGet("/author").catch(() => ({ data: { authors: [] } })),
      apiGet("/category").catch(() => ({ data: { categories: [] } })),
    ]);
    state.authors = a.data?.authors || [];
    state.categories = c.data?.categories || [];
  } catch (e) {
    state.authors = [];
    state.categories = [];
  }
};

const openBookForm = async (id = null) => {
  await loadMeta();
  let book = {};
  if (id) {
    const { data } = await apiGet("/book/" + id);
    book = data?.book || {};
  }
  const bookAuthorId = String(book.author?._id || book.author || "");
  const bookCategoryIds = (book.categories || []).map((c) =>
    String(c._id || c),
  );

  const form = document.createElement("form");
  form.id = "book-entity-form";
  form.className = "entity-form";
  form.style.cssText =
    "width:100%;display:flex;flex-direction:column;gap:.6rem;";
  const field = (label, name, type = "text", value = "", placeholder = "") =>
    `<label>${label}
       <input name="${name}" type="${type}" value="${escapeHTML(String(value ?? ""))}" placeholder="${escapeHTML(placeholder)}" />
     </label>`;

  form.innerHTML =
    field("Title", "title", "text", book.title, "Book title") +
    field("Subtitle", "subtitle", "text", book.subtitle, "Book subtitle") +
    field("Price", "price", "number", book.price, "0") +
    field("Cost price", "costPrice", "number", book.costPrice, "") +
    field("Qty in stock", "quantity", "number", book.quantity ?? 1, "1") +
    field("Min qty", "minQuantity", "number", book.minQuantity, "") +
    field("Pages", "pages", "number", book.pages, "") +
    field("Publisher", "publisher", "text", book.publisher, "e.g. Nile Books") +
    field("Cover URL", "cover", "text", book.cover, "https://...") +
    `<label>Description
        <textarea name="description">${escapeHTML(book.description || "")}</textarea>
      </label>` +
    `<label class="check-label">
        <input type="checkbox" name="availableToBorrow" ${book.availableToBorrow !== false ? "checked" : ""} /> Available to borrow
      </label>` +
    ` <label>Author
        <select name="author">
          <option value="">Select author...</option>
          ${state.authors
            .map(
              (a) =>
                `<option value="${a._id}" ${String(a._id) === bookAuthorId ? "selected" : ""}>${escapeHTML(a.name)}</option>`,
            )
            .join("")}
        </select>
      </label>` +
    ` <label>Categories
        <select name="categories" multiple size="4">
          ${state.categories
            .map(
              (c) =>
                `<option value="${c._id}" ${bookCategoryIds.includes(String(c._id)) ? "selected" : ""}>${escapeHTML(c.name)}</option>`,
            )
            .join("")}
        </select>
      </label>` +
    `<button type="submit" class="btn primary">${id ? "Save Changes" : "Create Book"}</button>`;

  $("entity-form").innerHTML = "";
  $("entity-form").appendChild(form);
  $("entity-modal-heading").textContent = id ? "Edit Book" : "New Book";
  $("entity-modal").classList.remove("hidden");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    data.categories = fd.getAll("categories");
    data.availableToBorrow = form.elements["availableToBorrow"].checked;
    data.quantity = Number(data.quantity || 0);
    data.price = Number(data.price || 0);
    data.pages = data.pages !== "" ? Number(data.pages) : undefined;
    data.costPrice = data.costPrice !== "" ? Number(data.costPrice) : undefined;
    data.minQuantity =
      data.minQuantity !== "" ? Number(data.minQuantity) : undefined;
    data.subtitle = data.subtitle || undefined;
    data.publisher = data.publisher || undefined;
    data.cover = data.cover || undefined;
    data.description = data.description || undefined;
    if (!data.title) return showToast("Title is required", "error");
    if (!data.author) return showToast("Please select an author", "error");
    if (!data.categories.length) delete data.categories;
    try {
      if (id) {
        await apiPatch(`/book/${id}`, data, true);
        showToast("Book updated");
      } else {
        await apiPost("/book/add", data, true);
        showToast("Book created");
      }
      $("entity-modal").classList.add("hidden");
      loadDashBooks($("dash-book-search").value.trim());
      loadBooks();
    } catch (err) {
      showToast(err.message, "error");
    }
  };
};

const openEntityForm = async (type, id = null) => {
  const meta = {
    author: {
      title: "Author",
      fields: [
        ["name", "Name"],
        ["image", "Image URL"],
        ["bio", "Bio"],
        ["birthDate", "Birth date (YYYY-MM-DD)"],
        ["deathDate", "Death date (YYYY-MM-DD)"],
      ],
    },
    category: {
      title: "Category",
      fields: [
        ["name", "Name"],
        ["description", "Description"],
      ],
    },
  }[type];
  let existing = null;
  if (id) {
    const { data } = await apiGet(`/${type}/${id}`);
    existing = type === "author" ? data?.author : data?.category;
  }
  const form = document.createElement("form");
  form.id = "entity-form-inner";
  form.style.cssText =
    "width:100%;display:flex;flex-direction:column;gap:.6rem;";
  const field = (name, label) =>
    `<label>${label}
       <input name="${name}" value="${escapeHTML(String(existing?.[name] ?? ""))}" />
     </label>`;
  form.innerHTML = meta.fields
    .map(([name, label]) => field(name, label))
    .join("");
  form.innerHTML += `<button type="submit" class="btn primary">${id ? "Save Changes" : "Create " + meta.title}</button>`;

  $("entity-form").innerHTML = "";
  $("entity-form").appendChild(form);
  $("entity-modal-heading").textContent =
    `${id ? "Edit" : "New"} ${meta.title}`;
  $("entity-modal").classList.remove("hidden");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const k of ["birthDate", "deathDate"]) {
      if (data[k]) data[k] = new Date(data[k]).toISOString();
      else delete data[k];
    }
    try {
      if (id) {
        await apiPatch(`/${type}/${id}`, data, true);
        showToast(`${meta.title} updated`);
      } else {
        await apiPost(`/${type}/add`, data, true);
        showToast(`${meta.title} created`);
      }
      $("entity-modal").classList.add("hidden");
      if (type === "author")
        loadDashAuthors($("dash-author-search").value.trim());
      if (type === "category")
        loadDashCategories($("dash-category-search").value.trim());
    } catch (err) {
      showToast(err.message, "error");
    }
  };
};

const openCustomerForm = async () => {
  const form = document.createElement("form");
  form.id = "customer-entity-form";
  form.style.cssText =
    "width:100%;display:flex;flex-direction:column;gap:.6rem;";
  const field = (label, name, placeholder) =>
    `<label>${label}<input name="${name}" placeholder="${placeholder}" /></label>`;
  const select = (label, name, options) =>
    `<label>${label}<select name="${name}">${options}</select></label>`;
  form.innerHTML =
    field("Name", "username", "Customer name") +
    field("Phone", "phone", "010xxxxxxx") +
    field("Address", "address", "Address") +
    select(
      "Gender",
      "gender",
      `<option value="male">Male</option><option value="female">Female</option>`,
    ) +
    select(
      "Type",
      "type",
      `<option value="branch">Branch</option><option value="online">Online</option><option value="onlineAndBranch">Online & Branch</option>`,
    ) +
    `<button type="submit" class="btn primary">Create Customer</button>`;

  $("entity-form").innerHTML = "";
  $("entity-form").appendChild(form);
  $("entity-modal-heading").textContent = "New Customer";
  $("entity-modal").classList.remove("hidden");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await apiPost("/customer/add", data, true);
      showToast("Customer created");
      $("entity-modal").classList.add("hidden");
      loadDashCustomers($("dash-customer-search").value.trim());
    } catch (err) {
      showToast(err.message, "error");
    }
  };
};

// ================= POS =================
const posAdd = async (bookId) => {
  const ok = await addToCart(bookId, 1, "pos");
  if (ok) renderPosFromCart();
};

const posChangeQty = async (bookId, delta) => {
  const item = (state.posCart?.order || []).find(
    (i) => String(i.book?._id || i.book) === String(bookId),
  );
  const qty = (item?.quantity ?? 0) + delta;
  if (qty <= 0) return posRemove(bookId, item?.quantity || 1);
  try {
    const { data } = await apiPost(
      `/cart/add-item/${bookId}`,
      { quantity: delta },
      true,
    );
    const cart = await enrichCart(data?.cart || state.cart);
    state.posCart = cart;
    state.cart = cart;
    renderPosFromCart();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const posRemove = async (bookId, quantity) => {
  if (!state.token) return;
  const bookKey = String(bookId);
  try {
    await apiPost(`/cart/remove-item/${bookId}`, { quantity: -1 }, true);
    if (state.posCart?.order) {
      state.posCart.order = state.posCart.order.filter(
        (i) => String(i.book?._id || i.book) !== bookKey,
      );
    }
    renderPosFromCart();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const clearCartOnBackend = async (cart) => {
  if (!cart?.order?.length) return;
  for (const item of cart.order) {
    const bookId = item.book?._id || item.book;
    if (!bookId) continue;
    try {
      await apiPost(`/cart/remove-item/${bookId}`, { quantity: -1 }, true);
    } catch (e) {
      /* ignore */
    }
  }
};

const posCheckout = async () => {
  if (!state.posCart?._id) return;
  const btn = $("pos-checkout");
  btn.disabled = true;
  try {
    const name = $("pos-cust-name").value.trim();
    const phone = $("pos-cust-phone").value.trim();
    if (!name || !phone) {
      throw new Error("Customer name and phone are required");
    }
    const address = $("pos-cust-address").value.trim();
    await apiPost(
      `/order/branch/buy/${state.posCart._id}`,
      {
        address,
        note: $("pos-note").value.trim(),
        customer: {
          username: name,
          phone,
          address,
          gender: $("pos-cust-gender").value,
          type: $("pos-cust-type").value,
        },
      },
      true,
    );
    $("pos-msg").className = "msg success";
    $("pos-msg").textContent = "Sale completed!";
    if (state.posCart) clearCartOnBackend(state.posCart);
    state.posCart = null;
    state.cart = null;
    $("pos-cust-name").value = "";
    $("pos-cust-phone").value = "";
    $("pos-cust-address").value = "";
    $("pos-note").value = "";
    renderPosFromCart();
    loadBooks();
    showToast("Sale Done!");
  } catch (err) {
    $("pos-msg").className = "msg error";
    $("pos-msg").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
};

const renderPosFromCart = () => {
  const wrap = $("pos-cart");
  const items = (state.posCart?.order || []).filter(
    (i) => (i.quantity ?? 0) > 0,
  );
  if (!items.length) {
    wrap.innerHTML =
      '<div class="empty-state"><p class="msg">No items yet. Search & add books.</p></div>';
    $("pos-total").textContent = formatPrice(0);
    $("pos-msg").className = "msg";
    $("pos-msg").textContent = "";
    return;
  }
  wrap.innerHTML = items
    .map(
      (i) => `
      <div class="cart-item">
        <div class="info">
          <h4>${escapeHTML(i.book?.title || "Unknown")}</h4>
          <span>${formatPrice(i.book?.price ?? 0)} each</span>
        </div>
        <div class="right">
          <div class="stepper">
            <button data-pos-minus="${i.book?._id}">−</button>
            <span>${i.quantity}</span>
            <button data-pos-plus="${i.book?._id}">+</button>
          </div>
          <span class="line-total">${formatPrice((i.book?.price ?? 0) * i.quantity)}</span>
          <button class="btn ghost small" data-pos-remove="${i.book?._id}">Remove</button>
        </div>
      </div>`,
    )
    .join("");
  wrap
    .querySelectorAll("[data-pos-remove]")
    .forEach((btn) =>
      btn.addEventListener("click", () => posRemove(btn.dataset.posRemove, 0)),
    );
  wrap
    .querySelectorAll("[data-pos-minus]")
    .forEach((b) =>
      b.addEventListener("click", () => posChangeQty(b.dataset.posMinus, -1)),
    );
  wrap
    .querySelectorAll("[data-pos-plus]")
    .forEach((b) =>
      b.addEventListener("click", () => posChangeQty(b.dataset.posPlus, 1)),
    );
  const total = items.reduce(
    (s, i) => s + (i.book?.price ?? 0) * i.quantity,
    0,
  );
  $("pos-total").textContent = formatPrice(total);
};

// ================= auth =================
const resetAuthMessages = () => {
  $("login-msg").textContent = "";
  $("signup-msg").textContent = "";
  $("login-msg").className = "msg";
  $("signup-msg").className = "msg";
};

const setAuthTab = (tab) => {
  $("tab-login").classList.toggle("active", tab === "login");
  $("tab-signup").classList.toggle("active", tab === "signup");
  $("login-form").classList.toggle("hidden", tab !== "login");
  $("forgot-form").classList.add("hidden");
  $("signup-form").classList.toggle("hidden", tab !== "signup");
  resetAuthMessages();
};

const handleLogin = async (e) => {
  e.preventDefault();
  const msg = $("login-msg");
  msg.className = "msg";
  msg.textContent = "";
  try {
    const credential = $("login-email").value.trim();
    const password = $("login-password").value;
    if (!credential) {
      msg.textContent = "Enter your email or phone";
      return;
    }
    if (!password) {
      msg.textContent = "Enter your password";
      return;
    }
    const isEmail = credential.includes("@");
    const { data } = await apiPost("/auth/login", {
      ...(isEmail ? { email: credential } : { phone: credential }),
      password,
    });
    if (!data?.accessToken) throw new Error("No token returned");
    state.token = data.accessToken;
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const safeUser = { ...(data.user || {}) };
    delete safeUser.password;
    delete safeUser.otp;
    state.user = safeUser;
    localStorage.setItem("user", JSON.stringify(state.user));
    updateAuthUI();
    e.target.reset();
    showToast("Welcome " + (state.user.username || state.user.email));
    showView("store");
  } catch (err) {
    msg.textContent = err.message;
  }
};

const handleSignup = async (e) => {
  e.preventDefault();
  const msg = $("signup-msg");
  msg.className = "msg";
  msg.textContent = "";
  try {
    const username = $("signup-username").value.trim();
    const email = $("signup-email").value.trim();
    const phone = $("signup-phone").value.trim();
    const password = $("signup-password").value;
    if (!username || !email || !phone || !password) {
      msg.textContent = "All fields are required";
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msg.textContent = "Enter a valid email";
      return;
    }
    if (password !== $("signup-confirm").value) {
      msg.textContent = "Passwords do not match!";
      return;
    }
    await apiPost("/auth/signup", {
      username,
      email,
      phone,
      password,
      confirmationPassword: password,
    });
    msg.className = "msg success";
    msg.textContent = "Account created! Login with it now.";
    setTimeout(() => setAuthTab("login"), 700);
    e.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
};

const handleLogout = () => {
  state.token = "";
  state.user = null;
  state.cart = null;
  state.posCart = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  updateAuthUI();
  showView("store");
  showToast("Logged out");
};

const setForgotView = (show) => {
  $("login-form").classList.toggle("hidden", show);
  $("forgot-form").classList.toggle("hidden", !show);
  resetAuthMessages();
};

const handleForgot = async (e) => {
  e.preventDefault();
  const msg = $("forgot-msg");
  msg.className = "msg";
  msg.textContent = "";
  const newPassword = $("forgot-new").value;
  if (newPassword !== $("forgot-confirm").value) {
    msg.textContent = "Passwords do not match!";
    return;
  }
  try {
    await apiPost("/auth/forget-password-send", {
      email: $("forgot-email").value.trim(),
      newPassword,
      confirmationNewPassword: newPassword,
    });
    msg.className = "msg success";
    msg.textContent =
      "Reset OTP sent to your email. Check your inbox (also spam).";
    e.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
};

// ================= load logged-in user =================
const loadSession = async () => {
  if (!state.token) return;
  // The backend has no "get me" route, so restore the user (incl. role) from storage.
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    localStorage.removeItem("user");
  }
  if (saved) state.user = saved;
  updateAuthUI();
};

// ================= events =================
document
  .querySelectorAll("#main-nav .nav-link[data-view]")
  .forEach((n) => n.addEventListener("click", () => showView(n.dataset.view)));
$("btn-logout").addEventListener("click", () =>
  state.token ? handleLogout() : showView("auth"),
);
$("search-btn").addEventListener("click", () =>
  loadBooks($("search-input").value.trim()),
);
$("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadBooks(e.target.value.trim());
});
$("search-input").addEventListener("input", (e) =>
  debounce(() => loadBooks(e.target.value.trim()), 400, "store-search"),
);
$("books-grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (btn) {
    openQuickAdd(btn.dataset.id);
    return;
  }
  const card = e.target.closest(".book-card");
  if (card) openBook(card.dataset.id);
});
$("book-modal-close").addEventListener("click", () =>
  $("book-modal").classList.add("hidden"),
);
$("book-modal").addEventListener("click", (e) => {
  if (e.target === $("book-modal")) $("book-modal").classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    ["book-modal", "entity-modal", "info-modal"].forEach((id) => {
      const m = document.getElementById(id);
      if (m && !m.classList.contains("hidden")) m.classList.add("hidden");
    });
  }
});
const updateQtyValue = () => {
  const el = $("qty-value");
  el.textContent = qty;
  $("qty-minus").disabled = qty <= 1;
  $("qty-plus").disabled = currentBook ? qty >= currentBook.quantity : false;
};

$("qty-minus").addEventListener("click", () => {
  if (qty > 1) {
    --qty;
    updateQtyValue();
  }
});
$("qty-plus").addEventListener("click", () => {
  if (currentBook && qty < currentBook.quantity) {
    ++qty;
    updateQtyValue();
  }
});
$("book-modal-add").addEventListener("click", async () => {
  if (!currentBook) return;
  const ok = await addToCart(currentBook._id, qty, "cart");
  if (ok) {
    $("book-modal-msg").className = "msg success";
    $("book-modal-msg").textContent = "Added to cart!";
    updateCartBadge();
    $("book-modal").classList.add("hidden");
  }
});

$("btn-buy").addEventListener("click", buyCart);
$("pos-checkout").addEventListener("click", posCheckout);
$("login-form").addEventListener("submit", handleLogin);
$("signup-form").addEventListener("submit", handleSignup);
$("forgot-form").addEventListener("submit", handleForgot);
$("forgot-link").addEventListener("click", (e) => {
  e.preventDefault();
  setForgotView(true);
});
$("forgot-back").addEventListener("click", (e) => {
  e.preventDefault();
  setForgotView(false);
});
$("tab-login").addEventListener("click", () => setAuthTab("login"));
$("tab-signup").addEventListener("click", () => setAuthTab("signup"));

// dashboard nav
document
  .querySelectorAll("#dash-nav .auth-tab")
  .forEach((t) =>
    t.addEventListener("click", () => setDashTab(t.dataset.dash)),
  );

$("btn-new-book").addEventListener("click", () => openBookForm());
$("btn-new-author").addEventListener("click", () => openEntityForm("author"));
$("btn-new-category").addEventListener("click", () =>
  openEntityForm("category"),
);
$("btn-new-customer").addEventListener("click", openCustomerForm);

$("dash-book-search").addEventListener("input", (e) =>
  debounce(() => loadDashBooks(e.target.value.trim()), 400, "books"),
);
$("dash-author-search").addEventListener("input", (e) =>
  debounce(() => loadDashAuthors(e.target.value.trim()), 400, "authors"),
);
$("dash-category-search").addEventListener("input", (e) =>
  debounce(() => loadDashCategories(e.target.value.trim()), 400, "categories"),
);
$("dash-customer-search").addEventListener("input", (e) =>
  debounce(() => loadDashCustomers(e.target.value.trim()), 400, "customers"),
);
$("dash-customer-gender").addEventListener("change", () =>
  loadDashCustomers($("dash-customer-search").value.trim()),
);
$("dash-customer-type").addEventListener("change", () =>
  loadDashCustomers($("dash-customer-search").value.trim()),
);
$("dash-order-search").addEventListener("input", (e) =>
  debounce(() => loadDashOrders(e.target.value.trim()), 400, "orders"),
);
$("dash-order-status").addEventListener("change", () =>
  loadDashOrders($("dash-order-search").value.trim()),
);
$("my-order-search").addEventListener("input", (e) =>
  debounce(() => loadMyOrders(e.target.value.trim()), 400, "my-orders"),
);
$("my-order-status").addEventListener("change", () =>
  loadMyOrders($("my-order-search").value.trim()),
);
$("sort-select").addEventListener("change", () =>
  loadBooks($("search-input").value.trim()),
);
$("publisher-filter").addEventListener("input", (e) =>
  debounce(() => loadBooks($("search-input").value.trim()), 400, "publisher"),
);

$("entity-modal-close").addEventListener("click", () =>
  $("entity-modal").classList.add("hidden"),
);
$("entity-modal").addEventListener("click", (e) => {
  if (e.target === $("entity-modal")) $("entity-modal").classList.add("hidden");
});

$("info-modal-close").addEventListener("click", () =>
  $("info-modal").classList.add("hidden"),
);
$("info-modal").addEventListener("click", (e) => {
  if (e.target === $("info-modal")) $("info-modal").classList.add("hidden");
});

// POS
$("pos-search-btn").addEventListener("click", () =>
  posSearch($("pos-search").value.trim()),
);
$("pos-search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") posSearch(e.target.value.trim());
});

const posSearch = async (search = "") => {
  const wrap = $("pos-results");
  wrap.innerHTML = '<p class="msg">Loading...</p>';
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const { data } = await apiGet("/book" + qs);
    const books = data?.books || [];
    wrap.innerHTML =
      books.length === 0
        ? '<div class="empty-state"><p class="msg">No books.</p></div>'
        : books
            .map(
              (b) => `
        <div class="pos-book ${b.quantity > 0 ? "" : "out-of-stock"}" data-id="${b._id}">
          ${coverImg(b.cover, "pos-cover")}
          <h4>${escapeHTML(b.title)}</h4>
          <p class="price">${formatPrice(b.price ?? 0)}</p>
          ${stockBadge(b.quantity)}
        </div>`,
            )
            .join("");
    wrap.querySelectorAll(".pos-book").forEach((el) =>
      el.addEventListener("click", () => {
        const stock = el.querySelector(".stock.in");
        if (stock) posAdd(el.dataset.id);
        else showToast("Out of stock", "error");
      }),
    );
  } catch (err) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

// category chips
const loadCategories = async () => {
  try {
    const { data } = await apiGet("/category");
    const cats = data?.categories || [];
    const wrap = $("category-filters");
    wrap.innerHTML =
      `<button class="chip ${!state.activeCategory ? "active" : ""}" data-cat="">All</button>` +
      cats
        .map(
          (c) =>
            `<button class="chip ${state.activeCategory === c.name ? "active" : ""}" data-cat="${escapeHTML(c.name)}">${escapeHTML(c.name)}</button>`,
        )
        .join("");
    wrap.querySelectorAll(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        state.activeCategory = chip.dataset.cat;
        wrap
          .querySelectorAll(".chip")
          .forEach((c) => c.classList.toggle("active", c === chip));
        loadBooks($("search-input").value.trim());
      }),
    );
  } catch (e) {
    /* ignored */
  }
};

let debounceTimers = {};
const debounce = (fn, ms, key = "default") => {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, ms);
};

// ================= init =================
const init = async () => {
  await loadSession();
  updateAuthUI();
  loadBooks();
  loadCategories();
};

init();
