/**
 * JARVIS IRON MAN SYSTEM - Frontend App
 * Integração com servidor backend via API REST
 */

class JarvisSystem {
    constructor() {
        // Configuração
        this.apiBaseUrl = 'http://localhost:3001';
        this.isListening = false;
        this.conversationHistory = [];
        this.totalTokens = 0;
        this.conversationCount = 0;
        this.startTime = Date.now();

        // Web Speech API
        this.recognition = null;
        this.synth = window.speechSynthesis;

        // DOM Elements
        this.hologram = document.getElementById('hologram');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.responsePanel = document.getElementById('responsePanel');
        this.chatHistory = document.getElementById('chatHistory');
        this.voiceButton = document.getElementById('voiceButton');
        this.textButton = document.getElementById('textButton');
        this.clearButton = document.getElementById('clearButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.textModal = document.getElementById('textModal');
        this.textInput = document.getElementById('textInput');
        this.sendTextButton = document.getElementById('sendTextButton');
        this.closeModalButton = document.getElementById('closeModalButton');

        // Inicializar
        this.init();
    }

    /**
     * Inicializar sistema
     */
    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.setupScanlines();
        this.checkHealth();
        this.addSystemMessage('Sistema Jarvis inicializado. Aguardando comandos...');
        this.updateMetrics();
    }

    /**
     * Configurar Web Speech API
     */
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Web Speech API não suportado neste navegador');
            this.voiceButton.disabled = true;
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceButton.classList.add('active');
            this.statusIndicator.textContent = '● GRAVANDO';
            this.statusIndicator.classList.add('active');
            this.hologram.classList.add('speaking');
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            this.responsePanel.textContent = transcript || 'Processando...';
        };

        this.recognition.onerror = (event) => {
            console.error('Erro na gravação:', event.error);
            this.addSystemMessage(`❌ Erro: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceButton.classList.remove('active');
            this.statusIndicator.textContent = '● PROCESSANDO';
        };
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        this.textButton.addEventListener('click', () => this.openTextModal());
        this.clearButton.addEventListener('click', () => this.clearConversation());
        this.sendTextButton.addEventListener('click', () => this.sendTextInput());
        this.closeModalButton.addEventListener('click', () => this.closeTextModal());
        
        // Enter para enviar no modal
        this.textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.sendTextInput();
            }
        });

        // Fechar modal ao clicar fora
        this.textModal.addEventListener('click', (e) => {
            if (e.target === this.textModal) {
                this.closeTextModal();
            }
        });
    }

    /**
     * Desenhar scanlines no canvas
     */
    setupScanlines() {
        const canvas = document.getElementById('scanlines');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        setInterval(() => {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.03)';
            for (let i = 0; i < canvas.height; i += 2) {
                ctx.fillRect(0, i, canvas.width, 1);
            }
        }, 100);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    /**
     * Verificar saúde do servidor
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);
            const data = await response.json();
            
            if (data.status === 'OK') {
                this.addSystemMessage('✓ Conexão com servidor estabelecida');
                this.statusIndicator.textContent = '● STANDBY';
            }
        } catch (error) {
            this.addSystemMessage(`⚠️ Aviso: Servidor indisponível (${error.message})`);
            this.statusIndicator.textContent = '● ERRO';
        }
    }

    /**
     * Alternar gravação de voz
     */
    toggleVoiceInput() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.responsePanel.textContent = 'Escutando...';
            this.recognition.start();
        }
    }

    /**
     * Abrir modal de digitação
     */
    openTextModal() {
        this.textModal.classList.add('active');
        this.textInput.focus();
    }

    /**
     * Fechar modal de digitação
     */
    closeTextModal() {
        this.textModal.classList.remove('active');
        this.textInput.value = '';
    }

    /**
     * Enviar entrada de texto
     */
    async sendTextInput() {
        const text = this.textInput.value.trim();
        if (!text) return;

        this.closeTextModal();
        this.addUserMessage(text);
        await this.processInput(text);
    }

    /**
     * Processar entrada (voz ou texto)
     */
    async processInput(transcription) {
        if (!transcription.trim()) return;

        this.setLoading(true);
        const startTime = Date.now();

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/process-voice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcription,
                    conversationHistory: this.conversationHistory,
                    enableAudio: true
                })
            });

            const data = await response.json();

            if (!data.success) {
                this.addSystemMessage(`❌ Erro: ${data.error}`);
                this.setLoading(false);
                return;
            }

            // Atualizar histórico
            this.conversationHistory = data.conversationHistory;
            this.totalTokens += data.metrics.tokensUsed.input + data.metrics.tokensUsed.output;
            this.conversationCount++;

            // Exibir resposta
            this.responsePanel.textContent = data.response.text;
            this.addAssistantMessage(data.response.text);

            // Reproduzir áudio
            if (data.response.audio) {
                this.playAudio(data.response.audio);
            } else {
                // Usar text-to-speech nativo se não houver áudio
                this.speakText(data.response.text);
            }

            // Atualizar status
            const latency = data.metrics.processingTimeMs;
            document.getElementById('latency').textContent = `${latency}ms`;
            document.getElementById('cognitionLevel').textContent = `${(99 + Math.random()).toFixed(1)}%`;

            // Animação da orbe
            this.animateOrbe();

        } catch (error) {
            this.addSystemMessage(`❌ Erro: ${error.message}`);
            console.error('Erro ao processar input:', error);
        } finally {
            this.setLoading(false);
            this.updateMetrics();
        }
    }

    /**
     * Reproduzir áudio
     */
    playAudio(base64Audio) {
        try {
            const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
            audio.play().catch(e => {
                console.warn('Não foi possível reproduzir áudio:', e);
                // Fallback para text-to-speech
            });
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
        }
    }

    /**
     * Usar text-to-speech nativo
     */
    speakText(text) {
        if (!this.synth) return;

        // Cancelar fala anterior
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        this.synth.speak(utterance);

        utterance.onstart = () => {
            this.hologram.classList.add('speaking');
            this.statusIndicator.textContent = '● FALANDO';
        };

        utterance.onend = () => {
            this.hologram.classList.remove('speaking');
            this.statusIndicator.textContent = '● STANDBY';
        };
    }

    /**
     * Animar orbe
     */
    animateOrbe() {
        this.hologram.style.animation = 'none';
        setTimeout(() => {
            this.hologram.style.animation = '';
        }, 10);
    }

    /**
     * Limpar conversa
     */
    clearConversation() {
        if (confirm('Deseja limpar todo o histórico de conversação?')) {
            this.conversationHistory = [];
            this.chatHistory.innerHTML = '<div class="system-message">Histórico limpo.</div>';
            this.responsePanel.textContent = 'Aguardando entrada...';
            this.addSystemMessage('Conversa reiniciada.');
        }
    }

    /**
     * Adicionar mensagem do sistema
     */
    addSystemMessage(message) {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.textContent = message;
        this.chatHistory.appendChild(div);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    /**
     * Adicionar mensagem do usuário
     */
    addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'user-message';
        div.textContent = `👤 ${text}`;
        this.chatHistory.appendChild(div);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    /**
     * Adicionar mensagem do assistente
     */
    addAssistantMessage(text) {
        const div = document.createElement('div');
        div.className = 'assistant-message';
        div.textContent = `🤖 ${text.substring(0, 100)}...`;
        this.chatHistory.appendChild(div);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    /**
     * Mostrar/ocultar indicador de carregamento
     */
    setLoading(loading) {
        if (loading) {
            this.loadingIndicator.classList.add('active');
            this.statusIndicator.textContent = '● PROCESSANDO';
        } else {
            this.loadingIndicator.classList.remove('active');
            this.statusIndicator.textContent = '● STANDBY';
        }
    }

    /**
     * Atualizar métricas
     */
    updateMetrics() {
        document.getElementById('tokensUsed').textContent = this.totalTokens.toLocaleString();
        document.getElementById('conversationCount').textContent = this.conversationCount;
        
        const secondsElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        document.getElementById('totalTime').textContent = `${minutes}m ${seconds}s`;
    }
}

/**
 * Inicializar sistema quando página carregar
 */
document.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new JarvisSystem();
});
