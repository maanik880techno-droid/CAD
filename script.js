// ===================================================
//  CAD STUDIO PRO — MAIN SCRIPT
//  Three.js Hero + GSAP Animations + All Features
// ===================================================

/* ===== PRODUCT DATA ===== */
const sampleProject = {
    id: "sample-001", title: "Standard Computer Keyboard — Technical Drawing",
    category: "Product Design", price: null, icon: "fa-keyboard",
    isSample: true, url: "keyboard-drawing.html"
};
const products = [
    sampleProject,
    { id: 2, title: "Car Door Lock", price: 100, category: "Automotive", icon: "fa-car" },
    { id: 3, title: "Chair", price: 100, category: "Furniture", icon: "fa-chair" },
    { id: 4, title: "Guitar", price: null, category: "Music", icon: "fa-guitar" },
    { id: 5, title: "Mouse", price: 150, category: "Electronics", icon: "fa-computer-mouse" },
    { id: 6, title: "Watch", price: 150, category: "Accessories", icon: "fa-clock" },
    { id: 7, title: "Keyboard", price: 200, category: "Electronics", icon: "fa-keyboard" },
    { id: 8, title: "Laptop", price: 200, category: "Electronics", icon: "fa-laptop" },
    { id: 9, title: "AC", price: 100, category: "Home Appliances", icon: "fa-snowflake" },
    { id: 10, title: "Specs", price: 200, category: "Accessories", icon: "fa-glasses" },
    { id: 11, title: "Wrist Watch", price: 200, category: "Accessories", icon: "fa-clock" },
    { id: 12, title: "Admiral", price: 200, category: "Misc", icon: "fa-star" },
    { id: 13, title: "Cup", price: 100, category: "Kitchen", icon: "fa-mug-hot" },
    { id: 14, title: "Fridge", price: null, category: "Home Appliances", icon: "fa-box" },
    { id: 15, title: "Wall Clock", price: 150, category: "Home Decor", icon: "fa-clock" }
];

let cart = [];
let wishlist = JSON.parse(localStorage.getItem('cad_wishlist') || '[]');
let currentFilter = 'All';
let searchTerm = '';
let sortBy = 'default';
let activeCoupon = null; // store applied coupon

/* ===== LOADING SCREEN ===== */
window.addEventListener('load', () => {
    setTimeout(() => {
        const ls = document.getElementById('loadingScreen');
        if (ls) {
            ls.classList.add('hidden');
            initAnimations();
        }
    }, 2200);
});

/* ===== CUSTOM CURSOR ===== */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (cursor && follower) {
    let fx = 0, fy = 0;
    const moveCursor = (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    };
    const animateFollower = () => {
        const el = follower;
        const targetX = parseFloat(cursor.style.left) || 0;
        const targetY = parseFloat(cursor.style.top) || 0;
        fx += (targetX - fx) * 0.1;
        fy += (targetY - fy) * 0.1;
        el.style.left = fx + 'px';
        el.style.top = fy + 'px';
        requestAnimationFrame(animateFollower);
    };
    document.addEventListener('mousemove', moveCursor);
    animateFollower();
    document.querySelectorAll('a, button, .project-card, .faq-item, .why-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

/* ===== THREE.JS HERO BACKGROUND ===== */
function initThreeJS() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Wireframe cubes
    const cubes = [];
    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.BoxGeometry(1.4, 1.4, 1.4),
    ];
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00D4FF, wireframe: true, opacity: 0.15, transparent: true });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, wireframe: true, opacity: 0.1, transparent: true });

    for (let i = 0; i < 12; i++) {
        const geo = geometries[i % geometries.length];
        const mat = i % 4 === 0 ? goldMat : wireMat;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 8 - 2
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        mesh.userData = {
            rotX: (Math.random() - 0.5) * 0.005,
            rotY: (Math.random() - 0.5) * 0.005,
            floatY: Math.random() * 0.003,
            floatPhase: Math.random() * Math.PI * 2,
        };
        scene.add(mesh);
        cubes.push(mesh);
    }

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00D4FF, size: 0.04, opacity: 0.4, transparent: true });
    scene.add(new THREE.Points(pGeo, pMat));

    // Grid Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, opacity: 0.04, transparent: true });
    for (let i = -6; i <= 6; i += 2) {
        const hGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i, -3), new THREE.Vector3(12, i, -3)]);
        const vGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 2, -6, -3), new THREE.Vector3(i * 2, 6, -3)]);
        scene.add(new THREE.Line(hGeo, lineMat));
        scene.add(new THREE.Line(vGeo, lineMat));
    }

    let t = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        t += 0.01;
        cubes.forEach((c, i) => {
            c.rotation.x += c.userData.rotX;
            c.rotation.y += c.userData.rotY;
            c.position.y += Math.sin(t + c.userData.floatPhase) * c.userData.floatY;
        });
        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Mouse parallax on the camera
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    // Inject into the animate loop via a separate rAF
    const parallaxLoop = () => {
        camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.04;
        requestAnimationFrame(parallaxLoop);
    };
    parallaxLoop();
}

/* ===== GSAP SCROLL ANIMATIONS ===== */
function initAnimations() {
    // Scroll reveal with IntersectionObserver
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
            }
        });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));

    // Stats count-up
    const statEls = document.querySelectorAll('.stat-value[data-target]');
    if (statEls.length) {
        const statsObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target);
                    let current = 0;
                    const step = target / 60;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { current = target; clearInterval(timer); }
                        el.innerText = Math.floor(current);
                    }, 20);
                    statsObs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        statEls.forEach(el => statsObs.observe(el));
    }

    // Hero title word-by-word animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '1';
    }

    initThreeJS();
}

/* ===== DOM READY ===== */
document.addEventListener('DOMContentLoaded', () => {

    /* ===== NAVBAR ===== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    /* ===== HAMBURGER ===== */
    const ham = document.getElementById('hamburger');
    const mobMenu = document.getElementById('mobileMenuOverlay');
    const mobClose = document.getElementById('mobileClose');
    if (ham && mobMenu) {
        ham.addEventListener('click', () => mobMenu.classList.add('open'));
        if (mobClose) mobClose.addEventListener('click', () => mobMenu.classList.remove('open'));
        mobMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobMenu.classList.remove('open')));
    }

    /* ===== FILTERS ===== */
    const filtersCont = document.getElementById('filtersContainer');
    if (filtersCont) {
        const categories = ['All', ...new Set(products.map(p => p.category))];
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${cat === 'All' ? 'active' : ''}`;
            btn.innerText = cat;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = cat;
                renderProducts();
            });
            filtersCont.appendChild(btn);
        });
    }

    /* ===== SEARCH ===== */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderProducts();
        });
    }

    /* ===== SORT ===== */
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderProducts();
        });
    }

    /* ===== RENDER PRODUCTS ===== */
    renderProducts();

    /* ===== FAQ ===== */
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-q')?.addEventListener('click', () => {
            const answer = item.querySelector('.faq-a');
            const icon = item.querySelector('.faq-q i');
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(x => {
                x.classList.remove('open');
                if (x.querySelector('.faq-a')) x.querySelector('.faq-a').style.display = 'none';
                if (x.querySelector('.faq-q i')) x.querySelector('.faq-q i').style.transform = '';
            });
            if (!isOpen) {
                item.classList.add('open');
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
                icon.style.color = 'var(--blue)';
            }
        });
    });

    /* ===== CART ===== */
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const toggleCart = () => {
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('active');
    };
    cartBtn?.addEventListener('click', toggleCart);
    closeCartBtn?.addEventListener('click', toggleCart);
    overlay?.addEventListener('click', toggleCart);

    /* ===== COUPON ===== */
    document.getElementById('applyCoupon')?.addEventListener('click', () => {
        const code = document.getElementById('couponCode')?.value?.trim().toUpperCase();
        if (code === 'SAVE10') { activeCoupon = { code: 'SAVE10', discount: 10 }; showToast('✅ Coupon SAVE10 applied — 10% off!'); }
        else if (code === 'STUDENT20') { activeCoupon = { code: 'STUDENT20', discount: 20 }; showToast('✅ Student discount 20% applied!'); }
        else if (code === 'CU@123') { activeCoupon = { code: 'CU@123', discount: 5 }; showToast('✅ Special Coupon CU@123 applied — 5% off!'); }
        else { activeCoupon = null; showToast('❌ Invalid coupon code.'); }
        updateCart(); // re-render total
    });

    /* ===== CHECKOUT ===== */
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        if (cart.length === 0) { showToast('⚠️ Your cart is empty!'); return; }
        // Open custom payment modal Instead of Razorpay
        document.getElementById('paymentModal')?.classList.add('active');
        document.getElementById('payStep1').style.display = 'block';
        document.getElementById('payStep2').style.display = 'none';
        document.getElementById('payStep3').style.display = 'none';

        let total = cart.reduce((s, p) => s + p.price, 0);
        let discHtml = '';
        if (activeCoupon) {
            const discAmt = total * (activeCoupon.discount / 100);
            total -= discAmt;
            discHtml = `<div style="color:var(--green); font-size:0.85rem; margin-top:0.3rem">✅ Coupon ${activeCoupon.code} applied (-₹${discAmt.toFixed(2)})</div>`;
        }

        const summary = cart.map(p => `• ${p.title} <span style="float:right">₹${p.price.toFixed(2)}</span>`).join('<br>');
        const sumEl = document.getElementById('payerCartSummary');
        if (sumEl) sumEl.innerHTML = summary + discHtml;
        const totalEl = document.getElementById('payFinalTotal');
        if (totalEl) totalEl.innerText = '₹' + total.toFixed(2);
    });

    /* ===== PAYMENT MODAL LOGIC ===== */
    window.closePaymentModal = () => document.getElementById('paymentModal')?.classList.remove('active');

    window.proceedToQR = () => {
        const name = document.getElementById('payerName')?.value;
        const phone = document.getElementById('payerPhone')?.value;
        if (!name || name.trim() === '') { showToast('⚠️ Please enter your Full Name.'); return; }
        if (!phone || phone.trim() === '') { showToast('⚠️ Please enter your WhatsApp Number.'); return; }

        document.getElementById('payStep1').style.display = 'none';
        document.getElementById('payStep2').style.display = 'block';
    };

    window.goBackStep1 = () => {
        document.getElementById('payStep2').style.display = 'none';
        document.getElementById('payStep1').style.display = 'block';
    };

    window.confirmPayment = () => {
        // Save order to LocalStorage for Admin Dashboard
        const name = document.getElementById('payerName')?.value;
        const phone = document.getElementById('payerPhone')?.value;
        const utr = document.getElementById('utrInput')?.value;

        let rawTotal = cart.reduce((s, p) => s + p.price, 0);
        let amountPaid = rawTotal;
        if (activeCoupon) amountPaid -= rawTotal * (activeCoupon.discount / 100);

        const newOrder = {
            id: 'ORD-' + Math.floor(Math.random() * 1000000),
            name: name,
            phone: phone,
            project: cart.map(p => p.title).join(', '),
            amountPaid: amountPaid,
            coupon: activeCoupon ? activeCoupon.code : null,
            utr: utr,
            timestamp: new Date().toLocaleString()
        };

        const existingOrders = JSON.parse(localStorage.getItem('cad_orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('cad_orders', JSON.stringify(existingOrders));

        // Clear cart
        cart = [];
        activeCoupon = null;
        updateCart();

        // Show Success
        document.getElementById('payStep2').style.display = 'none';
        document.getElementById('payStep3').style.display = 'block';
        document.getElementById('confirmedPhone').innerText = phone;
    };

    /* ===== MODAL HANDLERS ===== */
    window.openModal = () => document.getElementById('requestModal')?.classList.add('active');
    window.closeModal = () => document.getElementById('requestModal')?.classList.remove('active');
    window.handleRequestForm = (e) => {
        e.preventDefault(); window.closeModal();
        showToast('✅ Request received! We\'ll contact you soon.');
    };
    window.handleContactForm = (e) => {
        e.preventDefault(); e.target.reset();
        showToast('✅ Message sent! We\'ll get back to you shortly.');
    };

    /* ===== WISHLIST BADGE ===== */
    updateWishlistBadge();
});

/* ===== RENDER PRODUCTS ===== */
function renderProducts() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    let filtered = products.filter(p => {
        const matchCat = currentFilter === 'All' || p.category === currentFilter;
        const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm) || p.category.toLowerCase().includes(searchTerm);
        return matchCat && matchSearch;
    });

    // Sort
    if (sortBy === 'price-asc') filtered = filtered.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
    else if (sortBy === 'price-desc') filtered = filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === 'name') filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));

    grid.innerHTML = '';
    filtered.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `project-card${p.isSample ? ' sample-card' : ''}`;
        card.style.animationDelay = `${index * 80}ms`;

        const inWishlist = wishlist.includes(String(p.id));
        const heartClass = `fa-heart card-wishlist${inWishlist ? ' active fa-solid' : ' fa-regular'}`;

        let priceSection = '';
        if (p.price === null) {
            const waUrl = `https://wa.me/917973862363?text=Hi!%20I'm%20interested%20in%20${encodeURIComponent(p.title)}.%20Can%20you%20share%20the%20price%3F`;
            priceSection = `
                <div class="card-footer" style="flex-direction:column; align-items:flex-start; gap:0.5rem">
                    <span class="card-contact">Contact for Price</span>
                    <a href="${waUrl}" target="_blank" class="card-wa-link">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </a>
                </div>`;
        } else {
            priceSection = `
                <div class="card-footer">
                    <span class="card-price">₹${p.price.toFixed(2)}</span>
                    <button class="card-add-btn" onclick="addToCart('${p.id}')">Add to Cart</button>
                </div>`;
        }

        const sampleRibbon = p.isSample ? '<div class="sample-ribbon">SAMPLE</div>' : '';
        const viewLink = p.url ? `<a href="${p.url}" style="font-size:0.78rem; color:var(--blue); display:inline-block; margin-bottom:0.5rem">View Details →</a>` : '';

        card.innerHTML = `
            ${sampleRibbon}
            <span class="card-category">${p.category}</span>
            <i class="${heartClass}" onclick="toggleWishlist('${p.id}', this)" title="Add to Wishlist"></i>
            <div class="card-image">
                <i class="fa-solid ${p.icon}"></i>
                <div class="card-image-overlay"></div>
                <div class="quick-preview">Quick Preview</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${p.title}</h3>
                ${viewLink}
                ${priceSection}
            </div>`;

        card.querySelector('.quick-preview')?.addEventListener('click', () => {
            showToast(`🔍 Previewing: ${p.title}`);
            if (p.url) window.location.href = p.url;
        });
        grid.appendChild(card);
    });
}

/* ===== WISHLIST ===== */
window.toggleWishlist = (id, el) => {
    const idx = wishlist.indexOf(String(id));
    if (idx > -1) {
        wishlist.splice(idx, 1);
        el.className = 'fa-regular fa-heart card-wishlist';
        showToast('💔 Removed from wishlist');
    } else {
        wishlist.push(String(id));
        el.className = 'fa-solid fa-heart card-wishlist active';
        showToast('❤️ Added to wishlist!');
    }
    localStorage.setItem('cad_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
};
function updateWishlistBadge() {
    const el = document.getElementById('wishlistCount');
    if (el) el.innerText = wishlist.length;
}

/* ===== CART ===== */
window.addToCart = (id) => {
    const product = products.find(p => String(p.id) === String(id));
    if (!product || product.price === null) return;
    cart.push(product);
    updateCart();
    showToast(`🛒 "${product.title}" added to cart!`);
};
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCart();
};
function updateCart() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.innerText = cart.length;
    const itemsList = document.getElementById('cartItems');
    if (!itemsList) return;

    if (cart.length === 0) {
        itemsList.innerHTML = '<p class="cart-empty">Your cart is currently empty.</p>';
        document.getElementById('cartTotal').innerText = '₹0.00';
        return;
    }
    let total = 0;
    itemsList.innerHTML = '';
    cart.forEach((item, i) => {
        total += item.price;
        itemsList.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center;
                        margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:1rem;">
                <div>
                    <div style="font-weight:600; font-size:0.9rem">${item.title}</div>
                    <div style="font-size:0.75rem; color:var(--gray)">${item.category}</div>
                </div>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="color:var(--gold); font-weight:700; font-size:0.95rem">₹${item.price.toFixed(2)}</span>
                    <button onclick="removeFromCart(${i})"
                        style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; transition:opacity 0.2s"
                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"
                        style="opacity:0.7">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>`;
    });

    let subtotalHtml = '';
    if (activeCoupon) {
        const disc = total * (activeCoupon.discount / 100);
        total -= disc;
        subtotalHtml = `<div style="color:var(--green); font-size:0.85rem; margin-bottom:0.5rem">Discount: -₹${disc.toFixed(2)}</div>`;
    }

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) {
        totalEl.parentElement.insertAdjacentHTML('beforebegin', subtotalHtml);
        totalEl.innerText = '₹' + total.toFixed(2);
    }
}

/* ===== TOAST ===== */
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}
