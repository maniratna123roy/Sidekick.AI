import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    es: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', hi: 'होम', es: 'Inicio' },
  'nav.howItWorks': { en: 'How It Works', hi: 'कैसे काम करता है', es: 'Cómo Funciona' },
  'nav.features': { en: 'Features', hi: 'विशेषताएं', es: 'Características' },
  'nav.styleGuide': { en: 'Style Guide', hi: 'स्टाइल गाइड', es: 'Guía de Estilo' },
  'nav.signIn': { en: 'Sign In', hi: 'साइन इन', es: 'Iniciar Sesión' },

  // Hero
  'hero.tagline': { en: 'AI-Powered Code Intelligence', hi: 'AI-संचालित कोड बुद्धिमत्ता', es: 'Inteligencia de Código con IA' },
  'hero.title': { en: 'Ask Any GitHub Repository', hi: 'किसी भी GitHub रेपो से पूछें', es: 'Pregunta a Cualquier Repositorio' },
  'hero.subtitle': { en: 'Natural-language questions. Deep code understanding. Instant answers with source links.', hi: 'प्राकृतिक भाषा में प्रश्न। गहरी कोड समझ। स्रोत लिंक के साथ त्वरित उत्तर।', es: 'Preguntas en lenguaje natural. Comprensión profunda del código. Respuestas instantáneas.' },
  'hero.cta': { en: 'Start Exploring', hi: 'एक्सप्लोर करें', es: 'Comenzar' },
  'hero.secondary': { en: 'See How It Works', hi: 'देखें कैसे काम करता है', es: 'Ver Cómo Funciona' },

  // Features
  'features.title': { en: 'Powerful Capabilities', hi: 'शक्तिशाली क्षमताएं', es: 'Capacidades Potentes' },
  'features.subtitle': { en: 'Everything you need to understand any codebase', hi: 'किसी भी कोडबेस को समझने के लिए सब कुछ', es: 'Todo lo que necesitas para entender cualquier código' },

  // How it works
  'how.title': { en: 'How Sidekick Works', hi: 'Sidekick कैसे काम करता है', es: 'Cómo Funciona Sidekick' },
  'how.subtitle': { en: 'From repo to answers in seconds', hi: 'रेपो से जवाब तक सेकंडों में', es: 'Del repositorio a respuestas en segundos' },

  // Signup
  'signup.title': { en: 'Request Early Access', hi: 'जल्दी एक्सेस का अनुरोध करें', es: 'Solicitar Acceso Anticipado' },
  'signup.subtitle': { en: 'Be among the first to experience Sidekick.ai', hi: 'Sidekick.ai का अनुभव करने वाले पहले लोगों में से एक बनें', es: 'Sé de los primeros en experimentar Sidekick.ai' },
  'signup.name': { en: 'Full Name', hi: 'पूरा नाम', es: 'Nombre Completo' },
  'signup.email': { en: 'Email Address', hi: 'ईमेल पता', es: 'Correo Electrónico' },
  'signup.repo': { en: 'GitHub Repository URL', hi: 'GitHub रेपोज़िटरी URL', es: 'URL del Repositorio' },
  'signup.usecase': { en: 'Primary Use Case', hi: 'प्राथमिक उपयोग का मामला', es: 'Caso de Uso Principal' },
  'signup.submit': { en: 'Request Access', hi: 'एक्सेस का अनुरोध करें', es: 'Solicitar Acceso' },

  // Footer
  'footer.description': { en: 'Ask any GitHub repository using natural language. Powered by RAG and vector search.', hi: 'प्राकृतिक भाषा का उपयोग करके किसी भी GitHub रेपोज़िटरी से पूछें।', es: 'Pregunta a cualquier repositorio de GitHub usando lenguaje natural.' },
  'footer.product': { en: 'Product', hi: 'उत्पाद', es: 'Producto' },
  'footer.resources': { en: 'Resources', hi: 'संसाधन', es: 'Recursos' },
  'footer.company': { en: 'Company', hi: 'कंपनी', es: 'Empresa' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
