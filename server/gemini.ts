import { GoogleGenAI } from "@google/genai";

// Use o Gemini como alternativa gratuita ao ChatGPT
// Modelo mais recente: gemini-2.5-flash
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ItineraryPreferences {
  duration: number;
  startDate?: string;
  endDate?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize?: string;
  specialRequests?: string;
}

export async function generateItinerary(preferences: ItineraryPreferences): Promise<string> {
  try {
    const prompt = `Você é um especialista em turismo de Ubatuba, SP, Brasil. Crie um roteiro detalhado e personalizado baseado nas seguintes preferências:

**Duração:** ${preferences.duration} dias${preferences.startDate && preferences.endDate ? ` (${new Date(preferences.startDate).toLocaleDateString('pt-BR')} a ${new Date(preferences.endDate).toLocaleDateString('pt-BR')})` : ''}
**Interesses:** ${preferences.interests.join(', ')}
**Orçamento:** ${preferences.budget}
**Estilo de viagem:** ${preferences.travelStyle}
${preferences.groupSize ? `**Tamanho do grupo:** ${preferences.groupSize}` : ''}
${preferences.specialRequests ? `**Pedidos especiais:** ${preferences.specialRequests}` : ''}

**INSTRUÇÕES IMPORTANTES:**
- Responda APENAS em português brasileiro
- Crie um roteiro detalhado dia por dia
- Inclua horários sugeridos para cada atividade
- Mencione praias específicas de Ubatuba (ex: Praia do Félix, Praia Vermelha do Norte, Praia da Fortaleza)
- Inclua trilhas famosas (ex: Trilha do Pico do Corcovado, Trilha da Praia Brava)
- Sugira restaurantes locais e pratos típicos
- Inclua dicas práticas e custos aproximados
- Mencione opções de hospedagem adequadas ao orçamento
- Adicione informações sobre transporte local
- Inclua atividades aquáticas como mergulho, stand-up paddle, etc.

**ESTRUTURA DO ROTEIRO:**
# Roteiro Personalizado para Ubatuba - ${preferences.duration} dias

## Dia 1: [Título do dia]
### Manhã (8h-12h)
- **Atividade:** [descrição]
- **Local:** [endereço/região]
- **Custo aproximado:** R$ [valor]
- **Dica:** [informação útil]

### Tarde (13h-18h)
- **Atividade:** [descrição]
- **Local:** [endereço/região]
- **Custo aproximado:** R$ [valor]
- **Dica:** [informação útil]

### Noite (19h-22h)
- **Jantar:** [restaurante/tipo de comida]
- **Custo aproximado:** R$ [valor]

Continue este formato para todos os dias...

## Dicas Gerais
- [Dicas importantes sobre Ubatuba]
- [Informações sobre clima e melhor época]
- [Contatos úteis]

**IMPORTANTE:** Seja específico sobre Ubatuba, use nomes reais de praias, trilhas e estabelecimentos conhecidos da região.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o roteiro. Tente novamente.";
  } catch (error) {
    console.error("Erro ao gerar roteiro com Gemini:", error);
    throw new Error(`Erro ao gerar roteiro: ${error}`);
  }
}

export async function analyzeUserPreferences(userInput: string): Promise<ItineraryPreferences> {
  try {
    const prompt = `Analise o seguinte pedido de roteiro de viagem e extraia as preferências estruturadas:

"${userInput}"

Responda APENAS com JSON válido no seguinte formato:
{
  "duration": [número de dias, se não especificado use 3],
  "interests": [array de strings com interesses identificados],
  "budget": "[econômico/médio/alto - baseado nas pistas do texto]",
  "travelStyle": "[aventura/relaxante/cultural/família/romântico - baseado no contexto]",
  "specialRequests": "[requisições específicas mencionadas ou null]"
}

Exemplos de interesses possíveis: "praias", "trilhas", "mergulho", "culinária", "vida noturna", "história", "natureza", "aventura", "fotografia"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            duration: { type: "number" },
            interests: { type: "array", items: { type: "string" } },
            budget: { type: "string" },
            travelStyle: { type: "string" },
            specialRequests: { type: "string" }
          },
          required: ["duration", "interests", "budget", "travelStyle"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      duration: result.duration || 3,
      interests: result.interests || ["praias", "natureza"],
      budget: result.budget || "médio",
      travelStyle: result.travelStyle || "relaxante",
      specialRequests: result.specialRequests || undefined
    };
  } catch (error) {
    console.error("Erro ao analisar preferências:", error);
    // Fallback com preferências padrão
    return {
      duration: 3,
      interests: ["praias", "natureza"],
      budget: "médio",
      travelStyle: "relaxante"
    };
  }
}