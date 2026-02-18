import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en' | 'pt';

const translations = {
  es: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Email',
    password: 'Password',
    name: 'Nombre',
    create_account: 'Crear Cuenta',
    entering: 'Entrando...',
    registering: 'Registrando...',
    no_account: '¿No tienes cuenta?',
    have_account: '¿Ya tienes cuenta?',
    dashboard_title: 'Pipeline',
    menu_seguimiento: 'Seguimiento',
    menu_alta: 'Alta de Cuenta',
    menu_renovaciones: 'Renovaciones',
    logout: 'Salir',
    ref: 'Ref #',
    account: 'Cuenta',
    stage: 'Etapa',
    last_modified: 'Última Modif.',
    manage: 'Gestionar',
    create_renewal: 'Crear Renovación',
    finished_at: 'Finalizado el',
    new_account_title: 'Alta de Cuenta',
    ramo: 'Ramo',
    subramo: 'Subramo',
    start_date: 'Fecha Inicio Vigencia',
    target_premium: 'Prima Objetivo',
    create_generate: 'Crear y Generar Caso',
    case_management: 'Gestión de Caso',
    account_data: 'Datos de la Cuenta',
    stage_alta_desc: 'La cuenta ha sido dada de alta exitosamente. Revise los datos y avance a negociación.',
    advance_negotiation: 'Avanzar a Negociación',
    negotiation: 'Negociación',
    stayed: '¿Se quedó?',
    status: 'Estatus',
    select: 'Seleccione...',
    won: 'Ganada',
    lost: 'Perdida',
    save_advance: 'Guardar y Avanzar',
    emission: 'Emisión',
    policy: 'Póliza',
    finish_process: 'Terminar Proceso',
    welcome: 'Bienvenido',
    error_registration: 'Error en el registro',
    loading: 'Cargando...'
  },
  en: {
    login: 'Log In',
    register: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    create_account: 'Create Account',
    entering: 'Logging in...',
    registering: 'Registering...',
    no_account: 'No account?',
    have_account: 'Already have an account?',
    dashboard_title: 'Pipeline',
    menu_seguimiento: 'Pipeline',
    menu_alta: 'New Account',
    menu_renovaciones: 'Renewals',
    logout: 'Log Out',
    ref: 'Ref #',
    account: 'Account',
    stage: 'Stage',
    last_modified: 'Last Mod.',
    manage: 'Manage',
    create_renewal: 'Create Renewal',
    finished_at: 'Finished at',
    new_account_title: 'New Account',
    ramo: 'Line of Business',
    subramo: 'Sub-line',
    start_date: 'Start Date',
    target_premium: 'Target Premium',
    create_generate: 'Create & Generate Case',
    case_management: 'Case Management',
    account_data: 'Account Data',
    stage_alta_desc: 'Account created successfully. Review data and proceed to negotiation.',
    advance_negotiation: 'Advance to Negotiation',
    negotiation: 'Negotiation',
    stayed: 'Retained?',
    status: 'Status',
    select: 'Select...',
    won: 'Won',
    lost: 'Lost',
    save_advance: 'Save & Advance',
    emission: 'Emission',
    policy: 'Policy',
    finish_process: 'Finish Process',
    welcome: 'Welcome',
    error_registration: 'Error during registration',
    loading: 'Loading...'
  },
  pt: {
    login: 'Entrar',
    register: 'Registrar',
    email: 'Email',
    password: 'Senha',
    name: 'Nome',
    create_account: 'Criar Conta',
    entering: 'Entrando...',
    registering: 'Registrando...',
    no_account: 'Não tem conta?',
    have_account: 'Já tem conta?',
    dashboard_title: 'Pipeline',
    menu_seguimiento: 'Seguimento',
    menu_alta: 'Nova Conta',
    menu_renovaciones: 'Renovações',
    logout: 'Sair',
    ref: 'Ref #',
    account: 'Conta',
    stage: 'Etapa',
    last_modified: 'Últ. Modif.',
    manage: 'Gerenciar',
    create_renewal: 'Criar Renovação',
    finished_at: 'Finalizado em',
    new_account_title: 'Nova Conta',
    ramo: 'Ramo',
    subramo: 'Sub-ramo',
    start_date: 'Início Vigência',
    target_premium: 'Prêmio Alvo',
    create_generate: 'Criar e Gerar Caso',
    case_management: 'Gestão de Caso',
    account_data: 'Dados da Conta',
    stage_alta_desc: 'Conta criada com sucesso. Revise os dados e avance para negociação.',
    advance_negotiation: 'Avançar para Negociação',
    negotiation: 'Negociação',
    stayed: 'Ficou?',
    status: 'Status',
    select: 'Selecione...',
    won: 'Ganha',
    lost: 'Perdida',
    save_advance: 'Salvar e Avançar',
    emission: 'Emissão',
    policy: 'Apólice',
    finish_process: 'Terminar Processo',
    welcome: 'Bem-vindo',
    error_registration: 'Erro no registro',
    loading: 'Carregando...'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['es']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: keyof typeof translations['es']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
