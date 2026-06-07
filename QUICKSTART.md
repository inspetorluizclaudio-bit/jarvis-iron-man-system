# ⚡ QUICK START - JARVIS Sistema de IA Policial

Coloque isso em produção em **5 minutos**.

---

## 1️⃣ Obter as Chaves API

### Claude API
1. Vá para https://console.anthropic.com
2. Clique em "Create Key"
3. Copie: `sk-ant-...`

### ElevenLabs (Voz Jarvis)
1. Vá para https://elevenlabs.io
2. Crie conta gratuita
3. Vá para "Settings" → "API Keys"
4. Copie a chave

---

## 2️⃣ Clonar Voz de Jarvis

**Opção A: Usar voz pré-treinada**
```env
ELEVENLABS_VOICE_ID=voice-ajzCXrNOXvLw4B0Y75bN  # JARVIS oficial
```

**Opção B: Clonar sua voz**
1. Vá para ElevenLabs → Voice Lab
2. Clique em "Add Instant Voice Clone"
3. Suba arquivo de áudio (10+ segundos)
4. Copie o Voice ID

---

## 3️⃣ Configurar Variáveis de Ambiente

```bash
cd jarvis-iron-man-system

# Criar arquivo .env
cat > .env << EOF
CLAUDE_API_KEY=sk-ant-COLOQUE-SUA-CHAVE-AQUI
ELEVENLABS_API_KEY=COLOQUE-SUA-CHAVE-AQUI
ELEVENLABS_VOICE_ID=voice-ajzCXrNOXvLw4B0Y75bN
PORT=3001
CLAUDE_MODEL=claude-opus-4-6
CLAUDE_MAX_TOKENS=1024
EOF
```

---

## 4️⃣ Instalar Dependências

```bash
npm install
```

---

## 5️⃣ Iniciar o Servidor

```bash
npm start
```

**Saída esperada:**
```
[INFO] 🚀 Servidor Jarvis iniciado na porta 3001
[INFO] 🔗 URL: http://localhost:3001
[INFO] 📊 Health check: http://localhost:3001/api/health
```

---

## 6️⃣ Abrir Interface

Abra seu navegador em:
```
http://localhost:3001
```

**Você verá:**
- Interface HUD estilo Iron Man
- Orbe central animada com efeito de holograma
- Painéis de status e resposta
- Botões de controle (Voz, Digitação, Limpar)

---

## 🎤 Usar o Sistema

### Por Voz
1. Clique em "INICIAR GRAVAÇÃO"
2. Fale seu comando em português
3. Aguarde a resposta (som + texto)

### Por Digitação
1. Clique em "DIGITAÇÃO"
2. Digite seu comando
3. Pressione Ctrl+Enter ou clique "Enviar"

### Exemplos de Comandos

```
"Qual é a situação dos suspeitos em Gardênia Azul?"
"Faça uma análise dos registros de telecomunicação"
"Que recomendações você tem para a investigação?"
"Explique a Lei 12.850 sobre organizações criminosas"
```

---

## 📊 Monitorar Custos

Abra: `http://localhost:3001/api/health`

Você verá:
```json
{
  "status": "OK",
  "timestamp": "2026-06-05T10:30:00.000Z",
  "claude": "✓",
  "elevenlabs": "✓"
}
```

---

## 🐳 Deploy com Docker

### Opção 1: Docker Compose

```bash
# Criar arquivo .env (veja acima)

# Iniciar
docker-compose up -d

# Parar
docker-compose down
```

### Opção 2: Docker direto

```bash
docker build -t jarvis .

docker run \
  -e CLAUDE_API_KEY=sk-ant-... \
  -e ELEVENLABS_API_KEY=... \
  -p 3001:3001 \
  jarvis
```

---

## ☁️ Deploy em Produção (Heroku)

```bash
# 1. Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Criar app
heroku create jarvis-policia-seu-nome

# 4. Configurar variáveis
heroku config:set CLAUDE_API_KEY=sk-ant-...
heroku config:set ELEVENLABS_API_KEY=...

# 5. Deploy
git push heroku main

# 6. Ver logs
heroku logs --tail

# 7. Abrir
heroku open
```

**URL em produção:**
```
https://jarvis-policia-seu-nome.herokuapp.com
```

---

## 🔌 Integrar com Alexa (Avançado)

### Criar Alexa Skill

1. Vá para https://developer.amazon.com
2. Crie uma Custom Skill
3. Configure endpoint como seu servidor (HTTP ou HTTPS)
4. Configure intents:
   ```
   Intent: ProcessQuery
   Slot: query (AMAZON.AlphaNumeric)
   ```

5. Configure JSON modelo:
```json
{
  "intents": [
    {
      "name": "ProcessQuery",
      "samples": [
        "Process {query}",
        "Ask Jarvis {query}",
        "Analyze {query}"
      ],
      "slots": [
        {
          "name": "query",
          "type": "AMAZON.AlphaNumeric"
        }
      ]
    }
  ]
}
```

6. Código Lambda:
```javascript
// Chamar seu servidor:
const response = await fetch('https://seu-dominio.com/api/process-voice', {
  method: 'POST',
  body: JSON.stringify({ transcription: handlerInput.requestEnvelope.request.intent.slots.query.value })
});
```

---

## ❌ Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| `CLAUDE_API_KEY não configurada` | Edite `.env` e adicione a chave |
| `CORS error` | Use localhost (não deve acontecer) |
| `Web Speech não funciona` | Use Chrome/Edge |
| `Áudio não toca` | Verifique chave ElevenLabs |
| `Latência >5s` | Reduz CLAUDE_MAX_TOKENS para 512 |

---

## 📖 Documentação Completa

Veja `README.md` para:
- Arquitetura detalhada
- Análise de custos
- Deploy avançado
- API documentation
- Troubleshooting completo

---

## 🎓 Comandos Úteis

```bash
# Testar saúde do servidor
curl http://localhost:3001/api/health

# Testar Claude direto
curl -X POST http://localhost:3001/api/claude-test \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, qual é o seu nome?"}'

# Testar TTS/Áudio
curl -X POST http://localhost:3001/api/tts-test \
  -H "Content-Type: application/json" \
  -d '{"text": "Olá, eu sou Jarvis"}'

# Ver logs em tempo real
npm start  # mostra logs direto

# Desenvolvimento com reload automático
npm install -g nodemon
nodemon server.js
```

---

## 💡 Dicas

1. **Economizar custos**: Use Claude Haiku para queries simples
2. **Melhorar latência**: Ative Prompt Caching
3. **Melhorar qualidade de fala**: Use ElevenLabs turbo_v2
4. **Privacidade**: Rode localmente (sem cloud)
5. **Escalabilidade**: Use Docker + Kubernetes

---

## 🚀 Próximos Passos

- [ ] Configurar domínio HTTPS (para Alexa)
- [ ] Integrar banco de dados (MongoDB/PostgreSQL)
- [ ] Implementar autenticação (JWT)
- [ ] Adicionar logging persistente
- [ ] Criar dashboard de análise
- [ ] Configurar alertas por email

---

**Parabéns!** Você tem JARVIS rodando. 🎉

Dúvidas? Veja `README.md` ou abra uma issue no GitHub.

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2026
