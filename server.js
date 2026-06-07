/**
 * JARVIS IRON MAN SYSTEM - Backend Server
 * Integração: Claude API + ElevenLabs TTS + AWS Lambda + Alexa
 * Desenvolvido para: Oficial de Polícia Civil - PCERJ
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// ============================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'jarvis-custom';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Validar variáveis de ambiente
if (!CLAUDE_API_KEY) {
  console.error('❌ ERRO: CLAUDE_API_KEY não configurada no arquivo .env');
  process.exit(1);
}

if (!ELEVENLABS_API_KEY) {
  console.warn('⚠️ AVISO: ELEVENLABS_API_KEY não configurada. TTS desativado.');
}

// ============================================
// LOGGER
// ============================================

const logger = {
  info: (msg, data = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data),
  error: (msg, error = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error),
  warn: (msg, data = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data),
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Chamar Claude API
 */
async function callClaudeAPI(userMessage, conversationHistory = []) {
  try {
    logger.info('Chamando Claude API...');

    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: process.env.CLAUDE_MODEL || 'claude-opus-4-6',
        max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS || 1024),
        system: `Você é JARVIS, o assistente de IA do Homem de Ferro. 
Você é sofisticado, cordial, com um sotaque inglês elegante, e sempre pronto para ajudar.
Responda de forma concisa e profissional. Quando fornecendo respostas técnicas, seja claro e detalhado.
Você está auxiliando um Oficial de Polícia Civil em investigações - trate isso com a seriedade apropriada.`,
        messages: messages
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const claudeResponse = response.data.content[0].text;
    logger.info('Resposta Claude recebida', `${claudeResponse.substring(0, 100)}...`);

    return {
      success: true,
      text: claudeResponse,
      tokens: {
        input: response.data.usage.input_tokens,
        output: response.data.usage.output_tokens
      }
    };
  } catch (error) {
    logger.error('Erro ao chamar Claude API', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      text: 'Desculpe, tive um problema ao processar sua solicitação.'
    };
  }
}

/**
 * Converter texto para fala usando ElevenLabs
 */
async function convertTextToSpeech(text) {
  if (!ELEVENLABS_API_KEY) {
    logger.warn('ElevenLabs não configurado. Retornando vazio.');
    return { success: false, error: 'ElevenLabs não configurado' };
  }

  try {
    logger.info('Convertendo texto para fala...');

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.9
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'content-type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBase64 = Buffer.from(response.data).toString('base64');
    logger.info('Áudio gerado com sucesso');

    return {
      success: true,
      audio: audioBase64,
      mimeType: 'audio/mpeg'
    };
  } catch (error) {
    logger.error('Erro ao converter texto para fala', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// ROTAS API
// ============================================

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    claude: CLAUDE_API_KEY ? '✓' : '✗',
    elevenlabs: ELEVENLABS_API_KEY ? '✓' : '✗'
  });
});

/**
 * Processar input de voz (da Alexa ou navegador)
 * POST /api/process-voice
 */
app.post('/api/process-voice', async (req, res) => {
  const sessionId = uuidv4();
  const startTime = Date.now();

  try {
    const { transcription, conversationHistory = [], enableAudio = true } = req.body;

    if (!transcription) {
      return res.status(400).json({
        success: false,
        error: 'Transcrição não fornecida'
      });
    }

    logger.info(`[${sessionId}] Processando: ${transcription.substring(0, 50)}...`);

    // 1. Chamar Claude
    const claudeResult = await callClaudeAPI(transcription, conversationHistory);

    if (!claudeResult.success) {
      return res.status(500).json(claudeResult);
    }

    const responseText = claudeResult.text;
    let audioData = null;

    // 2. Converter para fala (se habilitado)
    if (enableAudio && ELEVENLABS_API_KEY) {
      const ttsResult = await convertTextToSpeech(responseText);
      if (ttsResult.success) {
        audioData = ttsResult.audio;
      }
    }

    // 3. Preparar nova mensagem de conversa
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: transcription },
      { role: 'assistant', content: responseText }
    ];

    const processingTime = Date.now() - startTime;

    logger.info(`[${sessionId}] Processamento concluído em ${processingTime}ms`);

    // 4. Retornar resposta completa
    res.json({
      success: true,
      sessionId,
      response: {
        text: responseText,
        audio: audioData,
        mimeType: audioData ? 'audio/mpeg' : null
      },
      conversationHistory: newHistory,
      metrics: {
        processingTimeMs: processingTime,
        tokensUsed: claudeResult.tokens
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`[${sessionId}] Erro não tratado`, error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      sessionId
    });
  }
});

/**
 * Rota para testar texto para fala
 * POST /api/tts-test
 */
app.post('/api/tts-test', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Texto não fornecido' });
    }

    const result = await convertTextToSpeech(text);
    res.json(result);
  } catch (error) {
    logger.error('Erro em /api/tts-test', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Rota para testar Claude
 * POST /api/claude-test
 */
app.post('/api/claude-test', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Mensagem não fornecida' });
    }

    const result = await callClaudeAPI(message);
    res.json(result);
  } catch (error) {
    logger.error('Erro em /api/claude-test', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Rota para processar comando de investigação (exemplo)
 * POST /api/investigation-query
 */
app.post('/api/investigation-query', async (req, res) => {
  try {
    const { query, caseNumber, evidenceType } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query não fornecida' });
    }

    const systemPrompt = `Você é um assistente de investigação policial especializado em análise de dados.
Caso: ${caseNumber || 'N/A'}
Tipo de Evidência: ${evidenceType || 'N/A'}
Forneça análises técnicas e recomendações baseadas em melhores práticas.`;

    const result = await callClaudeAPI(query, []);
    res.json(result);
  } catch (error) {
    logger.error('Erro em /api/investigation-query', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Servir interface estática
 */
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((err, req, res, next) => {
  logger.error('Erro não capturado', err.message);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// INICIALIZAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  logger.info(`🚀 Servidor Jarvis iniciado na porta ${PORT}`);
  logger.info(`🔗 URL: http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
});
