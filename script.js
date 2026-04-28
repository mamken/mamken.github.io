let currentProduct = '';
let currentPrice = 0;
let cart = [];

const stocks = {
  'Risol Mayo': 20,
  'Risol Matcha': 15,
  'Risol Coklat': 10,
  'Risol Cookie and Cream': 12
};

// Format Rupiah
const formatRupiah = (number) => 'Rp' + number.toLocaleString('id-ID');

function openModal(productName, price) {
  currentProduct = productName;
  currentPrice = price;

  document.getElementById('modalProductName').innerText = productName;

  const quantityInput = document.getElementById('quantity');
  quantityInput.value = 1;

  // Set max quantity based on stock and current cart
  const inCart = cart.find(item => item.product === productName)?.qty || 0;
  const available = stocks[productName] - inCart;
  quantityInput.max = available;
  document.getElementById('stockInfo').innerText = `Tersedia: ${available} pcs`;

  if (available <= 0) {
    quantityInput.value = 0;
    quantityInput.disabled = true;
    document.querySelector('.add-cart-btn').disabled = true;
    document.querySelector('.add-cart-btn').innerText = 'Stok Habis';
  } else {
    quantityInput.disabled = false;
    document.querySelector('.add-cart-btn').disabled = false;
    document.querySelector('.add-cart-btn').innerText = '+ Keranjang';
  }

  updateTotal();

  document.getElementById('orderModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('orderModal').style.display = 'none';
}

function updateTotal() {
  const qty = document.getElementById('quantity').value;
  const total = qty * currentPrice;
  document.getElementById('modalTotalPrice').innerText = formatRupiah(total);
}

function addToCart() {
  const qty = parseInt(document.getElementById('quantity').value);
  if (qty < 1) {
    alert('Jumlah pesanan minimal 1');
    return;
  }

  const existingItemIndex = cart.findIndex(item => item.product === currentProduct);
  const inCart = existingItemIndex > -1 ? cart[existingItemIndex].qty : 0;

  if (inCart + qty > stocks[currentProduct]) {
    alert(`Maaf, stok tidak mencukupi. Stok tersedia: ${stocks[currentProduct]}, di keranjang Anda: ${inCart}`);
    return;
  }
  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += qty;
  } else {
    cart.push({ product: currentProduct, price: currentPrice, qty: qty });
  }

  updateCartUI();
  closeModal();

  // Optional alert
  alert(`${qty} ${currentProduct} berhasil ditambahkan ke keranjang!`);
}

function updateCartUI() {
  // Update cart count badge
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').innerText = totalItems;

  // Update cart modal content
  const cartList = document.getElementById('cartItemsList');
  cartList.innerHTML = '';

  let grandTotal = 0;

  if (cart.length === 0) {
    cartList.innerHTML = '<p style="text-align:center; color:#777; margin: 20px 0;">Keranjang Anda masih kosong</p>';
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      grandTotal += itemTotal;

      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item';
      cartItemDiv.innerHTML = `
        <div class="cart-item-info">
          <strong>${item.product}</strong>
          <div>${item.qty} pcs x ${formatRupiah(item.price)}</div>
        </div>
        <div class="cart-item-action">
          <div style="font-weight:bold; color:#ff7a00;">${formatRupiah(itemTotal)}</div>
          <button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button>
        </div>
      `;
      cartList.appendChild(cartItemDiv);
    });
  }

  document.getElementById('cartGrandTotal').innerText = formatRupiah(grandTotal);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function openCart() {
  updateCartUI();
  document.getElementById('cartModal').style.display = 'block';
}

function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
}

function checkoutCart() {
  if (cart.length === 0) {
    alert('Keranjang Anda kosong!');
    return;
  }

  const customerName = document.getElementById('customerName').value.trim();
  const customerClass = document.getElementById('customerClass').value.trim();

  if (!customerName || !customerClass) {
    alert('Mohon isi Nama dan Kelas Anda sebelum checkout.');
    return;
  }

  const waNumber = '6281515785838'; // Nomor WhatsApp dari footer
  let message = `Halo MamKen, saya ingin memesan:\n\nNama: ${customerName}\nKelas: ${customerClass}\n\nPesanan:\n`;
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    message += `${index + 1}. ${item.product}\n   ${item.qty} pcs x ${formatRupiah(item.price)} = ${formatRupiah(itemTotal)}\n`;
  });

  message += `\n*Total Keseluruhan: ${formatRupiah(grandTotal)}*\n\n`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  // Kosongkan keranjang setelah diarahkan
  cart = [];
  document.getElementById('customerName').value = '';
  document.getElementById('customerClass').value = '';
  updateCartUI();
  closeCart();

  window.open(waLink, '_blank');
}


// Menutup modal jika user mengklik di luar box putih (modal content)
window.onclick = function (event) {
  const orderModal = document.getElementById('orderModal');
  const cartModal = document.getElementById('cartModal');
  if (event.target === orderModal) {
    closeModal();
  }
  if (event.target === cartModal) {
    closeCart();
  }
}

// --- Fitur Penghitung Pengunjung ---

function updateVisitorStats() {
  // 1. Kunjungan Pribadi (localStorage)
  let visits = localStorage.getItem('mamken_visits') || 0;
  visits = parseInt(visits) + 1;
  localStorage.setItem('mamken_visits', visits);
  document.getElementById('yourVisits').innerText = visits.toLocaleString('id-ID');

  // 2. Total Pengunjung Global (CounterAPI.dev)
  // Ganti 'mamken_visitor_counter' dengan namespace unik jika perlu
  const namespace = 'mamken_site';
  const key = 'visits';

  fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
    .then(response => response.json())
    .then(data => {
      if (data && data.count) {
        document.getElementById('totalVisitors').innerText = data.count.toLocaleString('id-ID');
      } else {
        document.getElementById('totalVisitors').innerText = '1,248+'; // Fallback jika API bermasalah
      }
    })
    .catch(err => {
      console.error('Gagal mengambil data pengunjung:', err);
      document.getElementById('totalVisitors').innerText = '1,248+'; // Fallback
    });
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  updateVisitorStats();
  updateCartUI(); // Pastikan UI keranjang sinkron saat muat halaman
});
