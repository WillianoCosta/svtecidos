let cart = [];
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const whatsappButton = document.getElementById('whatsapp-button');
const addToCartMessage = document.getElementById('add-to-cart-message');

// URL do Google App Script - Reintroduzida
const appScriptURL = 'https://script.google.com/macros/s/AKfycbzzV6p90fB9r-P5e66uJ1XmNq7V2Y5K0gC5M8X7F7s7S7M/exec'; // Esta é a URL que estava no seu arquivo original

function addToCart(productName, productPrice, buttonElement) {
    const quantityInput = buttonElement.parentNode.querySelector('input[type="number"]');
    const quantity = parseInt(quantityInput.value);

    if (quantity > 0) {
        const existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: quantity });
        }
        updateCartDisplay();
        showAddToCartMessage(); // Chama a função para mostrar a mensagem
    }
}

function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    whatsappButton.disabled = cart.length === 0;
}

// Função para mostrar a mensagem animada
function showAddToCartMessage() {
    addToCartMessage.classList.add('show');
    setTimeout(() => {
        addToCartMessage.classList.remove('show');
    }, 1500); // 1.5 segundos
}

whatsappButton.addEventListener('click', () => {
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal: R$ ${cartTotalSpan.textContent}`;

    // Substitua 'SEUNUMERODOTELEFONE' pelo seu número de telefone com o código do país (ex: 5511999999999 para Brasil + DDD + número)
    const whatsappURL = `https://api.whatsapp.com/send?phone=SEUNUMERODOTELEFONE&text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    // Se a lógica do App Script for para enviar os dados do pedido para uma planilha, você pode adicioná-la aqui.
    // Exemplo (descomente e adapte se for o caso):
    /*
    fetch(appScriptURL, {
        method: 'POST',
        mode: 'no-cors', // Necessário para evitar erros de CORS com Google App Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart: cart, total: total }),
    })
    .then(response => {
        console.log('Dados do carrinho enviados para o App Script (ou tentativa)');
        // Aqui você pode adicionar alguma confirmação visual para o usuário
    })
    .catch(error => {
        console.error('Erro ao enviar dados para o App Script:', error);
        // Tratar erro, se necessário
    });
    */
});

// Inicializar o display do carrinho ao carregar a página
updateCartDisplay();
