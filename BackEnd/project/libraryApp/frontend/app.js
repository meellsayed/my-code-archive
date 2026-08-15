const API = "http://localhost:3000";
let currentBook = null;
let selectedQty = 1;
let activeCategory = "";
let cart = null;

const $ = (id) => document.getElementById(id);

// ================= helpers =================
const escapeHTML = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

const showToast = (message, type = "success") => {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

const isLoggedIn = () => !!localStorage.getItem("accessToken");
const currentUserName = () =>
  localStorage.getItem("username") || localStorage.getItem("email") || "";

// ================= views =================
const showView = (view) => {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-link[data-view]").forEach((n) =>
    n.classList.toggle("active", n.dataset.view === view),
  );
  if (view === "cart") renderCart();
  if (view === "auth") resetAuthMessages();
};

const updateAuthUI = () => {
  const loggedIn = isLoggedIn();
  $("nav-auth").classList.toggle("hidden", loggedIn);
  $("btn-logout").classList.toggle("hidden", !loggedIn);
  const welcome = $("welcome-msg");
  if (loggedIn) {
    welcome.textContent = `Welcome ${currentUserName()}!`;
    welcome.classList.remove("hidden");
  } else {
    welcome.classList.add("hidden");
  }
};

// ================= fetch wrappers =================
const apiGet = async (path) => {
  const res = await fetch(API + path);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};

const apiPost = async (path, body, token, skipAuth = false) => {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};

const authHeaders = () => ({ authorization: `Bearer ${localStorage.getItem("accessToken")}` });

// ================= books =================
const renderBooks = (books) => {
  const grid = $("books-grid");
  if (!books.length) {
    grid.innerHTML = '<p class="msg">No books found.</p>';
    return;
  }
  grid.innerHTML = books
    .map(
      (book) => `
      <div class="book-card" data-id="${book._id}">
        <h3>${escapeHTML(book.title)}</h3>
        <p class="author">${escapeHTML(book.author?.name || "Unknown author")}</p>
        <p class="price">$${book.price ?? "—"}</p>
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
    if (activeCategory) params.set("category", activeCategory);
    const qs = params.toString();
    const { data } = await apiGet("/book" + (qs ? `?${qs}` : ""));
    renderBooks(data?.books || []);
  } catch (err) {
    grid.innerHTML = `<p class="msg error">${escapeHTML(err.message)}</p>`;
  }
};

const loadCategories = async () => {
  try {
    const { data } = await apiGet("/category");
    const cats = data?.categories || [];
    const wrap = $("category-filters");
    wrap.innerHTML =
      `<button class="chip ${!activeCategory ? "active" : ""}" data-cat="">All</button>` +
      cats
        .map(
          (c) =>
            `<button class="chip ${activeCategory === c.name ? "active" : ""}" data-cat="${escapeHTML(c.name)}">${escapeHTML(c.name)}</button>`,
        )
        .join("");
    wrap.querySelectorAll(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        activeCategory = chip.dataset.cat;
        wrap
          .querySelectorAll(".chip")
          .forEach((c) => c.classList.toggle("active", c === chip));
        loadBooks($("search-input").value.trim());
      }),
    );
  } catch (err) {
    /* categories optional */
  }
};

const openModal = (book) => {
  currentBook = book;
  selectedQty = 1;
  $("modal-title").textContent = book.title;
  $("modal-author").textContent = book.author?.name || "Unknown author";
  $("modal-price").textContent = `$${book.price}`;
  $("modal-desc").textContent = book.description || "No description.";
  $("qty-value").textContent = "1";
  $("modal-msg").textContent = "";
  $("modal").classList.remove("hidden");
};

const loadBook = async (id) => {
  try {
    const { data } = await apiGet("/book/" + id);
    openModal(data?.book);
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ================= cart =================
const renderCart = () => {
  const wrap = $("cart-items");
  const summary = $("cart-summary");
  if (!cart || !cart.order?.length) {
    wrap.innerHTML = '<p class="msg">Your cart is empty.</p>';
    summary.classList.add("hidden");
    $("cart-msg").textContent = "";
    return;
  }
  wrap.innerHTML = cart.order
    .map(
      (item) => `
      <div class="cart-item">
        <div class="info">
          <h4>${escapeHTML(item.book?.title || "Unknown book")}</h4>
          <span>Qty: ${item.quantity} | $${item.book?.price ?? 0} each</span>
        </div>
        <button class="btn danger" data-remove="${item.book?._id}">Remove</button>
      </div>`,
    )
    .join("");
  const total = cart.order.reduce(
    (sum, item) => sum + (item.book?.price ?? 0) * item.quantity,
    0,
  );
  $("cart-total").textContent = `$${total.toFixed(2)}`;
  summary.classList.remove("hidden");
  wrap.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => removeItem(btn.dataset.remove)),
  );
};

const addToCart = async () => {
  if (!isLoggedIn()) {
    showToast("Please login first", "error");
    return;
  }
  if (!currentBook) return;
  const addBtn = $("modal-add");
  addBtn.disabled = true;
  try {
    const { data } = await apiPost(
      `/order/cart/add-item/${currentBook._id}`,
      { quantity: selectedQty },
      localStorage.getItem("accessToken"),
    );
    cart = data?.cart;
    $("modal-msg").className = "msg success";
    $("modal-msg").textContent = "Added to cart!";
    showToast("Added to cart!");
  } catch (err) {
    $("modal-msg").className = "msg error";
    $("modal-msg").textContent = err.message;
  } finally {
    addBtn.disabled = false;
  }
};

const removeItem = async (bookId) => {
  try {
    const { data } = await apiPost(
      `/order/cart/remove-item/${bookId}`,
      {},
      localStorage.getItem("accessToken"),
    );
    cart = data?.cart;
    renderCart();
    showToast("Item removed");
  } catch (err) {
    showToast(err.message, "error");
  }
};

const buyCart = async () => {
  if (!cart || !cart._id) return;
  const buyBtn = $("btn-buy");
  buyBtn.disabled = true;
  try {
    const { data } = await apiPost(
      `/order/buy/cart/${cart._id}`,
      {
        address: $("checkout-address").value.trim(),
        note: $("checkout-note").value.trim(),
      },
      localStorage.getItem("accessToken"),
    );
    $("cart-msg").className = "msg success";
    $("cart-msg").textContent = "Purchase done!";
    cart = null;
    $("checkout-address").value = "";
    $("checkout-note").value = "";
    renderCart();
    showToast("Purchase complete!");
  } catch (err) {
    $("cart-msg").className = "msg error";
    $("cart-msg").textContent = err.message;
    showToast(err.message, "error");
  } finally {
    buyBtn.disabled = false;
  }
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
    const isEmail = credential.includes("@");
    const { data } = await apiPost("/auth/login", {
      ...(isEmail ? { email: credential } : { phone: credential }),
      password: $("login-password").value,
    });
    if (!data?.accessToken) throw new Error("No token returned");
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("username", data.user?.username || "");
    localStorage.setItem("email", data.user?.email || "");
    updateAuthUI();
    msg.className = "msg success";
    msg.textContent = "Login successful!";
    e.target.reset();
    showView("books");
    showToast("Welcome " + currentUserName() + "!");
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
    const password = $("signup-password").value;
    if (password !== $("signup-confirm").value) {
      msg.textContent = "Passwords do not match!";
      return;
    }
    const { data } = await apiPost("/auth/signup", {
      username: $("signup-username").value.trim(),
      email: $("signup-email").value.trim(),
      phone: $("signup-phone").value.trim(),
      password,
      confirmationPassword: password,
    });
    msg.className = "msg success";
    msg.textContent = "Account created! You can login now.";
    showToast("Account created! You can login now.");
    setTimeout(() => setAuthTab("login"), 600);
    e.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  cart = null;
  renderCart();
  updateAuthUI();
  showView("books");
  showToast("Logged out");
};

// ================= events =================
document.querySelectorAll(".nav-link[data-view]").forEach((n) =>
  n.addEventListener("click", () => showView(n.dataset.view)),
);
$("btn-logout").addEventListener("click", handleLogout);
$("search-btn").addEventListener("click", () => loadBooks($("search-input").value.trim()));
$("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadBooks(e.target.value.trim());
});
$("books-grid").addEventListener("click", (e) => {
  const card = e.target.closest(".book-card");
  if (card) loadBook(card.dataset.id);
});
$("modal-close").addEventListener("click", () => $("modal").classList.add("hidden"));
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) $("modal").classList.add("hidden");
});
$("modal-add").addEventListener("click", addToCart);
$("qty-minus").addEventListener("click", () => {
  if (selectedQty > 1) {
    selectedQty--;
    $("qty-value").textContent = selectedQty;
  }
});
$("qty-plus").addEventListener("click", () => {
  selectedQty++;
  $("qty-value").textContent = selectedQty;
});
$("login-form").addEventListener("submit", handleLogin);
$("signup-form").addEventListener("submit", handleSignup);
$("tab-login").addEventListener("click", () => setAuthTab("login"));
$("tab-signup").addEventListener("click", () => setAuthTab("signup"));
$("btn-buy").addEventListener("click", buyCart);

// ================= init =================
updateAuthUI();
loadCategories();
loadBooks();