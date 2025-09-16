document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('discordCloneForm');
    const cloneBtn = document.getElementById('discordCloneBtn');
    const resultContainer = document.getElementById('discordResultContainer');
    const resultMessage = document.getElementById('discordResultMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            token: formData.get('token'),
            originalServerId: formData.get('originalServerId'),
            targetServerId: formData.get('targetServerId')
        };

        // Validação básica
        if (!data.token.trim() || !data.originalServerId.trim() || !data.targetServerId.trim()) {
            showResult('error', 'Por favor, preencha todos os campos.');
            return;
        }

        // Validação de IDs (devem ser números)
        if (!/^\d+$/.test(data.originalServerId) || !/^\d+$/.test(data.targetServerId)) {
            showResult('error', 'Os IDs dos servidores devem conter apenas números.');
            return;
        }

        if (data.originalServerId === data.targetServerId) {
            showResult('error', 'O servidor original e destino não podem ser o mesmo.');
            return;
        }

        // Mostrar loading
        setLoading(true);
        hideResult();

        try {
            const response = await fetch('/api/clone-discord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showResult('success', result.message || 'Servidor clonado com sucesso!');
                form.reset(); // Limpar o formulário após sucesso
            } else {
                showResult('error', result.error || 'Erro ao clonar o servidor.');
            }
        } catch (error) {
            console.error('Erro:', error);
            showResult('error', 'Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        if (loading) {
            cloneBtn.classList.add('loading');
            cloneBtn.disabled = true;
        } else {
            cloneBtn.classList.remove('loading');
            cloneBtn.disabled = false;
        }
    }

    function showResult(type, message) {
        resultContainer.className = `result-container ${type}`;
        resultMessage.textContent = message;
        resultContainer.style.display = 'block';
        
        // Scroll suave para o resultado
        resultContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    function hideResult() {
        resultContainer.style.display = 'none';
    }

    // Adicionar efeitos visuais aos inputs
    const inputs = document.querySelectorAll('.input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Adicionar validação em tempo real para IDs
    const serverIdInputs = document.querySelectorAll('#originalServer, #targetServer');
    serverIdInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value;
            if (value && !/^\d+$/.test(value)) {
                this.style.borderColor = '#ff6b6b';
                this.style.background = '#fff5f5';
            } else {
                this.style.borderColor = '#e1e5e9';
                this.style.background = '#f8f9fa';
            }
        });
    });

    // Adicionar tooltip para o campo de token
    const tokenInput = document.getElementById('userToken');
    tokenInput.addEventListener('focus', function() {
        if (!this.value) {
            showTooltip(this, 'Seu token é privado e será usado apenas para esta operação');
        }
    });

    function showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            z-index: 1000;
            max-width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
        
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
});

