document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cloneForm');
    const cloneBtn = document.getElementById('cloneBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultMessage = document.getElementById('resultMessage');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            url: formData.get('url')
        };

        // Validação básica
        if (!data.name.trim() || !data.url.trim()) {
            showResult('error', 'Por favor, preencha todos os campos.');
            return;
        }

        // Validação de URL
        try {
            new URL(data.url);
        } catch {
            showResult('error', 'Por favor, insira uma URL válida.');
            return;
        }

        // Mostrar loading
        setLoading(true);
        hideResult();

        try {
            const response = await fetch('/api/clone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showResult('success', result.message);
                if (result.html) {
                    // Para Vercel, criamos um blob URL para visualizar o HTML
                    const blob = new Blob([result.html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    downloadLink.innerHTML = `
                        <a href="${url}" target="_blank">
                            📁 Visualizar Site Clonado
                        </a>
                    `;
                }
            } else {
                showResult('error', result.error || 'Erro ao clonar o site.');
            }
        } catch (error) {
            console.error('Erro:', error);
            showResult('error', 'Erro de conexão. Tente novamente.');
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
        downloadLink.innerHTML = '';
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
});

