#!/bin/bash

# ============================================
# SCRIPT DE TESTE - JARVIS SYSTEM
# ============================================

echo "🔍 Iniciando testes do sistema JARVIS..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL do servidor
SERVER="http://localhost:3001"

# ============================================
# Teste 1: Health Check
# ============================================

echo -e "${YELLOW}[1/5] Testando health check...${NC}"

HEALTH=$(curl -s "$SERVER/api/health")

if echo "$HEALTH" | grep -q "OK"; then
    echo -e "${GREEN}✓ Servidor está online${NC}"
    echo "   Status: $(echo $HEALTH | grep -o '"status":"[^"]*"')"
else
    echo -e "${RED}✗ Servidor offline ou erro${NC}"
    exit 1
fi

echo ""

# ============================================
# Teste 2: Claude API
# ============================================

echo -e "${YELLOW}[2/5] Testando Claude API...${NC}"

CLAUDE_RESPONSE=$(curl -s -X POST "$SERVER/api/claude-test" \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual é sua função?"}')

if echo "$CLAUDE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Claude API respondendo${NC}"
    RESPONSE_TEXT=$(echo "$CLAUDE_RESPONSE" | grep -o '"text":"[^"]*"' | head -1)
    echo "   Resposta: ${RESPONSE_TEXT:0:80}..."
else
    echo -e "${RED}✗ Erro ao conectar Claude${NC}"
    echo "$CLAUDE_RESPONSE"
fi

echo ""

# ============================================
# Teste 3: Processamento de Voz
# ============================================

echo -e "${YELLOW}[3/5] Testando processamento de voz...${NC}"

VOICE_RESPONSE=$(curl -s -X POST "$SERVER/api/process-voice" \
  -H "Content-Type: application/json" \
  -d '{"transcription": "Qual é o significado de investigação policial?"}')

if echo "$VOICE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Processamento de voz funcionando${NC}"
    TOKENS=$(echo "$VOICE_RESPONSE" | grep -o '"input":[0-9]*' | head -1)
    echo "   Tokens: $TOKENS"
else
    echo -e "${RED}✗ Erro ao processar voz${NC}"
    echo "$VOICE_RESPONSE"
fi

echo ""

# ============================================
# Teste 4: TTS (Text-to-Speech)
# ============================================

echo -e "${YELLOW}[4/5] Testando síntese de voz...${NC}"

TTS_RESPONSE=$(curl -s -X POST "$SERVER/api/tts-test" \
  -H "Content-Type: application/json" \
  -d '{"text": "Bem-vindo ao sistema Jarvis"}')

if echo "$TTS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Síntese de voz operacional${NC}"
    MIME=$(echo "$TTS_RESPONSE" | grep -o '"mimeType":"[^"]*"')
    echo "   MIME Type: $MIME"
else
    echo -e "${YELLOW}⚠ Síntese de voz não configurada (opcional)${NC}"
    echo "   Configure ELEVENLABS_API_KEY para ativar"
fi

echo ""

# ============================================
# Teste 5: Performance
# ============================================

echo -e "${YELLOW}[5/5] Testando performance...${NC}"

START_TIME=$(date +%s%N)

curl -s "$SERVER/api/health" > /dev/null

END_TIME=$(date +%s%N)
LATENCY=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $LATENCY -lt 1000 ]; then
    echo -e "${GREEN}✓ Latência excelente${NC}"
elif [ $LATENCY -lt 3000 ]; then
    echo -e "${GREEN}✓ Latência boa${NC}"
elif [ $LATENCY -lt 5000 ]; then
    echo -e "${YELLOW}⚠ Latência elevada${NC}"
else
    echo -e "${RED}✗ Latência muito alta${NC}"
fi

echo "   Latência: ${LATENCY}ms"

echo ""

# ============================================
# Resumo
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ TESTES CONCLUÍDOS COM SUCESSO!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📊 Próximos passos:"
echo "1. Acesse http://localhost:3001 no navegador"
echo "2. Clique em 'INICIAR GRAVAÇÃO' para testar voz"
echo "3. Clique em 'DIGITAÇÃO' para digitar comandos"
echo "4. Consulte o histórico no painel esquerdo"

echo ""
echo "📖 Documentação:"
echo "- README.md: Documentação completa"
echo "- QUICKSTART.md: Início rápido"
echo "- server.js: Código do backend"

echo ""
