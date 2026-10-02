const products = [
  { id: 1, name: "Smart Watch Pro", category: "Electronics", price: 2499, oldPrice: 3199, rating: 4.8, tag: "SALE", emoji: "⌚", bg: "#eaf1ff", description: "A sleek everyday smartwatch with fitness tracking, notifications, heart-rate monitoring and a bright display." },
  { id: 2, name: "Wireless Headphones", category: "Electronics", price: 1899, oldPrice: 2299, rating: 4.7, tag: "POPULAR", emoji: "🎧", bg: "#eeeaff", description: "Comfortable wireless headphones with immersive audio, long battery life and a lightweight design." },
  { id: 3, name: "Everyday Sneakers", category: "Fashion", price: 2299, oldPrice: 2799, rating: 4.9, tag: "BESTSELLER", emoji: "👟", bg: "#fcece8", description: "Versatile sneakers designed for everyday comfort, walking and casual outfits." },
  { id: 4, name: "Minimal Backpack", category: "Fashion", price: 1599, oldPrice: 1999, rating: 4.6, tag: "", emoji: "🎒", bg: "#f1eee9", description: "A clean, practical backpack with dedicated compartments for your laptop and daily essentials." },
  { id: 5, name: "Ceramic Coffee Set", category: "Home", price: 999, oldPrice: 1299, rating: 4.8, tag: "NEW", emoji: "☕", bg: "#fff1da", description: "A minimalist ceramic coffee set perfect for your morning routine or as a gift." },
  { id: 6, name: "Desk Lamp", category: "Home", price: 1299, oldPrice: 1599, rating: 4.5, tag: "", emoji: "💡", bg: "#fff9d9", description: "Modern adjustable desk lamp with a warm light setting for work, study and reading." },
  { id: 7, name: "Yoga Mat", category: "Sports", price: 799, oldPrice: 999, rating: 4.7, tag: "SALE", emoji: "🧘", bg: "#e5f5e9", description: "Non-slip exercise mat with a cushioned surface for yoga, stretching and home workouts." },
  { id: 8, name: "Sports Water Bottle", category: "Sports", price: 649, oldPrice: 799, rating: 4.6, tag: "", emoji: "🥤", bg: "#e3f2f8", description: "Reusable sports bottle with a leak-resistant lid and lightweight design." }
];

let cart = JSON.parse(localStorage.getItem("shopEaseCart")) || [];
let currentFilter = "All";
let searchTerm = "";

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");

function money(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2
  }).format(value);
}

function stars(rating) {
  const full = Math.floor(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderProducts() {
  let visible = products.filter(p => {
    const categoryMatch = currentFilter === "All" || p.category === currentFilter;
    const searchMatch = `${p.name} ${p.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const sort = document.getElementById("sortSelect").value;
  if (sort === "price-low") visible.sort((a,b) => a.price - b.price);
  if (sort === "price-high") visible.sort((a,b) => b.price - a.price);
  if (sort === "rating") visible.sort((a,b) => b.rating - a.rating);

  productGrid.innerHTML = visible.map(p => `
    <div class="col-12 col-sm-6 col-lg-3">
      <article class="product-card">
        <div class="product-image" style="background:${p.bg}">
          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
          <span class="emoji">${p.emoji}</span>
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h5 class="product-title">${p.name}</h5>
            <button class="quick-btn flex-shrink-0" onclick="showDetails(${p.id})" aria-label="View details">
              <i class="bi bi-eye"></i>
            </button>
          </div>
          <div class="rating mb-3">${stars(p.rating)} <span class="text-secondary ms-1">${p.rating}</span></div>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="product-price">${money(p.price)}</span>
              <span class="old-price">${money(p.oldPrice)}</span>
            </div>
            <button class="btn btn-dark btn-sm rounded-pill px-3" onclick="addToCart(${p.id})">
              <i class="bi bi-plus-lg me-1"></i>Add
            </button>
          </div>
        </div>
      </article>
    </div>
  `).join("");

  emptyState.classList.toggle("d-none", visible.length !== 0);
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast("Product added to your cart.");
}

function changeQty(id, amount) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("shopEaseCart", JSON.stringify(cart));
  renderCart();
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const container = document.getElementById("cartItems");

  if (!cart.length) {
    container.innerHTML = `
      <div class="text-center text-secondary py-5">
        <i class="bi bi-bag display-4"></i>
        <h6 class="mt-3">Your cart is empty</h6>
        <p class="small">Add some products to get started.</p>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => {
      const p = products.find(product => product.id === item.id);
      return `
        <div class="cart-product">
          <div class="cart-thumb" style="background:${p.bg}">${p.emoji}</div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <strong class="small">${p.name}</strong>
              <button class="btn btn-sm p-0 text-secondary" onclick="removeFromCart(${p.id})">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="small text-secondary mb-2">${money(p.price)}</div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="quantity-control">
                <button onclick="changeQty(${p.id}, -1)">−</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${p.id}, 1)">+</button>
              </div>
              <strong class="small">${money(p.price * item.qty)}</strong>
            </div>
          </div>
        </div>`;
    }).join("");
  }

  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;

  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("cartShipping").textContent = shipping === 0 ? "FREE" : money(shipping);
  document.getElementById("cartTotal").textContent = money(subtotal + shipping);
}

function showDetails(id) {
  const p = products.find(product => product.id === id);
  document.getElementById("productDetails").innerHTML = `
    <div class="col-md-6">
      <div class="detail-image" style="background:${p.bg}">${p.emoji}</div>
    </div>
    <div class="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
      <div class="product-category">${p.category}</div>
      <h2 class="fw-bold mt-2">${p.name}</h2>
      <div class="rating my-2">${stars(p.rating)} <span class="text-secondary ms-1">${p.rating}</span></div>
      <p class="text-secondary my-3">${p.description}</p>
      <div class="mb-4">
        <span class="product-price fs-4">${money(p.price)}</span>
        <span class="old-price">${money(p.oldPrice)}</span>
      </div>
      <button class="btn btn-dark btn-lg" onclick="addToCart(${p.id})" data-bs-dismiss="modal">
        <i class="bi bi-bag-plus me-2"></i>Add to Cart
      </button>
    </div>`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("productModal")).show();
}

function showToast(message) {
  document.getElementById("toastMessage").textContent = message;
  bootstrap.Toast.getOrCreateInstance(document.getElementById("liveToast"), { delay: 2200 }).show();
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderProducts();
  });
});

document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.category;
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === currentFilter);
    });
    renderProducts();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("sortSelect").addEventListener("change", renderProducts);

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

document.getElementById("searchModal").addEventListener("shown.bs.modal", () => {
  document.getElementById("searchInput").focus();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }
  bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("cartCanvas")).hide();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).show();
});

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const orderId = "SE-" + Math.floor(100000 + Math.random() * 900000);
  cart = [];
  saveCart();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).hide();
  showToast(`Order ${orderId} placed successfully!`);
  e.target.reset();
});

document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  showToast("Thanks! You're subscribed to ShopEase.");
});

// Close mobile navbar after clicking a navigation link
document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
  link.addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    if (nav.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }
  });
});

renderProducts();
renderCart();
cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
