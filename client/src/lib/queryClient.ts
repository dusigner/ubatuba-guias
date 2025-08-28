import { QueryClient } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';
import { toast } from 'sonner';

// --- Configuração da URL da API ---

// Pega a URL base da API das variáveis de ambiente.
// Em desenvolvimento, será uma string vazia, e as requisições usarão o proxy do Vite.
// Em produção, deve ser a URL completa do seu backend (ex: https://api.seusite.com).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';


// --- Funções Auxiliares ---

async function getErrorMessage(response: Response): Promise<string> {
  try {
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return 'Operação bem-sucedida sem retorno de conteúdo.';
    }
    const errorData = await response.json();
    return errorData.message || errorData.error || 'Ocorreu um erro desconhecido.';
  } catch {
    return `Erro no servidor: ${response.status} ${response.statusText}`;
  }
}


// --- Função Principal de Requisição ---

export async function apiRequest<T>(
  path: string, // Espera um caminho como '/api/auth/user'
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: unknown
): Promise<T> {
  // Constrói a URL final. Em produção, isso adicionará o prefixo do domínio da API.
  const url = `${API_BASE_URL}${path}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // ESSENCIAL para enviar cookies entre domínios
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`[apiRequest] Fazendo requisição: ${method} ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    console.error(`[apiRequest] Erro em ${method} ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
    });
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return Promise.resolve() as Promise<T>;
  }

  return response.json() as Promise<T>;
}


// --- Configuração do Query Client ---

const defaultQueryFn = async ({ queryKey }: QueryFunctionContext) => {
  const path = queryKey[0] as string;
  return apiRequest<unknown>(path, 'GET');
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Não tenta novamente em erros de cliente (4xx)
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: any) => {
        toast.error(error.message || 'Ocorreu um erro ao processar sua solicitação.');
      },
    },
  },
});