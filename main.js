// ====== variables ======
let isLoggedIn = false;
let currentUser = null;
let cart = [];

// ====== loading shop and user panel page ======
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocalStorage();
  setupEventListeners();
});

function setupEventListeners() {
  // ------- shopping cart button -------
  const cartBtn = document.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      window.location.href = "shop.html";
    });
  }

  // ------- user panel button -------
  const userBtn = document.querySelector(".user-btn");
  if (userBtn) {
    userBtn.addEventListener("click", () => {
      if (!isLoggedIn) {
        showLoginModal();
      } else {
        window.location.href = "user-panel.html";
      }
    });
  }

  // ------- add to shopping button ------
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const bookCard = btn.closest(".book-card");
      const title = bookCard.querySelector(".book-title").textContent.trim();
      const priceText = bookCard.querySelector(".discounted-price")?.textContent ||
                        bookCard.querySelector(".original-price")?.textContent ||
                        "0 تومان";

      const price = parseInt(priceText.replace(/[^0-9]/g, ""));
      const book = {
        id: index + 1,
        title: title,
        price: price,
        image: bookCard.querySelector(".book-cover").src,
        quantity: 1
      };

      addToCart(book);
    });
  });

  // ------- loading on shop.html ------
  if (window.location.pathname.endsWith("shop.html")) {
    renderCart();
  }

  // ------- loading data user on panel ------
  if (window.location.pathname.endsWith("user-panel.html")) {
    loadUserDashboard();
  }
}

// ======= add book to shopping function =======
function addToCart(book) {
  const existingBook = cart.find(item => item.title === book.title);

  if (existingBook) {
    existingBook.quantity += 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  updateCartCounter();
  saveCartToLocalStorage();
  alert(`کتاب "${book.title}" با موفقیت به سبد خرید اضافه شد.`);
  
  if (window.location.pathname.endsWith("shop.html")) {
    renderCart();
  }
}

// ======= update shopping page counter  =======
function updateCartCounter() {
  const counter = document.querySelector(".cart-counter");
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = totalItems;
  }
}

// ======= save and loading on localStorage =======
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCounter();
  }
}

// ======= rander shopping =======
function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceElement = document.getElementById("total-price");

  if (!cart.length) {
    cartItemsContainer.innerHTML = "<p>سبد خرید شما خالی است.</p>";
    totalPriceElement.textContent = "0 تومان";
    return;
  }

  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    const cartItemHTML = `
      <div class="cart-item" data-index="${index}">
        <img src="${item.image}" alt="${item.title}" class="book-cover">
        <div class="item-details">
          <h3>${item.title}</h3>
          <div class="quantity-controls">
            <button class="qty-btn decrease">-</button>
            <span class="qty">${item.quantity}</span>
            <button class="qty-btn increase">+</button>
          </div>
        </div>
        <div class="item-price">
          <span>${itemTotal.toLocaleString()} تومان</span>
          <button class="remove-btn">حذف</button>
        </div>
      </div>
    `;

    cartItemsContainer.insertAdjacentHTML("beforeend", cartItemHTML);
  });

  totalPriceElement.textContent = `${totalPrice.toLocaleString()} تومان`;

  // ------- management ------
  setupCartItemEventListeners();
}

// ======= set all elements in shop page ======
function setupCartItemEventListeners() {
  // ------- مدیریت دکمه حذف ------
  document.querySelectorAll(".cart-item .remove-btn").forEach(btn => {
    btn.removeEventListener("click", handleRemove);
    btn.addEventListener("click", handleRemove);
  });

  // ------- manage button +/- ------
  document.querySelectorAll(".cart-item .qty-btn").forEach(btn => {
    btn.removeEventListener("click", handleQuantityChange);
    btn.addEventListener("click", handleQuantityChange);
  });
}

// ======= delete function ======
function handleRemove(e) {
  const index = e.target.closest(".cart-item").dataset.index;
  cart.splice(index, 1);
  saveCartToLocalStorage();
  renderCart();
}

// ======= change number funcrion ======
function handleQuantityChange(e) {
  const index = e.target.closest(".cart-item").dataset.index;
  const qtyElement = cart[index];

  if (e.target.classList.contains("increase")) {
    qtyElement.quantity += 1;
  } else if (e.target.classList.contains("decrease") && qtyElement.quantity > 1) {
    qtyElement.quantity -= 1;
  }

  saveCartToLocalStorage();
  renderCart();
}

// ======= manage form login =======
function showLoginModal() {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  modal.innerHTML = `
    <div style="background:white; padding:2rem; border-radius:8px; width:300px;">
      <h3 style="margin-bottom:1rem;">ورود یا ثبت‌نام</h3>
      <input type="text" id="username" placeholder="نام کاربری" style="width:100%; padding:0.5rem; margin-bottom:1rem;" />
      <input type="password" id="password" placeholder="رمز عبور" style="width:100%; padding:0.5rem; margin-bottom:1rem;" />
      <button id="loginBtn" style="width:100%; padding:0.5rem; background:#4f46e5; color:white; border:none; border-radius:5px;">ورود / ثبت‌نام</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username && password) {
      isLoggedIn = true;
      currentUser = username;
      modal.remove();

      localStorage.setItem("user", JSON.stringify({ name: username }));
      window.location.href = "user-panel.html";
    } else {
      alert("لطفاً نام کاربری و رمز عبور را وارد کنید.");
    }
  });
}

// ======= loadign data personal in user panel ======
function loadUserDashboard() {
  const userData = JSON.parse(localStorage.getItem("user"));
  if (userData) {
    document.querySelector(".section-title").textContent = `خوش آمدید، ${userData.name}`;
    document.querySelector(".dashboard-card h3").nextElementSibling.textContent = `نام: ${userData.name}`;
  }
}