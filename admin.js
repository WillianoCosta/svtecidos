document.addEventListener('DOMContentLoaded', () => {
    // #############################################################
    // COLE A URL DO SEU APP SCRIPT AQUI (A MESMA DO OUTRO ARQUIVO)
    // #############################################################
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZIZQ7srWVa9JoNvnkHcZ80dxpcPRHztermDFjiHlWq_AHDK2i3KsUi9sy8mLgYaGUNA/exec';

    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const tableBody = document.getElementById('product-table-body');
    const loadingMessage = document.getElementById('admin-loading');
    const productIdInput = document.getElementById('productId');
    const cancelButton = document.getElementById('cancel-button');
    
    let productsCache = [];

    // Busca todos os produtos para o painel
    async function fetchAllProducts() {
        loadingMessage.style.display = 'block';
        try {
            const response = await fetch(`${APP_SCRIPT_URL}?action=getAllProducts`);
            productsCache = await response.json();
            displayProductsInTable(productsCache);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            loadingMessage.textContent = 'Erro ao carregar produtos.';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    // Mostra os produtos na tabela
    function displayProductsInTable(products) {
        tableBody.innerHTML = '';
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        products.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.valor).toFixed(2).replace('.', ',')}</td>
                <td><span class="status-${p.status.toLowerCase()}">${p.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" data-id="${p.id}">Editar</button>
                    <button class="action-btn ${p.status === 'Ativo' ? 'toggle-btn-ativo' : 'toggle-btn-inativo'}" data-id="${p.id}">
                        ${p.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        addTableButtonListeners();
    }
    
    // Adiciona os listeners para os botões da tabela
    function addTableButtonListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.toggle-btn-ativo, .toggle-btn-inativo').forEach(btn => btn.addEventListener('click', handleToggleStatus));
    }

    // Preenche o formulário para edição
    function handleEdit(e) {
        const id = e.target.dataset.id;
        const product = productsCache.find(p => p.id == id);
        
        formTitle.textContent = 'Editar Produto';
        productIdInput.value = product.id;
        document.getElementById('nome').value = product.nome;
        document.getElementById('descricao').value = product.descricao;
        document.getElementById('fotoUrl').value = product.fotoUrl;
        document.getElementById('valor').value = product.valor;
        cancelButton.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }
    
    // Altera o status (Ativo/Inativo)
    async function handleToggleStatus(e) {
        const id = e.target.dataset.id;
        if (!confirm('Tem certeza que deseja alterar o status deste produto?')) return;
        
        try {
            const response = await fetch(APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteProduct', payload: { id } })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('Status alterado com sucesso!');
                fetchAllProducts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Falha ao alterar o status do produto.');
        }
    }

    // Submete o formulário (Adicionar ou Editar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productIdInput.value;
        const isEditing = !!id;

        const payload = {
            id: id,
            nome: document.getElementById('nome').value,
            descricao: document.getElementById('descricao').value,
            fotoUrl: document.getElementById('fotoUrl').value,
            valor: document.getElementById('valor').value,
            status: isEditing ? productsCache.find(p => p.id == id).status : 'Ativo'
        };

        const action = isEditing ? 'editProduct' : 'addProduct';
        
        try {
            const response = await fetch(APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert(`Produto ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
                resetForm();
                fetchAllProducts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Falha ao salvar o produto.');
        }
    });

    // Limpa o formulário
    function resetForm() {
        form.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Produto';
        cancelButton.style.display = 'none';
    }

    cancelButton.addEventListener('click', resetForm);
    
    fetchAllProducts();
});
