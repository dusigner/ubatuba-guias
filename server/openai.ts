import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface ItineraryPreferences {
  experienceTypes: string[]; // adventure, family, beach, trails
  duration: string; // 1 day, 2-3 days, 4-7 days, more than 1 week
  styles: string[]; // relaxed, adventurous, cultural, gastronomic
  specialRequests?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    duration: string;
    difficulty?: string;
    tips: string[];
  }[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  totalDays: number;
  estimatedCost: string;
  bestTimeToVisit: string;
  days: ItineraryDay[];
  generalTips: string[];
  whatToBring: string[];
}

export async function generateItinerary(preferences: ItineraryPreferences): Promise<GeneratedItinerary> {
  try {
    const prompt = `
Você é um especialista em turismo de Ubatuba, São Paulo, Brasil. Crie um roteiro personalizado detalhado em português brasileiro baseado nas seguintes preferências:

Tipos de experiência: ${preferences.experienceTypes.join(', ')}
Duração: ${preferences.duration}
Estilos: ${preferences.styles.join(', ')}
${preferences.specialRequests ? `Pedidos especiais: ${preferences.specialRequests}` : ''}

Crie um roteiro completo incluindo:
- Título atrativo para o roteiro
- Resumo do roteiro (2-3 frases)
- Número total de dias
- Custo estimado por pessoa
- Melhor época para visitar
- Cronograma detalhado dia a dia com atividades específicas de Ubatuba
- Dicas gerais importantes
- Lista do que levar

Para cada dia, inclua:
- Título temático do dia
- Atividades com horários, locais específicos de Ubatuba, descrições, duração e dicas

Responda APENAS em formato JSON válido com a seguinte estrutura:
{
  "title": "string",
  "summary": "string", 
  "totalDays": number,
  "estimatedCost": "string",
  "bestTimeToVisit": "string",
  "days": [
    {
      "day": number,
      "title": "string",
      "activities": [
        {
          "time": "string",
          "activity": "string", 
          "location": "string",
          "description": "string",
          "duration": "string",
          "difficulty": "string (opcional)",
          "tips": ["string"]
        }
      ]
    }
  ],
  "generalTips": ["string"],
  "whatToBring": ["string"]
}

Certifique-se de incluir locais reais e específicos de Ubatuba como praias famosas (Praia Vermelha, Praia do Félix, Ilha Anchieta), trilhas conhecidas (Trilha da Praia Brava, Pico do Corcovado), restaurantes típicos, e atividades autênticas da região.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em turismo de Ubatuba, SP. Crie roteiros detalhados e autênticos em português brasileiro usando apenas locais e atividades reais da região."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Roteiro Personalizado para Ubatuba",
      summary: result.summary || "Um roteiro incrível para descobrir Ubatuba",
      totalDays: result.totalDays || 1,
      estimatedCost: result.estimatedCost || "R$ 200 - R$ 500",
      bestTimeToVisit: result.bestTimeToVisit || "Abril a Outubro",
      days: result.days || [],
      generalTips: result.generalTips || [],
      whatToBring: result.whatToBring || []
    };

  } catch (error) {
    console.error("Erro ao gerar roteiro:", error);
    throw new Error("Falha ao gerar roteiro: " + (error as Error).message);
  }
}
