import { useState } from 'react';

// Máscara para telefone brasileiro
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const cleanValue = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (cleanValue.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (11) 99999-9999
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

// Máscara para preço em reais
export const formatPrice = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const cleanValue = value.replace(/\D/g, '');
  
  if (!cleanValue) return '';
  
  // Converte para número e formata
  const numberValue = parseInt(cleanValue) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para remover máscara do telefone (para envio ao backend)
export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para remover máscara do preço (para envio ao backend)
export const unformatPrice = (value: string): string => {
  return value.replace(/[^\d,]/g, '').replace(',', '.');
};

// Hook personalizado para input com máscara de telefone
export const usePhoneMask = (initialValue: string = '') => {
  const [maskedValue, setMaskedValue] = useState(formatPhone(initialValue));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setMaskedValue(formatted);
  };
  
  const getValue = () => unformatPhone(maskedValue);
  
  return {
    value: maskedValue,
    onChange: handleChange,
    getValue
  };
};

// Hook personalizado para input com máscara de preço
export const usePriceMask = (initialValue: string = '') => {
  const [maskedValue, setMaskedValue] = useState(formatPrice(initialValue));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setMaskedValue(formatted);
  };
  
  const getValue = () => unformatPrice(maskedValue);
  
  return {
    value: maskedValue,
    onChange: handleChange,
    getValue
  };
};