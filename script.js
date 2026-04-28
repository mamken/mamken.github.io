let currentProduct = '';
let currentPrice = 0;
let cart = [];

// Format Rupiah
const formatRupiah = (number) => 'Rp' + number.toLocaleString('id-ID');

function openModal(productName, price) {
  currentProduct = productName;
  currentPrice = price;
  
  document.getElementById('modalProductName').innerText = productName;
  document.getElementById('quantity').value = 1;
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
  
  // Cek apakah item sudah ada di keranjang
  const existingItemIndex = cart.findIndex(item => item.product === currentProduct);
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
  
  const waNumber = '6281515785838'; // Nomor WhatsApp dari footer
  let message = `Halo MamKen, saya ingin memesan:\n\n`;
  let grandTotal = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    message += `${index + 1}. ${item.product}\n   ${item.qty} pcs x ${formatRupiah(item.price)} = ${formatRupiah(itemTotal)}\n`;
  });
  
  message += `\n*Total Keseluruhan: ${formatRupiah(grandTotal)}*\n\nApakah pesanan saya bisa dikirim sekarang?`;
  
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  
  // Kosongkan keranjang setelah diarahkan
  cart = [];
  updateCartUI();
  closeCart();
  
  window.open(waLink, '_blank');
}

function sendToWhatsApp() {
  // Ini untuk tombol Beli Langsung (Bypass Cart)
  const qty = document.getElementById('quantity').value;
  if (qty < 1) {
    alert('Jumlah pesanan minimal 1');
    return;
  }
  
  const total = qty * currentPrice;
  const waNumber = '6281515785838'; 
  
  const message = `Halo MamKen, saya ingin memesan:\n\nProduk: ${currentProduct}\nJumlah: ${qty} pcs\nTotal Harga: ${formatRupiah(total)}\n\nApakah bisa dikirim sekarang?`;
  
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(waLink, '_blank');
  closeModal();
}

// Menutup modal jika user mengklik di luar box putih (modal content)
window.onclick = function(event) {
  const orderModal = document.getElementById('orderModal');
  const cartModal = document.getElementById('cartModal');
  if (event.target === orderModal) {
    closeModal();
  }
  if (event.target === cartModal) {
    closeCart();
  }
}
