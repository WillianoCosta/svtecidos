document.addEventListener('DOMContentLoaded', () => {
    // #############################################################
    // COLE A URL DO SEU APP SCRIPT AQUI
    // #############################################################
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnK8Mt2eIDv3BRTFiP8uUptTuWIXs7WYTy7ro85vmd_PC8vrbaWwJ5wWljTspTJU16/exec';

    // #############################################################
    // COLOQUE O NÚMERO DE WHATSAPP DO SEU PRIMO AQUI (COM CÓDIGO DO PAÍS)
    // #############################################################
    const WHATSAPP_NUMBER = '5584996106961'; // Exemplo: 55 para Brasil, 11 para DDD, etc.


    const productList = document.getElementById('product-list');
    const loadingMessage = document.getElementById('loading-message');
    const cartItemsContainer = document.getElementById('cart-items');
    const whatsappButton = document.getElementById('whatsapp-button');

    let cart = {}; // { productId: quantity, ... }

    // Busca os produtos do backend (App Script)
    async function fetchProducts() {
        try {
            const response = await fetch(`${APP_SCRIPT_URL}?action=getProducts`);
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar produtos.');
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            loadingMessage.textContent = 'Não foi possível carregar os produtos. Tente novamente mais tarde.';
        }
    }

    // Mostra os produtos na página
    function displayProducts(products) {
        loadingMessage.style.display = 'none';
        productList.innerHTML = ''; // Limpa a lista
        if (products.length === 0) {
            productList.innerHTML = '<p>Nenhum produto disponível no momento.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.fotoUrl}" alt="${product.nome}">
                <div class="product-info">
                    <h3>${product.nome}</h3>
                    <p>${product.descricao}</p>
                    <p class="product-price">R$ ${parseFloat(product.valor).toFixed(2).replace('.', ',')}</p>
                    <div class="product-actions">
                        <input type="number" id="qty-${product.id}" value="1" min="1">
                        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.nome}" data-price="${product.valor}">Adicionar</button>
                    </div>
                </div>
            `;
            productList.appendChild(card);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    // Adiciona um item ao carrinho
    function handleAddToCart(event) {
        const button = event.target;
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const quantityInput = document.getElementById(`qty-${id}`);
        const quantity = parseInt(quantityInput.value, 10);

        if (quantity > 0) {
            if (cart[id]) {
                cart[id].quantity += quantity;
            } else {
                cart[id] = { name, quantity, price };
            }
            updateCartDisplay();
            alert(`${quantity}x ${name} adicionado(s) ao orçamento!`);
        }
    }
    
    // Atualiza a exibição do carrinho
    function updateCartDisplay() {
        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho de orçamento está vazio.</p>';
            whatsappButton.disabled = true;
        } else {
            cartItemsContainer.innerHTML = '';
            let total = 0;
            for (const id in cart) {
                const item = cart[id];
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span>${item.quantity}x ${item.name}</span>
                    <button class="remove-from-cart-btn" data-id="${id}">🗑️</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.quantity * item.price;
            }
            whatsappButton.disabled = false;
        }
        
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
           button.addEventListener('click', (e) => {
               const idToRemove = e.target.dataset.id;
               delete cart[idToRemove];
               updateCartDisplay();
           })
        });
    }

    // Gera a mensagem e abre o WhatsApp
    whatsappButton.addEventListener('click', () => {
        let message = `Olá! Gostaria de solicitar um orçamento para os seguintes tecidos:\n\n`;
        let totalValue = 0;

        for (const id in cart) {
            const item = cart[id];
            message += `*Produto:* ${item.name}\n`;
            message += `*Quantidade:* ${item.quantity}\n`;
            message += `------------------------\n`;
            totalValue += item.quantity * item.price;
        }

        message += `\n*Valor Total Estimado:* R$ ${totalValue.toFixed(2).replace('.', ',')}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    });


    // Inicia a aplicação
    fetchProducts();
});
