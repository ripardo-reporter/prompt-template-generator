/**
 * Advanced Features for Prompt Template Generator
 * Funcionalidades avançadas para integração futura com APIs de IA
 */

class AdvancedPromptGenerator {
    constructor() {
        this.apiKeys = {
            openai: localStorage.getItem('openai_api_key') || '',
            claude: localStorage.getItem('claude_api_key') || ''
        };
        this.history = JSON.parse(localStorage.getItem('generation_history') || '[]');
        this.templates = this.loadCustomTemplates();
        this.initializeAdvancedFeatures();
    }

    initializeAdvancedFeatures() {
        this.setupAPIKeyModal();
        this.setupHistoryPanel();
        this.setupTemplateLibrary();
        this.setupExportFeatures();
        this.setupAutoSave();
    }

    // API Integration Methods
    async generateWithOpenAI(prompt, options = {}) {
        if (!this.apiKeys.openai) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKeys.openai}`
            },
            body: JSON.stringify({
                model: options.model || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um especialista em redação jornalística e corporativa.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 3000,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async generateWithClaude(prompt, options = {}) {
        if (!this.apiKeys.claude) {
            throw new Error('Claude API key not configured');
        }

        // Implementação para API do Claude
        // Esta é uma estrutura de exemplo - ajuste conforme a API real
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKeys.claude,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: options.model || 'claude-3-sonnet-20240229',
                max_tokens: options.maxTokens || 3000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    // Template Library Management
    loadCustomTemplates() {
        const stored = localStorage.getItem('custom_templates');
        const defaultTemplates = {
            'press_release': {
                name: 'Press Release',
                icon: 'fas fa-bullhorn',
                description: 'Comunicado à imprensa profissional',
                prompt: 'Escreva um press release profissional sobre {{topic}} em {{paragraphs}} parágrafos. Use linguagem formal e inclua informações sobre {{context}}.'
            },
            'relatorio_executivo': {
                name: 'Relatório Executivo',
                icon: 'fas fa-file-invoice',
                description: 'Relatório para alta gestão',
                prompt: 'Crie um relatório executivo sobre {{topic}} em {{paragraphs}} seções. Foque em insights estratégicos e recomendações baseadas em {{context}}.'
            },
            'newsletter': {
                name: 'Newsletter',
                icon: 'fas fa-envelope',
                description: 'Boletim informativo',
                prompt: 'Escreva uma newsletter sobre {{topic}} em {{paragraphs}} seções. Use tom informativo e envolvente para {{audience}}. Contexto: {{context}}.'
            }
        };

        return stored ? { ...defaultTemplates, ...JSON.parse(stored) } : defaultTemplates;
    }

    saveCustomTemplate(id, template) {
        this.templates[id] = template;
        const customTemplates = {};
        Object.keys(this.templates).forEach(key => {
            if (!['jornalistico', 'linkedin', 'analise'].includes(key)) {
                customTemplates[key] = this.templates[key];
            }
        });
        localStorage.setItem('custom_templates', JSON.stringify(customTemplates));
    }

    // History Management
    saveToHistory(prompt, result, template, timestamp = Date.now()) {
        const entry = {
            id: timestamp,
            prompt,
            result,
            template,
            timestamp,
            wordCount: result.split(/\s+/).length
        };

        this.history.unshift(entry);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('generation_history', JSON.stringify(this.history));
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) return;

        historyContainer.innerHTML = '';
        this.history.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-template">${entry.template}</span>
                    <span class="history-date">${new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="history-prompt">${entry.prompt.substring(0, 100)}...</div>
                <div class="history-actions">
                    <button onclick="advancedGenerator.loadFromHistory('${entry.id}')" class="btn-small">
                        <i class="fas fa-redo"></i> Usar Novamente
                    </button>
                    <button onclick="advancedGenerator.deleteFromHistory('${entry.id}')" class="btn-small btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            historyContainer.appendChild(historyItem);
        });
    }

    loadFromHistory(id) {
        const entry = this.history.find(h => h.id == id);
        if (entry) {
            // Recarregar os campos do formulário com os dados do histórico
            // Implementar lógica para preencher campos
            console.log('Loading from history:', entry);
        }
    }

    deleteFromHistory(id) {
        this.history = this.history.filter(h => h.id != id);
        localStorage.setItem('generation_history', JSON.stringify(this.history));
        this.updateHistoryPanel();
    }

    // Export Features
    exportToPDF(content, title = 'Generated Text') {
        // Usando jsPDF para exportar PDF
        if (typeof window.jsPDF !== 'undefined') {
            const doc = new window.jsPDF();
            const splitText = doc.splitTextToSize(content, 180);
            
            doc.setFontSize(16);
            doc.text(title, 20, 20);
            doc.setFontSize(12);
            doc.text(splitText, 20, 40);
            
            doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
        } else {
            alert('PDF export não disponível. Instale a biblioteca jsPDF.');
        }
    }

    exportToWord(content, title = 'Generated Text') {
        // Criar documento Word usando HTML
        const html = `
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>${title}</title>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div style="line-height: 1.6; font-family: Arial, sans-serif;">
                        ${content.replace(/\n/g, '<br>')}
                    </div>
                </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportToJSON() {
        const data = {
            templates: this.templates,
            history: this.history,
            exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt_generator_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.templates) {
                    Object.assign(this.templates, data.templates);
                    localStorage.setItem('custom_templates', JSON.stringify(data.templates));
                }
                
                if (data.history) {
                    this.history = [...data.history, ...this.history];
                    this.history = this.history.slice(0, 50); // Manter apenas 50 entradas
                    localStorage.setItem('generation_history', JSON.stringify(this.history));
                }
                
                alert('Dados importados com sucesso!');
                this.updateHistoryPanel();
            } catch (error) {
                alert('Erro ao importar arquivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Auto-save functionality
    setupAutoSave() {
        const inputs = ['topic', 'context', 'quotes', 'audience'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.autoSave();
                });
            }
        });
    }

    autoSave() {
        const formData = {
            topic: document.getElementById('topic')?.value || '',
            context: document.getElementById('context')?.value || '',
            quotes: document.getElementById('quotes')?.value || '',
            audience: document.getElementById('audience')?.value || '',
            selectedTemplate: app?.selectedTemplate || '',
            paragraphCount: app?.paragraphCount || 20,
            timestamp: Date.now()
        };

        localStorage.setItem('autosave_form', JSON.stringify(formData));
    }

    loadAutoSave() {
        const saved = localStorage.getItem('autosave_form');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Verificar se o autosave não é muito antigo (mais de 24 horas)
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                if (confirm('Foram encontrados dados salvos automaticamente. Deseja restaurá-los?')) {
                    document.getElementById('topic').value = data.topic;
                    document.getElementById('context').value = data.context;
                    document.getElementById('quotes').value = data.quotes;
                    document.getElementById('audience').value = data.audience;
                    
                    if (app) {
                        app.selectedTemplate = data.selectedTemplate;
                        app.paragraphCount = data.paragraphCount;
                        document.getElementById('paragraphCount').textContent = data.paragraphCount;
                        
                        // Selecionar template visualmente
                        document.querySelectorAll('.template-card').forEach(card => {
                            card.classList.remove('selected');
                            if (card.dataset.template === data.selectedTemplate) {
                                card.classList.add('selected');
                            }
                        });
                    }
                }
            }
        }
    }

    // API Key Management
    setupAPIKeyModal() {
        const modal = document.createElement('div');
        modal.id = 'apiKeyModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Configurar APIs de IA</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="openaiKey">OpenAI API Key:</label>
                        <input type="password" id="openaiKey" placeholder="sk-...">
                    </div>
                    <div class="form-group">
                        <label for="claudeKey">Claude API Key:</label>
                        <input type="password" id="claudeKey" placeholder="claude-...">
                    </div>
                    <p class="api-note">
                        <i class="fas fa-info-circle"></i>
                        As chaves são armazenadas localmente no seu navegador e nunca enviadas para nossos servidores.
                    </p>
                </div>
                <div class="modal-footer">
                    <button id="saveApiKeys" class="btn-primary">Salvar</button>
                    <button class="close-modal btn-secondary">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para o modal
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.style.display = 'none');
        });

        document.getElementById('saveApiKeys').addEventListener('click', () => {
            this.apiKeys.openai = document.getElementById('openaiKey').value;
            this.apiKeys.claude = document.getElementById('claudeKey').value;
            
            localStorage.setItem('openai_api_key', this.apiKeys.openai);
            localStorage.setItem('claude_api_key', this.apiKeys.claude);
            
            alert('Chaves API salvas com sucesso!');
            modal.style.display = 'none';
        });
    }

    // Setup other advanced features
    setupHistoryPanel() {
        // Implementar painel de histórico
    }

    setupTemplateLibrary() {
        // Implementar biblioteca de templates
    }

    setupExportFeatures() {
        // Implementar funcionalidades de exportação
    }

    // Utility Methods
    analyzeText(text) {
        const words = text.split(/\s+/).length;
        const chars = text.length;
        const sentences = text.split(/[.!?]+/).length - 1;
        const paragraphs = text.split(/\n\s*\n/).length;
        
        return {
            words,
            characters: chars,
            sentences,
            paragraphs,
            readingTime: Math.ceil(words / 200) // Assumindo 200 palavras por minuto
        };
    }

    formatText(text, format) {
        switch (format) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'title':
                return text.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
            case 'sentence':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            default:
                return text;
        }
    }

    validatePrompt(prompt) {
        const issues = [];
        
        if (prompt.length < 10) {
            issues.push('Prompt muito curto - adicione mais detalhes');
        }
        
        if (prompt.length > 2000) {
            issues.push('Prompt muito longo - considere simplificar');
        }
        
        if (!/[.!?]$/.test(prompt.trim())) {
            issues.push('Considere adicionar pontuação final');
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }
}

// Initialize advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.advancedGenerator = new AdvancedPromptGenerator();
    
    // Load autosave after a short delay
    setTimeout(() => {
        window.advancedGenerator.loadAutoSave();
    }, 1000);
});
