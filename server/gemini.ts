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

export async function generateItinerary(
  preferences: ItineraryPreferences, 
  availableData: {
    trails: any[],
    beaches: any[],
    boatTours: any[],
    events: any[],
    guides: any[]
  }
): Promise<string> {
  try {
    const { trails, beaches, boatTours, events, guides } = availableData;
    
    const prompt = `Você é um especialista em turismo de Ubatuba, SP, Brasil. Crie um roteiro detalhado e personalizado baseado nas seguintes preferências e nos dados REAIS disponíveis no sistema:

**PREFERÊNCIAS DO USUÁRIO:**
**Duração:** ${preferences.duration} dias${preferences.startDate && preferences.endDate ? ` (${new Date(preferences.startDate).toLocaleDateString('pt-BR')} a ${new Date(preferences.endDate).toLocaleDateString('pt-BR')})` : ''}
**Interesses:** ${preferences.interests.join(', ')}
**Orçamento:** ${preferences.budget}
**Estilo de viagem:** ${preferences.travelStyle}
${preferences.groupSize ? `**Tamanho do grupo:** ${preferences.groupSize}` : ''}
${preferences.specialRequests ? `**Pedidos especiais:** ${preferences.specialRequests}` : ''}

**DADOS REAIS DISPONÍVEIS NO SISTEMA:**

**TRILHAS CADASTRADAS:**
${trails.map(trail => 
  `- ${trail.name} (${trail.difficulty}) - ${trail.distance}km, ${trail.duration}h - ${trail.description.substring(0, 100)}...`
).join('\n')}

**PRAIAS CADASTRADAS:**
${beaches.map(beach => 
  `- ${beach.name} (${beach.region}) - ${beach.description.substring(0, 100)}... - Comodidades: ${beach.amenities?.join(', ') || 'N/A'}`
).join('\n')}

**PASSEIOS DE BARCO CADASTRADOS:**
${boatTours.map(tour => 
  `- ${tour.name} (${tour.companyName}) - ${tour.duration}h, até ${tour.maxPeople} pessoas, R$ ${tour.price} - ${tour.description.substring(0, 100)}...`
).join('\n')}

**EVENTOS DISPONÍVEIS:**
${events.map(event => 
  `- ${event.title} (${new Date(event.startDate).toLocaleDateString('pt-BR')} às ${event.startTime}) - ${event.location} - R$ ${event.ticketPrice} - ${event.description.substring(0, 100)}...`
).join('\n')}

**GUIAS LOCAIS DISPONÍVEIS:**
${guides.map(guide => 
  `- ${guide.name} (${guide.experienceYears} anos) - Especialidades: ${guide.specialties?.join(', ') || 'N/A'} - Idiomas: ${guide.languages?.join(', ') || 'N/A'} - ⭐ ${guide.rating}`
).join('\n')}

**INSTRUÇÕES IMPORTANTES:**
- Responda APENAS em português brasileiro
- OBRIGATÓRIO: Use SOMENTE os dados reais fornecidos acima nas suas sugestões
- Mencione os nomes EXATOS das trilhas, praias, passeios, eventos e guias cadastrados
- Inclua informações específicas como preços, horários e características dos itens cadastrados
- Crie um roteiro detalhado dia por dia com visual limpo e organizado
- Inclua horários sugeridos para cada atividade
- Sugira os guias locais apropriados para cada atividade com formato: "Guia sugerido: [Nome do Guia] - [especialidades]"
- Para eventos, use formato: "Evento: [Nome do Evento] - [data] - [preço]"
- Para passeios de barco, use formato: "Passeio de barco: [Nome do Passeio] - [duração] - [preço]"
- Seja mais conciso no texto, evite parágrafos muito longos
- Use emojis para tornar mais visual: 🌅 manhã, ☀️ tarde, 🌙 noite, 🥾 trilha, 🏖️ praia, ⛵ barco, 🎭 evento
- Inclua dicas práticas baseadas nos dados reais
- Conecte as atividades de forma lógica e geográfica

**ESTRUTURA DO ROTEIRO:**
# Roteiro Personalizado para Ubatuba - ${preferences.duration} dias

## Dia 1: [Título do dia]
### Manhã (8h-12h)
- **Atividade:** [usar trilha/praia/passeio REAL do sistema]
- **Local:** [nome exato do local cadastrado]
- **Custo:** [preço real do sistema quando disponível]
- **Guia sugerido:** [nome do guia real e especialidades]
- **Dica:** [informação baseada nos dados reais]

### Tarde (13h-18h)
- **Atividade:** [usar trilha/praia/passeio REAL do sistema]
- **Local:** [nome exato do local cadastrado]
- **Custo:** [preço real do sistema quando disponível]
- **Dica:** [informação baseada nos dados reais]

### Noite (19h-22h)
- **Evento/Jantar:** [evento real do sistema ou sugestão gastronômica]
- **Local:** [local real quando disponível]

Continue este formato para todos os dias...

## Contatos dos Guias Sugeridos
[Liste os guias mencionados com suas informações de contato reais]

## Dicas Gerais
- [Dicas baseadas nos dados reais cadastrados]
- [Informações sobre os eventos disponíveis nas datas]

**IMPORTANTE:** Use APENAS os dados fornecidos acima. Não invente nomes de trilhas, praias ou estabelecimentos que não estão na lista.`;

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