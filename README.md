# 🚀 JARVIS - Sistema de Inteligência Policial com Interface Iron Man

**Integração em tempo real**: Claude AI + Amazon Alexa + ElevenLabs TTS + Interface HUD Customizada

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Como Usar](#como-usar)
6. [Arquitetura](#arquitetura)
7. [Custos](#custos)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

JARVIS é um sistema de inteligência artificial conversacional para assistência em investigações policiais, com:

- ✅ Integração com Claude AI (API REST)
- ✅ Síntese de voz realista via ElevenLabs
- ✅ Interface HUD estilo Iron Man com efeitos visuais
- ✅ Suporte a entrada de voz via Web Speech API
- ✅ Histórico de conversação persistente
- ✅ Compatível com Amazon Alexa (via Lambda)
- ✅ Deploy em AWS Lambda, Heroku, Docker, etc.

---

## 📦 Requisitos

### Backend
- **Node.js** v16+ 
- **npm** v8+
- Chave API do **Claude** (Anthropic)
- Chave API do **ElevenLabs** (opcional, para síntese de voz)

### Frontend
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Suporte a Web Speech API (para gravação de voz)

### Sistemas Operacionais
- Windows 10+
- macOS 10.15+
- Linux (Ubuntu 18.04+)

---

## 🔧 Instalação

### Passo 1: Clonar/Baixar o projeto

```bash
git clone https://github.com/seu-usuario/jarvis-iron-man-system.git
cd jarvis-iron-man-system
```

### Passo 2: Instalar dependências

```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` com suas chaves API:

```env
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=jarvis-custom
PORT=3001
CLAUDE_MODEL=claude-opus-4-6
CLAUDE_MAX_TOKENS=1024
```

---

## ⚙️ Configuração Detalhada

### Obter Chave Claude API

1. Acesse https://console.anthropic.com
2. Crie uma conta ou faça login
3. Vá para "API Keys"
4. Gere uma nova chave
5. Copie e cole em `CLAUDE_API_KEY`

### Obter Chave ElevenLabs

1. Acesse https://elevenlabs.io
2. Crie uma conta
3. Vá para Account → API Keys
4. Copie a chave e cole em `ELEVENLABS_API_KEY`
5. Clonar voz Jarvis:
   - Vá para "Voice Lab"
   - Clique em "Add Instant Voice Clone"
   - Suba arquivo de áudio de Jarvis
   - Copie o Voice ID

### Voice ID Jarvis

Se não tiver um arquivo de áudio:
- Use um dos voice clones da comunidade
- Exemplo: `voice-ajzCXrNOXvLw4B0Y75bN` (JARVIS oficial)

---

## 🚀 Como Usar

### Iniciar o servidor

```bash
npm start
```

Seu servidor estará em: `http://localhost:3001`

### Acessar a interface

Abra seu navegador em: **http://localhost:3001**

### Usar a interface

1. **Gravação de voz**: Clique em "INICIAR GRAVAÇÃO" e fale
2. **Digitação**: Clique em "DIGITAÇÃO" e digite seu comando
3. **Histórico**: Veja o histórico de conversas no painel esquerdo
4. **Resposta**: A resposta aparece no painel direito

---

## 📐 Arquitetura

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React/Vanilla JS)           │
│       Interface HUD Iron Man (HTML/CSS)         │
│    Web Speech API para gravação de voz          │
└────────────────┬────────────────────────────────┘
                 │ HTTP REST (fetch)
┌────────────────▼────────────────────────────────┐
│        BACKEND (Node.js + Express)              │
│    • Roteamento de requisições                  │
│    • Integração Claude API                      │
│    • Integração ElevenLabs                      │
│    • Gerenciamento de histórico                 │
└────────────────┬────────────────────────────────┘
         ┌───────┴────────┬────────────┐
         ▼                ▼            ▼
    ┌─────────┐   ┌────────────┐  ┌───────────┐
    │  Claude │   │ ElevenLabs │  │   Alexa   │
    │   API   │   │    TTS     │  │  (Lambda) │
    └─────────┘   └────────────┘  └───────────┘
```

---

## 💰 Custos Mensais Estimados

### Cenário Leve (10 conversas/dia)
- Claude Sonnet: ~R$ 13
- ElevenLabs Starter: ~R$ 25
- AWS Lambda: ~R$ 5
- **TOTAL: ~R$ 43/mês**

### Cenário Médio (50 conversas/dia)
- Claude Sonnet: ~R$ 61
- ElevenLabs Creator: ~R$ 127
- AWS Lambda: ~R$ 13
- **TOTAL: ~R$ 200/mês**

### Cenário Intensivo (200 conversas/dia)
- Claude Opus: ~R$ 380
- ElevenLabs Pro: ~R$ 501
- AWS Lambda: ~R$ 76
- **TOTAL: ~R$ 957/mês**

### Economizar Custos

1. **Usar Claude Haiku** para queries simples (70% mais barato)
2. **Ativar Prompt Caching** (reduz 90% em requisições repetidas)
3. **Usar Fish.audio** em lugar de ElevenLabs (gratuito com limite)
4. **Batch Processing** (reduz custos em 50%)

---

## 🐳 Deploy com Docker

### Build

```bash
docker build -t jarvis-system .
```

### Run

```bash
docker run -e CLAUDE_API_KEY=sk-ant-xxx \
           -e ELEVENLABS_API_KEY=sk_xxx \
           -p 3001:3001 \
           jarvis-system
```

---

## 🚀 Deploy em Produção

### Heroku

```bash
# 1. Crie uma aplicação
heroku create jarvis-policia

# 2. Configure variáveis
heroku config:set CLAUDE_API_KEY=sk-ant-xxx
heroku config:set ELEVENLABS_API_KEY=sk_xxx

# 3. Deploy
git push heroku main

# 4. Abra
heroku open
```

### AWS Lambda + API Gateway

1. Crie função Lambda no painel AWS
2. Copie o código de `server.js` para handler
3. Configure variáveis de ambiente
4. Crie API Gateway e aponte para Lambda
5. Configure CORS no API Gateway

### Render.com

```bash
# 1. Conecte seu repositório GitHub
# 2. Configure Build Command: npm install
# 3. Configure Start Command: npm start
# 4. Configure variáveis de ambiente
# 5. Deploy automaticamente
```

---

## 🔍 Troubleshooting

### "Erro: CLAUDE_API_KEY não configurada"

**Solução**: Copie `.env.example` para `.env` e adicione sua chave:
```bash
cp .env.example .env
# editar .env com seu editor favorito
```

### "CORS error" ao chamar API

**Solução**: Verifique se CORS está habilitado em `server.js`:
```javascript
app.use(cors()); // deve estar presente
```

### Web Speech API não funciona

**Solução**: 
- Use navegador Chromium (Chrome, Edge)
- Firefox também suporta
- Safari tem suporte limitado

### ElevenLabs retorna erro 401

**Solução**: Verifique se a chave API está correta:
```bash
# Teste via curl
curl -H "xi-api-key: sua-chave" https://api.elevenlabs.io/v1/voices
```

### Latência alta (>3s)

**Solução**:
1. Reduza `CLAUDE_MAX_TOKENS` para 512
2. Use Claude Haiku em lugar de Opus
3. Ative Prompt Caching
4. Verifique conexão de internet

---

## 📞 Suporte e Contato

- **Issues**: GitHub Issues
- **Email**: suporte@jarvis-system.com
- **Discord**: [Link do servidor]

---

## 📄 Licença

MIT License - Veja arquivo `LICENSE`

---

## 🙏 Agradecimentos

Desenvolvido para a PCERJ (Polícia Civil do Estado do Rio de Janeiro)
Baseado em arquitetura de Claude API + ElevenLabs + Web Technologies

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2026
