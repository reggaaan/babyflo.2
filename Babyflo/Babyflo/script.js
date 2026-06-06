// --- DOM ELEMENTS ---
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');
const productGrid = document.getElementById('productGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const voucherInput = document.getElementById('voucherInput');
const applyVoucherBtn = document.getElementById('applyVoucher');
const dbContactForm = document.getElementById('dbContactForm');

// Hero Smooth-Scroll Elements
const shopNowBtn = document.getElementById('shopNowBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');

// --- APP STATE ---
let cart = [];
let discount = 0; // percentage discount

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadDatabaseProducts();
    setupGridListener();
    setupVoucherLogic();
    setupHeroScrolls();
    setupContactForm();
});

// --- MODALS & SIDEBARS ---
if (openCartBtn) openCartBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('active'));

// --- HERO BUTTONS SMOOTH SCROLL ---
function setupHeroScrolls() {
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            const target = document.getElementById('products');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            const target = document.getElementById('about'); // Navigates directly to your About Section
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// --- PRODUCT LOADING (C# BACKEND VIA PORT 5190) ---
async function loadDatabaseProducts() {
    const gridContainer = document.getElementById('productGrid');
    if (!gridContainer) return;

    try {
        const response = await fetch('http://localhost:5190/api/products');
        const products = await response.json();

        gridContainer.innerHTML = '';
        products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Custom conditional badges & text from your original markup
            const bestSellerTag = index === 0 ? '<span class="best-seller">Best Seller</span>' : '';

            let desc = "Mild comforting fragrance with citrus, floral and powdery scents.";
            if (product.name.includes("Powder")) desc = "Fruity, floral and woody comforting scent.";
            if (product.name.includes("Butterfly")) desc = "Floral, powdery and musky fragrance.";

            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-info">
                    ${bestSellerTag}
                    <h3>${product.name}</h3>
                    <p>${desc}</p>
                    <div class="price-row">
                        <h4>₱${product.price.toFixed(2)}</h4>
                        <span>₱${(product.price / 100).toFixed(2)} / mL</span>
                    </div>
                    <button class="add-cart-btn" data-name="${product.name}" data-price="${product.price}">
                        Add to Cart
                    </button>
                </div>
            `;
            gridContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
        gridContainer.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center; color: #ff7fa2; font-weight: 500; padding: 20px;">
                <i class="fa-solid fa-triangle-exclamation"></i> Server Offline. Dynamic catalog items could not render.
            </p>
        `;
    }
}

// --- EVENT DELEGATION FOR CLICK CATCHING ---
function setupGridListener() {
    const gridContainer = document.getElementById('productGrid');
    if (!gridContainer) return;

    gridContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('add-cart-btn')) {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            addToCart(name, price);
        }
    });
}

// --- CORE CART LOGIC ---
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartUI();

    if (cartSidebar) {
        cartSidebar.classList.add('active'); // Slide out sidebar automatically
    }
}

function updateCartUI() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    let totalItems = 0;
    let subtotal = 0;

    cart.forEach((item, index) => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.style.display = 'flex';
        cartItem.style.justifyContent = 'space-between';
        cartItem.style.alignItems = 'center';
        cartItem.style.marginBottom = '15px';
        cartItem.style.paddingBottom = '10px';
        cartItem.style.borderBottom = '1px solid #eee';

        cartItem.innerHTML = `
            <div>
                <h4 style="margin:0;">${item.name}</h4>
                <small style="color:#666;">₱${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button onclick="changeQuantity(${index}, 1)" style="padding: 2px 8px; border: 1px solid #ffd1df; background: #fff; cursor: pointer; border-radius: 5px;">+</button>
                <button onclick="changeQuantity(${index}, -1)" style="padding: 2px 8px; border: 1px solid #ffd1df; background: #fff; cursor: pointer; border-radius: 5px;">-</button>
                <button onclick="removeItem(${index})" style="background: none; border: none; color: #ff4f87; cursor: pointer; font-size: 1.1rem;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    let finalTotal = subtotal * (1 - discount / 100);

    if (cartCountSpan) cartCountSpan.textContent = totalItems;
    if (cartTotalSpan) cartTotalSpan.textContent = finalTotal.toFixed(2);
}

// --- GLOBAL SCOPE WINDOW BINDINGS ---
window.changeQuantity = function (index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

window.removeItem = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

// --- VOUCHER SYSTEM ---
function setupVoucherLogic() {
    if (!applyVoucherBtn) return;

    applyVoucherBtn.addEventListener('click', () => {
        const code = voucherInput.value.trim().toUpperCase();
        if (code === 'BABY15') {
            discount = 15;
            alert('Promo code applied successfully! 15% off your total.');
            updateCartUI();
        } else {
            alert('Invalid voucher code. Try again!');
        }
    });
}

// --- CONTACT FORM SUBMISSION TO DATABASE ---
function setupContactForm() {
    if (!dbContactForm) return;

    dbContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        try {
            const response = await fetch('http://localhost:5190/api/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            if (response.ok) {
                alert("Success! Your message has been securely recorded inside our database.");
                dbContactForm.reset();
            } else {
                alert("Error sending message from the backend structure.");
            }
        } catch (error) {
            alert("Cannot reach server database context endpoints. Open your C# BabyfloServer console container!");
        }
    });
}