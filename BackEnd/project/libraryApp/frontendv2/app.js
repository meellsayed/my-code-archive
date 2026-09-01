/* ============================================================
   frontendv2/app.js  —  complete SPA for libraryApp backend
   ============================================================ */
const API = "http://localhost:3000";

const $ = (id) => document.getElementById(id);
const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const formatPrice = (n) => `${Number(n || 0).toLocaleString("en-EG")} ج.م`;
const STATUS_LABELS = {
  new: "جديد",
  in_processing: "قيد التجهيز",
  ready_to_ship: "جاهز للشحن",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  canceled: "ملغي",
};
const STATUS_BADGE_CLASS = {
  new: "info",
  in_processing: "info",
  ready_to_ship: "warn",
  shipped: "warn",
  delivered: "in",
  canceled: "low",
};
const statusBadge = (s) =>
  `<span class="stock-badge ${STATUS_BADGE_CLASS[s] || "in"}">${escapeHTML(STATUS_LABELS[s] || s || "")}</span>`;
const stockBadge = (qty, min) => {
  if (qty == null) return `<span class="stock-badge in">متاح</span>`;
  const low = min && qty <= min;
  return `<span class="stock-badge ${low ? "low" : "in"}">${qty} نسخة${low ? " (منخفض)" : ""}</span>`;
};
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420"><rect width="300" height="420" fill="#e7ebf0"/></svg>',
  );
const coverImg = (url, cls = "book-cover") =>
  `<img class="${cls}" src="${escapeHTML(url || "")}" alt="" loading="lazy" onerror="this.src='${PLACEHOLDER}'" />`;

/* ===================== state ===================== */
const state = {
  token: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  cart: null,
  activeCategory: "",
  books: [],
  bookPage: 1,
  bookLimit: 12,
  pagination: {},
  dashTab: "books",
};
const isStaff = () =>
  state.user && (state.user.role === "admin" || state.user.role === "staff");
const isAdmin = () => state.user && state.user.role === "admin";

/* ===================== api layer ===================== */
const authHeaders = () => ({ authorization: `Bearer ${state.token}` });

const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length && keys.every((k) => /^\d+$/.test(k)))
      return Object.values(data);
    const arr = keys.map((k) => data[k]).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
};

const api = async (path, opts = {}, useAuth = false, retried = false) => {
  const isForm = opts.body instanceof FormData;
  const res = await fetch(API + path, {
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(useAuth ? authHeaders() : {}),
    },
    ...opts,
  });
  if (res.status === 401 && useAuth && !retried) {
    if (await tryRefreshToken()) return api(path, opts, useAuth, true);
  }
  const json = await res.json().catch(() => ({}));
  if (
    json?.data &&
    !Array.isArray(json.data) &&
    typeof json.data === "object"
  ) {
    const keys = Object.keys(json.data);
    if (keys.length && keys.every((k) => /^\d+$/.test(k)))
      json.data = Object.values(json.data);
  }
  if (!res.ok) {
    const err = new Error(json.message || "Request failed");
    err.json = json;
    throw err;
  }
  return json;
};
const tryRefreshToken = async () => {
  if (!state.refreshToken) return false;
  try {
    const res = await fetch(API + "/api/v1/auth/access-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${state.refreshToken}`,
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data?.accessToken) return false;
    state.token = json.data.accessToken;
    localStorage.setItem("accessToken", state.token);
    return true;
  } catch {
    return false;
  }
};
const apiGet = (p, a = false) => api(p, { method: "GET" }, a);
const apiPost = (p, b = {}, a = false) =>
  api(p, { method: "POST", body: JSON.stringify(b) }, a);
const apiPatch = (p, b = {}, a = false) =>
  api(p, { method: "PATCH", body: JSON.stringify(b) }, a);
const apiDelete = (p, a = false) => api(p, { method: "DELETE" }, a);
const apiUploadPut = (p, fd, a = false) =>
  api(p, { method: "PUT", body: fd }, a);

/* ===================== toast / modal ===================== */
const showToast = (msg, type = "") => {
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  $("toast").appendChild(t);
  setTimeout(() => t.remove(), 3200);
};
const openModal = (id) => $(id).classList.remove("hidden");
const closeModal = (id) => $(id).classList.add("hidden");
const showInfoModal = (title, html) => {
  $("info-modal-heading").textContent = title;
  $("info-modal-body").innerHTML = html;
  openModal("info-modal");
};

/* ===================== auth ===================== */
const login = async (email, password) => {
  const res = await apiPost("/api/v1/auth/login", { email, password });
  state.token = res.data.accessToken;
  state.refreshToken = res.data.refreshToken;
  localStorage.setItem("accessToken", state.token);
  localStorage.setItem("refreshToken", state.refreshToken);
  await fetchMe();
};
const register = async (body) => {
  await apiPost("/api/v1/auth/signup", body);
  await login(body.email, body.password);
};
const fetchMe = async () => {
  const res = await apiGet("/api/v1/users/me", true);
  state.user = res.data.user;
  localStorage.setItem("user", JSON.stringify(state.user));
  updateAuthUI();
  await loadCart();
};
const logout = () => {
  state.token = state.refreshToken = state.user = state.cart = null;
  ["accessToken", "refreshToken", "user"].forEach((k) =>
    localStorage.removeItem(k),
  );
  updateAuthUI();
  showView("store");
  showToast("تم تسجيل الخروج");
};
const updateAuthUI = () => {
  $("nav-dashboard").classList.toggle("hidden", !isStaff());
  $("nav-orders").classList.toggle("hidden", !state.user);
  $("nav-profile").classList.toggle("hidden", !state.user);
  const area = $("auth-area");
  if (state.user) {
    area.innerHTML = `<span class="btn ghost">${escapeHTML(state.user.username || state.user.email)} (${escapeHTML(state.user.role || "")})</span><button class="btn" id="btn-logout">خروج</button>`;
    $("btn-logout").onclick = logout;
  } else {
    area.innerHTML = `<button class="btn primary" id="btn-login">تسجيل الدخول</button>`;
    $("btn-login").onclick = () => openModal("auth-modal");
  }
};

/* ===================== navigation ===================== */
const showView = (view) => {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  $(`view-${view}`).classList.add("active");
  document
    .querySelectorAll(".nav-link")
    .forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  if (view === "store") loadBooks();
  if (view === "dashboard") renderDashboardPane();
  if (view === "orders") loadMyOrders();
  if (view === "profile") loadProfile();
};
const renderDashboardPane = () => {
  const map = {
    books: () => loadDashBooks(),
    authors: () => loadDashAuthors(),
    categories: () => loadDashCategories(),
    customers: () => loadDashCustomers(),
    orders: () => loadDashOrders(),
    stock: () => loadStock(),
    pos: () => {
      if (!$("pos-results").childElementCount) posSearch("");
    },
  };
  map[state.dashTab]?.();
};

/* ===================== store ===================== */
const loadBooks = async (search = "", append = false) => {
  if (!append) {
    state.bookPage = 1;
    state.books = [];
  } else {
    state.bookPage = (state.bookPage || 1) + 1;
  }
  const grid = $("books-grid");
  if (!append) grid.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (state.activeCategory) params.set("category", state.activeCategory);
    const publisher = $("publisher-filter")?.value?.trim();
    if (publisher) params.set("publisher", publisher);
    const sort = $("sort-select")?.value || "";
    if (sort) params.set("sort", sort);
    params.set("limit", String(state.bookLimit || 12));
    params.set("page", String(state.bookPage));
    const res = await apiGet("/api/v1/books?" + params.toString());
    const books = asList(res.data);
    state.pagination = res.pagination;
    if (append) state.books = [...(state.books || []), ...books];
    else state.books = books;
    renderBooksGrid();
    const lm = $("books-loadmore");
    if (lm)
      lm.style.display =
        state.bookPage < (res.pagination?.totalPages || 1) ? "block" : "none";
  } catch (e) {
    if (!append)
      grid.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const renderBooksGrid = () => {
  const grid = $("books-grid");
  const books = state.books || [];
  grid.innerHTML = books.length
    ? books.map(bookCard).join("")
    : '<p class="msg">لا توجد كتب.</p>';
  grid
    .querySelectorAll("[data-book]")
    .forEach((c) =>
      c.addEventListener("click", () => openBook(c.dataset.book)),
    );
};
const bookCard = (b) => `
  <div class="book-card" data-book="${b._id}">
    ${coverImg(b.cover)}
    <div class="bc-body">
      <h4>${escapeHTML(b.title)}</h4>
      <div class="bc-meta">${escapeHTML(b.author?.name || "")}</div>
      <div class="bc-price">${formatPrice(b.price)}</div>
    </div>
  </div>`;

const openBook = async (id) => {
  const res = await apiGet("/api/v1/books/" + id).catch(() => null);
  const b = res?.data?.book;
  if (!b) return showToast("الكتاب غير موجود", "error");
  $("book-modal-body").innerHTML = `
    ${coverImg(b.cover, "modal-cover")}
    <div class="bm-info">
      <h2>${escapeHTML(b.title)}</h2>
      <p>${escapeHTML(b.author?.name || "")} · ${escapeHTML((b.categories || []).map((c) => c.name).join("، "))}</p>
      <p>${escapeHTML(b.description || "")}</p>
      <p><strong>السعر:</strong> ${formatPrice(b.price)}</p>
      <p>${stockBadge(b.quantity, b.minQuantity)}</p>
      <button class="btn primary" id="bm-add">أضف للسلة</button>
    </div>`;
  $("bm-add").onclick = () => addToCart(b._id, 1);
  openModal("book-modal");
};

/* ===================== cart ===================== */
const addToCart = async (bookId, qty = 1, mode = "store") => {
  if (!state.token) return openModal("auth-modal");
  try {
    const res = await apiPost(
      `/api/v1/cart/items/${bookId}`,
      { quantity: qty },
      true,
    );
    state.cart = await enrichCart(res.data?.cart || state.cart);
    updateCartBadge();
    renderCart();
    if (mode === "store") showToast("أُضيف للسلة");
  } catch (e) {
    showToast(e.message, "error");
  }
};
const enrichCart = async (cart) => {
  if (!cart?.items?.length) return cart;
  const map = await getBookMap();
  cart.items = cart.items
    .map((it) => {
      const book =
        map.get(String(it.book?._id || it.book)) ||
        (typeof it.book === "object" ? it.book : {});
      return {
        ...it,
        book: { ...book, quantity: it.quantity ?? book.quantity },
      };
    })
    .filter((it) => (it.quantity ?? 0) > 0);
  return cart;
};
let bookCache = null;
const getBookMap = async () => {
  if (!bookCache) {
    try {
      const res = await apiGet("/api/v1/books?limit=1000");
      bookCache = new Map(asList(res.data).map((b) => [String(b._id), b]));
    } catch {
      bookCache = new Map();
    }
  }
  return bookCache;
};
const changeCartQty = async (bookId, delta) => {
  try {
    const res = await apiPost(
      `/api/v1/cart/items/${bookId}`,
      { quantity: delta },
      true,
    );
    state.cart = await enrichCart(res.data?.cart || state.cart);
    updateCartBadge();
    renderCart();
  } catch (e) {
    showToast(e.message, "error");
  }
};
const removeCartItem = async (bookId) => changeCartQty(bookId, -1);
const updateCartBadge = () => {
  const n = (state.cart?.items || []).reduce(
    (s, i) => s + (i.quantity ?? 0),
    0,
  );
  $("cart-count").textContent = n;
};
const loadCart = async () => {
  if (!state.token) return;
  try {
    const res = await apiGet("/api/v1/cart/active", true).catch(() =>
      apiGet("/api/v1/cart", true),
    );
    state.cart = await enrichCart(res.data?.cart || res.data);
  } catch {
    state.cart = null;
  }
  updateCartBadge();
  renderCart();
};
const renderCart = () => {
  const wrap = $("cart-items");
  const items = (state.cart?.items || []).filter((i) => (i.quantity ?? 0) > 0);
  $("cart-count").textContent = items.reduce(
    (s, i) => s + (i.quantity ?? 0),
    0,
  );
  if (!items.length) {
    wrap.innerHTML = '<div class="empty-state">سلة المشتريات فارغة.</div>';
    $("cart-summary").classList.add("hidden");
    return;
  }
  wrap.innerHTML = items
    .map(
      (i) => `
    <div class="cart-item">
      ${coverImg(i.book?.cover, "cart-cover")}
      <div class="info">
        <h4>${escapeHTML(i.book?.title || "")}</h4>
        <span>${formatPrice(i.book?.price ?? 0)}</span>
        <div class="stepper">
          <button data-qty-minus="${i.book?._id}">−</button>
          <span>${i.quantity}</span>
          <button data-qty-plus="${i.book?._id}">+</button>
        </div>
      </div>
      <button class="btn ghost small" data-remove="${i.book?._id}">حذف</button>
    </div>`,
    )
    .join("");
  wrap
    .querySelectorAll("[data-remove]")
    .forEach((b) => (b.onclick = () => removeCartItem(b.dataset.remove)));
  wrap
    .querySelectorAll("[data-qty-minus]")
    .forEach((b) => (b.onclick = () => changeCartQty(b.dataset.qtyMinus, -1)));
  wrap
    .querySelectorAll("[data-qty-plus]")
    .forEach((b) => (b.onclick = () => changeCartQty(b.dataset.qtyPlus, 1)));
  const total = items.reduce(
    (sum, i) => sum + (Number(i.book?.price) || 0) * (i.quantity ?? 0),
    0,
  );
  $("cart-total").textContent = formatPrice(total);
  $("cart-summary").classList.remove("hidden");
  renderPosCart();
  $("customer-fields").classList.toggle("hidden", !isStaff());
  $("btn-buy").textContent = isStaff() ? "إتمام بيع (فرع)" : "شراء";
};
const renderPosCart = () => {
  const wrap = $("pos-cart");
  if (!wrap) return;
  const items = (state.cart?.items || []).filter((i) => (i.quantity ?? 0) > 0);
  if (!items.length) {
    wrap.innerHTML = '<p class="msg">لم تتم إضافة كتب بعد.</p>';
    return;
  }
  wrap.innerHTML = items
    .map(
      (i) => `
    <div class="pos-cart-item">
      ${coverImg(i.book?.cover, "cart-cover")}
      <div class="info">
        <h4>${escapeHTML(i.book?.title || "")}</h4>
        <span>${formatPrice(i.book?.price ?? 0)}</span>
        <div class="stepper">
          <button data-pos-minus="${i.book?._id}">−</button>
          <span>${i.quantity}</span>
          <button data-pos-plus="${i.book?._id}">+</button>
        </div>
      </div>
      <button class="btn ghost small" data-pos-remove="${i.book?._id}">حذف</button>
    </div>`,
    )
    .join("");
  wrap
    .querySelectorAll("[data-pos-remove]")
    .forEach((b) => (b.onclick = () => removeCartItem(b.dataset.posRemove)));
  wrap
    .querySelectorAll("[data-pos-minus]")
    .forEach((b) => (b.onclick = () => changeCartQty(b.dataset.posMinus, -1)));
  wrap
    .querySelectorAll("[data-pos-plus]")
    .forEach((b) => (b.onclick = () => changeCartQty(b.dataset.posPlus, 1)));
};
const buyCart = async () => {
  if (!state.cart?._id) return;
  const btn = $("btn-buy");
  btn.disabled = true;
  try {
    const address = $("checkout-address").value.trim();
    const note = $("checkout-note").value.trim();
    let res;
    if (isStaff()) {
      const customer = {
        username: $("cust-name").value.trim(),
        phone: $("cust-phone").value.trim(),
        address: $("cust-address").value.trim() || address,
        gender: $("cust-gender").value,
        type: $("cust-type").value,
      };
      if (!customer.username || !customer.phone)
        throw new Error("اسم العميل وتليفونه مطلوبان");
      res = await apiPost(
        `/api/v1/orders/${state.cart._id}/buy`,
        { customer },
        true,
      );
    } else {
      res = await apiPost(
        `/api/v1/orders/online/cart/${state.cart._id}/buy`,
        { address, note },
        true,
      );
    }
    state.cart = null;
    renderCart();
    updateCartBadge();
    showToast(res.message || "تمت العملية بنجاح", "success");
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    btn.disabled = false;
  }
};

/* ===================== POS ===================== */
const posSearch = async (q = "") => {
  try {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    params.set("limit", "30");
    const res = await apiGet("/api/v1/books?" + params.toString());
    const books = asList(res.data);
    $("pos-results").innerHTML = books.length
      ? books
          .map(
            (b) =>
              `<div class="pos-card" data-pos="${b._id}">${coverImg(b.cover)}<h4>${escapeHTML(b.title)}</h4><span>${formatPrice(b.price)}</span></div>`,
          )
          .join("")
      : '<p class="msg">لا نتائج</p>';
    $("pos-results")
      .querySelectorAll("[data-pos]")
      .forEach((c) => (c.onclick = () => addToCart(c.dataset.pos, 1, "pos")));
  } catch (e) {
    showToast(e.message, "error");
  }
};
const posCheckout = async () => {
  if (!state.cart?._id) return showToast("أضف منتجات أولاً", "error");
  const name = $("pos-cust-name").value.trim();
  const phone = $("pos-cust-phone").value.trim();
  if (!name || !phone) return showToast("اسم العميل وتليفونه مطلوبان", "error");
  try {
    const res = await apiPost(
      `/api/v1/orders/${state.cart._id}/buy`,
      {
        customer: {
          username: name,
          phone,
          address: $("pos-cust-address").value.trim(),
          gender: "male",
          type: "branch",
        },
      },
      true,
    );
    state.cart = null;
    renderCart();
    updateCartBadge();
    showToast(res.message || "تم البيع", "success");
  } catch (e) {
    showToast(e.message, "error");
  }
};

/* ===================== dashboard: books ===================== */
const loadDashBooks = async (search = "") => {
  const wrap = $("dash-books-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("limit", "100");
    const res = await apiGet("/api/v1/books?" + params.toString());
    const books = asList(res.data);
    wrap.innerHTML = books.length
      ? books
          .map(
            (b) => `
        <div class="dash-row">
          ${coverImg(b.cover)}
          <div class="info"><h4>${escapeHTML(b.title)}</h4>
            <span>${escapeHTML(b.author?.name || "")} · ${formatPrice(b.price)} · ${stockBadge(b.quantity, b.minQuantity)}</span></div>
          <div class="dash-actions">
            <button class="btn ghost small" data-edit-book="${b._id}">تعديل</button>
            ${isAdmin() ? `<button class="btn danger small" data-del-book="${b._id}">حذف</button>` : ""}
          </div>
        </div>`,
          )
          .join("")
      : '<p class="msg">لا كتب.</p>';
    wrap
      .querySelectorAll("[data-edit-book]")
      .forEach((b) => (b.onclick = () => openBookForm(b.dataset.editBook)));
    wrap
      .querySelectorAll("[data-del-book]")
      .forEach((b) => (b.onclick = () => delBook(b.dataset.delBook)));
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const openBookForm = async (id = null) => {
  const [authors, categories] = await Promise.all([
    apiGet("/api/v1/authors?limit=500"),
    apiGet("/api/v1/categories?limit=500"),
  ]);
  const aList = asList(authors.data);
  const cList = asList(categories.data);
  const b = id ? (await apiGet("/api/v1/books/" + id)).data.book : {};
  const form = $("entity-form");
  form.innerHTML = `
    <input name="title" placeholder="العنوان" value="${escapeHTML(b.title || "")}" required />
    <input name="subtitle" placeholder="العنوان الفرعي" value="${escapeHTML(b.subtitle || "")}" />
    <input name="description" placeholder="الوصف" value="${escapeHTML(b.description || "")}" />
    <select name="author">${aList.map((a) => `<option value="${a._id}" ${String(b.author?._id) === a._id ? "selected" : ""}>${escapeHTML(a.name)}</option>`).join("")}</select>
    <select name="categories" multiple size="4">${cList.map((c) => `<option value="${c._id}" ${(b.categories || []).some((x) => String(x._id) === c._id) ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("")}</select>
    <input name="pages" type="number" placeholder="عدد الصفحات" value="${b.pages || ""}" />
    <input name="price" type="number" placeholder="السعر" value="${b.price || ""}" required />
    <input name="costPrice" type="number" placeholder="سعر التكلفة" value="${b.costPrice || ""}" />
    <input name="quantity" type="number" placeholder="الكمية" value="${b.quantity || ""}" />
    <input name="minQuantity" type="number" placeholder="الحد الأدنى" value="${b.minQuantity || ""}" />
    <label><input type="checkbox" name="availableToBorrow" ${b.availableToBorrow === false ? "" : "checked"} /> متاح للإعارة</label>
    <input name="coverFile" type="file" accept="image/*" />
    <button class="btn primary" type="submit">${id ? "حفظ" : "إنشاء"}</button>`;
  $("entity-modal-heading").textContent = id ? "تعديل كتاب" : "كتاب جديد";
  openModal("entity-modal");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    data.categories = fd.getAll("categories");
    data.pages = data.pages ? Number(data.pages) : undefined;
    data.price = Number(data.price);
    data.costPrice = data.costPrice ? Number(data.costPrice) : undefined;
    data.quantity = data.quantity ? Number(data.quantity) : 1;
    data.minQuantity = data.minQuantity ? Number(data.minQuantity) : undefined;
    data.availableToBorrow = fd.get("availableToBorrow") === "on";
    const coverFile = fd.get("coverFile");
    try {
      let bookId = id;
      if (id) {
        await apiPatch(`/api/v1/books/${id}`, data, true);
      } else {
        const created = await apiPost("/api/v1/books", data, true);
        bookId = created.data?.book?._id;
      }
      if (coverFile && coverFile.size) {
        const cf = new FormData();
        cf.append("file", coverFile);
        await apiUploadPut(`/api/v1/books/${bookId}/cover`, cf, true);
      }
      closeModal("entity-modal");
      bookCache = null;
      loadDashBooks($("dash-book-search").value.trim());
      showToast("تم الحفظ", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
};
const delBook = async (id) => {
  if (!confirm("حذف هذا الكتاب؟")) return;
  try {
    await apiDelete(`/api/v1/books/${id}`, true);
    bookCache = null;
    loadDashBooks($("dash-book-search").value.trim());
    showToast("تم الحذف", "success");
  } catch (e) {
    showToast(e.message, "error");
  }
};

/* ===================== dashboard: generic entity (author/category/customer) ===================== */
const ENTITY = {
  author: {
    heading: (id) => (id ? "تعديل مؤلف" : "مؤلف جديد"),
    fields: [
      ["name", "الاسم"],
      ["bio", "نبذة"],
      ["birthDate", "تاريخ الميلاد (YYYY-MM-DD)"],
      ["deathDate", "تاريخ الوفاة (اختياري)"],
    ],
    base: "/api/v1/authors",
    add: "/api/v1/authors",
    isCustomer: false,
  },
  category: {
    heading: (id) => (id ? "تعديل تصنيف" : "تصنيف جديد"),
    fields: [
      ["name", "الاسم"],
      ["description", "وصف"],
    ],
    base: "/api/v1/categories",
    add: "/api/v1/categories",
    isCustomer: false,
  },
  customer: {
    heading: (id) => (id ? "تعديل عميل" : "عميل جديد"),
    fields: [
      ["username", "الاسم"],
      ["phone", "التليفون"],
      ["address", "العنوان"],
      ["gender", "select:male|female", "الجنس"],
      ["type", "select:branch|online|onlineAndBranch", "النوع"],
    ],
    base: "/api/v1/customer",
    add: "/api/v1/customer",
    isCustomer: true,
  },
};
const openEntityForm = async (type, id = null) => {
  const meta = ENTITY[type];
  const existing = id
    ? (await apiGet(`${meta.base}/${id}`, true)).data?.[type]
    : null;
  const form = $("entity-form");
  const fieldsHtml = meta.fields
    .map(([name, kind, label]) => {
      const val =
        existing?.[name] != null ? String(existing[name]).slice(0, 10) : "";
      if (kind.startsWith("select:")) {
        const opts = kind
          .split(":")[1]
          .split("|")
          .map(
            (o) =>
              `<option value="${o}" ${existing?.[name] === o ? "selected" : ""}>${o}</option>`,
          )
          .join("");
        return `<select name="${name}">${opts}</select>`;
      }
      return `<input name="${name}" placeholder="${label || name}" value="${escapeHTML(existing?.[name] ?? "")}" />`;
    })
    .join("");
  form.innerHTML =
    fieldsHtml + '<button class="btn primary" type="submit">حفظ</button>';
  $("entity-modal-heading").textContent = meta.heading(id);
  openModal("entity-modal");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      if (id) await apiPatch(`${meta.base}/${id}`, data, true);
      else await apiPost(meta.add, data, true);
      closeModal("entity-modal");
      if (type === "author") loadDashAuthors();
      if (type === "category") loadDashCategories();
      if (type === "customer") loadDashCustomers();
      showToast("تم الحفظ", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
};
const delEntity = async (type, id) => {
  if (!confirm(`حذف ${type}؟`)) return;
  const meta = ENTITY[type];
  try {
    await apiDelete(`${meta.base}/${id}`, true);
    if (type === "author") loadDashAuthors();
    if (type === "category") loadDashCategories();
    if (type === "customer") loadDashCustomers();
    showToast("تم الحذف", "success");
  } catch (e) {
    showToast(e.message, "error");
  }
};

const loadDashAuthors = async (search = "") => {
  const wrap = $("dash-authors-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const res = await apiGet(
      "/api/v1/authors?limit=500" +
        (search ? `&search=${encodeURIComponent(search)}` : ""),
    );
    const list = asList(res.data);
    wrap.innerHTML = list.length
      ? list
          .map(
            (
              a,
            ) => `<div class="dash-row"><div class="info"><h4>${escapeHTML(a.name)}</h4><span>كتب: ${a.booksCount ?? 0}</span></div>
        <div class="dash-actions"><button class="btn ghost small" data-edit-author="${a._id}">تعديل</button>
        ${isAdmin() ? `<button class="btn danger small" data-del-author="${a._id}">حذف</button>` : ""}</div></div>`,
          )
          .join("")
      : '<p class="msg">لا مؤلفين.</p>';
    wrap
      .querySelectorAll("[data-edit-author]")
      .forEach(
        (b) =>
          (b.onclick = () => openEntityForm("author", b.dataset.editAuthor)),
      );
    wrap
      .querySelectorAll("[data-del-author]")
      .forEach(
        (b) => (b.onclick = () => delEntity("author", b.dataset.delAuthor)),
      );
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const loadDashCategories = async (search = "") => {
  const wrap = $("dash-categories-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const res = await apiGet(
      "/api/v1/categories?limit=500" +
        (search ? `&search=${encodeURIComponent(search)}` : ""),
    );
    const list = asList(res.data);
    wrap.innerHTML = list.length
      ? list
          .map(
            (
              c,
            ) => `<div class="dash-row"><div class="info"><h4>${escapeHTML(c.name)}</h4><span>${escapeHTML(c.description || "")}</span></div>
        <div class="dash-actions"><button class="btn ghost small" data-edit-category="${c._id}">تعديل</button>
        ${isAdmin() ? `<button class="btn danger small" data-del-category="${c._id}">حذف</button>` : ""}</div></div>`,
          )
          .join("")
      : '<p class="msg">لا تصنيفات.</p>';
    wrap
      .querySelectorAll("[data-edit-category]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            openEntityForm("category", b.dataset.editCategory)),
      );
    wrap
      .querySelectorAll("[data-del-category]")
      .forEach(
        (b) => (b.onclick = () => delEntity("category", b.dataset.delCategory)),
      );
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const loadDashCustomers = async (search = "") => {
  const wrap = $("dash-customers-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const g = $("dash-customer-gender")?.value;
    const t = $("dash-customer-type")?.value;
    if (g) params.set("gender", g);
    if (t) params.set("type", t);
    const res = await apiGet("/api/v1/customer?" + params.toString(), true);
    const list = asList(res.data);
    wrap.innerHTML = list.length
      ? list
          .map(
            (
              c,
            ) => `<div class="dash-row"><div class="info"><h4>${escapeHTML(c.username || "")}</h4><span>${escapeHTML(c.phone || "")} · ${escapeHTML(c.type || "")}</span></div>
        <div class="dash-actions"><button class="btn ghost small" data-cust-orders="${c._id}">طلبات</button>
        ${isAdmin() ? `<button class="btn danger small" data-del-customer="${c._id}">حذف</button>` : ""}</div></div>`,
          )
          .join("")
      : '<p class="msg">لا عملاء.</p>';
    wrap
      .querySelectorAll("[data-cust-orders]")
      .forEach(
        (b) => (b.onclick = () => openCustomerOrders(b.dataset.custOrders)),
      );
    wrap
      .querySelectorAll("[data-del-customer]")
      .forEach(
        (b) => (b.onclick = () => delEntity("customer", b.dataset.delCustomer)),
      );
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};

/* ===================== dashboard: orders ===================== */
const orderDetailHtml = (o) => `
  <p><strong>رقم الطلب:</strong> ${escapeHTML(o._id)}</p>
  <p><strong>الحالة:</strong> ${statusBadge(o.status)}</p>
  <p><strong>العميل:</strong> ${escapeHTML(o.customer?.username || "—")}</p>
  <p><strong>الإجمالي:</strong> ${formatPrice(o.total || 0)}</p>
  <p><strong>تاريخ:</strong> ${new Date(o.createdAt).toLocaleString("en-EG")}</p>
  <div>${(o.cart?.items || []).map((i) => `<div>• ${escapeHTML(i.book?.title || "")} × ${i.quantity} — ${formatPrice((i.book?.price || 0) * i.quantity)}</div>`).join("")}</div>`;
const loadDashOrders = async (search = "") => {
  const wrap = $("dash-orders-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const status = $("dash-order-status")?.value;
    const res = await apiGet("/api/v1/orders?limit=200", true);
    let list = asList(res.data);
    const term = search.trim().toLowerCase();
    list = list.filter(
      (o) =>
        (!status || o.status === status) &&
        (!term ||
          String(o._id).toLowerCase().includes(term) ||
          String(o.customer?.username || "")
            .toLowerCase()
            .includes(term)),
    );
    wrap.innerHTML = list.length
      ? list
          .map(
            (
              o,
            ) => `<div class="dash-row"><div class="info"><h4>طلب ${escapeHTML(o._id)}</h4>
        <span>${escapeHTML(o.customer?.username || "—")} · ${formatPrice(o.total || 0)} · ${statusBadge(o.status)}</span></div>
        <div class="dash-actions">
          ${["new", "in_processing", "ready_to_ship", "shipped"].includes(o.status) ? `<button class="btn primary small" data-advance="${o._id}">تقديم</button>` : ""}
          ${["new", "in_processing", "ready_to_ship", "shipped"].includes(o.status) ? `<button class="btn danger small" data-cancel="${o._id}">إلغاء</button>` : ""}
          <button class="btn ghost small" data-view-order="${o._id}">عرض</button>
        </div></div>`,
          )
          .join("")
      : '<p class="msg">لا طلبات.</p>';
    wrap
      .querySelectorAll("[data-advance]")
      .forEach((b) => (b.onclick = () => advanceOrder(b.dataset.advance)));
    wrap
      .querySelectorAll("[data-cancel]")
      .forEach((b) => (b.onclick = () => cancelOrder(b.dataset.cancel)));
    wrap
      .querySelectorAll("[data-view-order]")
      .forEach((b) => (b.onclick = () => openOrderDetail(b.dataset.viewOrder)));
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const advanceOrder = async (id) => {
  try {
    const res = await apiPatch(`/api/v1/orders/${id}/status`, {}, true);
    showToast(res.message || "تم التقديم", "success");
    loadDashOrders($("dash-order-search").value.trim());
  } catch (e) {
    showToast(e.message, "error");
  }
};
const cancelOrder = async (id) => {
  try {
    const res = await apiPatch(`/api/v1/orders/online/${id}/cancel`, {}, true);
    showToast(res.message || "تم الإلغاء", "success");
    loadDashOrders($("dash-order-search").value.trim());
  } catch (e) {
    showToast(e.message, "error");
  }
};
const openCustomerOrders = async (cid) => {
  try {
    const res = await apiGet(`/api/v1/orders/customer/${cid}`, true);
    const list = asList(res.data);
    showInfoModal(
      `طلبات العميل (${list.length})`,
      list.length
        ? list
            .map(
              (o) =>
                `<div class="dash-row"><div class="info"><h4>طلب ${escapeHTML(o._id)}</h4><span>${formatPrice(o.total || 0)} · ${statusBadge(o.status)}</span></div><button class="btn ghost small" data-o="${o._id}">عرض</button></div>`,
            )
            .join("")
        : '<p class="msg">لا طلبات.</p>',
    );
    $("info-modal-body")
      .querySelectorAll("[data-o]")
      .forEach((b) => (b.onclick = () => openOrderDetail(b.dataset.o)));
  } catch (e) {
    showToast(e.message, "error");
  }
};
const openOrderDetail = async (id) => {
  try {
    let o = null;
    try {
      o = (await apiGet(`/api/v1/orders/online/${id}`, true)).data?.order;
    } catch {}
    if (!o) o = (await apiGet(`/api/v1/orders/${id}`, true)).data?.order;
    if (!o) throw new Error("الطلب غير موجود");
    showInfoModal("تفاصيل الطلب", orderDetailHtml(o));
  } catch (e) {
    showToast(e.message, "error");
  }
};

/* ===================== dashboard: stock ===================== */
const loadStock = async (search = "") => {
  const wrap = $("dash-stock-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const res = await apiGet("/api/v1/stock/books?limit=500", true);
    const list = asList(res.data);
    wrap.innerHTML = list.length
      ? list
          .map(
            (b) =>
              `<div class="dash-row stock-book" data-stock="${b._id}">${coverImg(b.cover)}<div class="info"><h4>${escapeHTML(b.title)}</h4><span>${stockBadge(b.quantity, b.minQuantity)}</span></div></div>`,
          )
          .join("")
      : '<p class="msg">لا كتب.</p>';
    wrap
      .querySelectorAll("[data-stock]")
      .forEach((r) => (r.onclick = () => loadStockMovements(r.dataset.stock)));
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};
const loadStockMovements = async (bookId) => {
  const detail = $("dash-stock-detail");
  detail.innerHTML = `
    <form id="stock-adjust-form" class="stock-form">
      <h4>تعديل المخزون</h4>
      <div class="stock-form-grid">
        <select name="type"><option value="in">وارد</option><option value="out">صادر</option></select>
        <input name="quantity" type="number" min="1" value="1" placeholder="الكمية" />
        <input name="price" type="number" step="0.01" placeholder="السعر (اختياري)" />
        <select name="customerType"><option value="">—</option><option value="Customer">عميل</option><option value="User">مستخدم</option></select>
        <input name="customer" placeholder="معرف العميل (اختياري)" />
      </div>
      <button class="btn primary" type="submit">تسجيل حركة</button>
      <p id="stock-adjust-msg" class="msg"></p>
    </form>
    <h4>سجل الحركات</h4>
    <div id="stock-move-list"><p class="msg">جارٍ التحميل...</p></div>`;
  $("stock-adjust-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      type: fd.get("type"),
      quantity: Number(fd.get("quantity") || 0),
    };
    const price = fd.get("price");
    if (price) body.price = Number(price);
    const ct = fd.get("customerType");
    if (ct) body.customerType = ct;
    const cu = fd.get("customer")?.trim();
    if (cu) body.customer = cu;
    try {
      const res = await apiPost(`/api/v1/stock/books/${bookId}`, body, true);
      showToast(res.message || "تم التسجيل", "success");
      loadStockMovements(bookId);
    } catch (err) {
      $("stock-adjust-msg").className = "msg error";
      $("stock-adjust-msg").textContent = err.message;
    }
  };
  try {
    const res = await apiGet(`/api/v1/stock/books/${bookId}`, true);
    const moves = asList(res.data);
    $("stock-move-list").innerHTML = moves.length
      ? moves
          .map(
            (m) =>
              `<div class="stock-move-row ${m.type}"><span>${m.type === "in" ? "وارد" : "صادر"}</span><span>${m.quantity}</span><span>${formatPrice(m.price || 0)}</span><span>${escapeHTML(m.seller?.username || "—")}</span><span>${new Date(m.createdAt).toLocaleDateString("en-EG")}</span></div>`,
          )
          .join("")
      : '<p class="msg">لا حركات.</p>';
  } catch (e) {
    $("stock-move-list").innerHTML =
      `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};

/* ===================== profile ===================== */
const loadProfile = async () => {
  try {
    const res = await apiGet("/api/v1/users/me", true);
    const u = res.data.user;
    $("profile-username").value = u.username || "";
    $("profile-phone").value = u.phone || "";
    $("profile-gender").value = u.gender || "male";
    $("profile-address").value = u.address || "";
    $("profile-avatar").src = u.image || PLACEHOLDER;
  } catch (e) {
    showToast(e.message, "error");
  }
};
const submitProfile = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    username: fd.get("username")?.trim(),
    phone: fd.get("phone")?.trim(),
    gender: fd.get("gender"),
    address: fd.get("address")?.trim() || undefined,
  };
  try {
    const avatar = fd.get("profile-avatar-file");
    if (avatar && avatar.size) {
      const af = new FormData();
      af.append("file", avatar);
      await apiUploadPut("/api/v1/users/me/avatar", af, true);
    }
    await apiPatch("/api/v1/users/me", body, true);
    showToast("تم حفظ الملف الشخصي", "success");
    await fetchMe();
    loadProfile();
  } catch (err) {
    showToast(err.message, "error");
  }
};

/* ===================== my orders ===================== */
const loadMyOrders = async (search = "") => {
  const wrap = $("my-orders-list");
  wrap.innerHTML = '<p class="msg">جارٍ التحميل...</p>';
  try {
    const status = $("my-order-status")?.value;
    const res = await apiGet("/api/v1/orders/online?limit=200", true);
    let list = asList(res.data);
    const term = search.trim().toLowerCase();
    list = list.filter(
      (o) =>
        (!status || o.status === status) &&
        (!term || String(o._id).toLowerCase().includes(term)),
    );
    wrap.innerHTML = list.length
      ? list
          .map(
            (
              o,
            ) => `<div class="dash-row"><div class="info"><h4>طلب ${escapeHTML(o._id)}</h4>
        <span>${formatPrice(o.total || 0)} · ${statusBadge(o.status)}</span></div>
        <div class="dash-actions">${["new", "in_processing", "ready_to_ship", "shipped"].includes(o.status) ? `<button class="btn danger small" data-my-cancel="${o._id}">إلغاء</button>` : ""}
        <button class="btn ghost small" data-my-view="${o._id}">عرض</button></div></div>`,
          )
          .join("")
      : '<p class="msg">لا طلبات.</p>';
    wrap
      .querySelectorAll("[data-my-cancel]")
      .forEach((b) => (b.onclick = () => cancelOrder(b.dataset.myCancel)));
    wrap
      .querySelectorAll("[data-my-view]")
      .forEach((b) => (b.onclick = () => openOrderDetail(b.dataset.myView)));
  } catch (e) {
    wrap.innerHTML = `<p class="msg error">${escapeHTML(e.message)}</p>`;
  }
};

/* ===================== category chips ===================== */
const loadCategoryChips = async () => {
  try {
    const res = await apiGet("/api/v1/categories?limit=500");
    const list = asList(res.data);
    $("category-filters").innerHTML =
      `<button class="chip ${!state.activeCategory ? "active" : ""}" data-cat="">الكل</button>` +
      list
        .map(
          (c) =>
            `<button class="chip ${state.activeCategory === c.name ? "active" : ""}" data-cat="${escapeHTML(c.name)}">${escapeHTML(c.name)}</button>`,
        )
        .join("");
    $("category-filters")
      .querySelectorAll("[data-cat]")
      .forEach((chip) => {
        chip.onclick = () => {
          state.activeCategory = chip.dataset.cat;
          loadCategoryChips();
          loadBooks();
        };
      });
  } catch {}
};

/* ===================== events ===================== */
const bindEvents = () => {
  document.querySelectorAll(".nav-link, .brand").forEach((el) => {
    const view = el.dataset.view || "store";
    el.onclick = (e) => {
      e.preventDefault();
      showView(view);
    };
  });
  $("btn-cart").onclick = () => showView("cart");
  document
    .querySelectorAll("[data-close]")
    .forEach((b) => (b.onclick = () => closeModal(b.dataset.close)));

  // auth modal tabs
  document.querySelectorAll(".auth-tab").forEach((t) => {
    t.onclick = () => {
      document
        .querySelectorAll(".auth-tab")
        .forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      const which = t.dataset.auth;
      $("login-form").classList.toggle("hidden", which !== "login");
      $("register-form").classList.toggle("hidden", which !== "register");
      $("forgot-form").classList.toggle("hidden", which !== "forgot");
    };
  });
  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await login(fd.get("email"), fd.get("password"));
      closeModal("auth-modal");
      showToast("أهلاً بك", "success");
    } catch (err) {
      e.target.querySelector(".msg").textContent = err.message;
      e.target.querySelector(".msg").className = "msg error";
    }
  };
  $("register-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await register(Object.fromEntries(fd));
      closeModal("auth-modal");
      showToast("تم التسجيل بنجاح", "success");
    } catch (err) {
      e.target.querySelector(".msg").textContent = err.message;
      e.target.querySelector(".msg").className = "msg error";
    }
  };
  $("forgot-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await apiPost(
        "/api/v1/auth/forgot-password",
        Object.fromEntries(fd),
      );
      closeModal("auth-modal");
      showToast(res.message || "تم الإرسال", "success");
    } catch (err) {
      e.target.querySelector(".msg").textContent = err.message;
      e.target.querySelector(".msg").className = "msg error";
    }
  };

  // store controls
  let searchTimer;
  $("search-input").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadBooks(e.target.value.trim()), 350);
  };
  $("sort-select").onchange = () => loadBooks();
  $("publisher-filter").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadBooks(), 350);
  };
  $("books-loadmore").onclick = () =>
    loadBooks($("search-input").value.trim(), true);
  $("btn-buy").onclick = buyCart;
  $("profile-form").onsubmit = submitProfile;

  // dashboard nav
  document.querySelectorAll(".dash-tab").forEach((t) => {
    t.onclick = () => {
      document
        .querySelectorAll(".dash-tab")
        .forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      state.dashTab = t.dataset.dash;
      document
        .querySelectorAll(".dash-pane")
        .forEach((p) => p.classList.remove("active"));
      $(`dash-${state.dashTab}`).classList.add("active");
      renderDashboardPane();
    };
  });
  $("btn-new-book").onclick = () => openBookForm();
  $("btn-new-author").onclick = () => openEntityForm("author");
  $("btn-new-category").onclick = () => openEntityForm("category");
  $("dash-book-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadDashBooks(e.target.value.trim()), 300);
  };
  $("dash-author-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadDashAuthors(e.target.value.trim()), 300);
  };
  $("dash-category-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
      () => loadDashCategories(e.target.value.trim()),
      300,
    );
  };
  $("dash-customer-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
      () => loadDashCustomers(e.target.value.trim()),
      300,
    );
  };
  $("dash-customer-gender").onchange = () => loadDashCustomers();
  $("dash-customer-type").onchange = () => loadDashCustomers();
  $("dash-order-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadDashOrders(e.target.value.trim()), 300);
  };
  $("dash-order-status").onchange = () => loadDashOrders();
  $("dash-stock-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadStock(e.target.value.trim()), 300);
  };
  $("pos-search-input").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => posSearch(e.target.value.trim()), 300);
  };
  $("pos-checkout").onclick = posCheckout;
  $("my-order-search").oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadMyOrders(e.target.value.trim()), 300);
  };
  $("my-order-status").onchange = () => loadMyOrders();
};

/* ===================== init ===================== */
(async () => {
  bindEvents();
  updateAuthUI();
  await loadCategoryChips();
  if (state.token) {
    try {
      await fetchMe();
    } catch {
      /* keep */
    }
  }
  showView("store");
})();
