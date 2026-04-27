export interface EncyclopediaSection {
  id: string;
  title: string;
  icon: string;
  intro?: string;
  body?: string[];
  glossary?: { term: string; def: string }[];
  examples?: { title: string; content: string }[];
  tips?: string[];
}

export const SECTIONS: EncyclopediaSection[] = [
  {
    id: 'estructura',
    title: 'Estructura de Canciones',
    icon: 'library-music',
    intro: 'Una letra de flamenquito fusión combina la tradición del cante flamenco con melodías modernas.',
    body: [
      'Estrofa: bloque de 4 a 6 versos que presenta una idea o emoción.',
      'Estribillo: parte que se repite, suele tener la frase más pegadiza y emotiva.',
      'Puente: sección de transición que cambia el tono antes del estribillo final.',
      'Salida (cierre): los últimos versos, a menudo con una metáfora o moraleja.',
    ],
  },
  {
    id: 'vocabulario',
    title: 'Vocabulario Flamenco',
    icon: 'menu-book',
    glossary: [
      { term: 'Compás', def: 'El ritmo característico del flamenco.' },
      { term: 'Quejío', def: 'Lamento o queja profunda en el cante.' },
      { term: 'Duende', def: 'Inspiración mágica que transmite el alma del flamenco.' },
      { term: 'Soleá', def: 'Palo flamenco solemne y emotivo.' },
      { term: 'Bulería', def: 'Palo festivo y rápido, ideal para el flamenquito.' },
      { term: 'Falseta', def: 'Variación melódica de la guitarra flamenca.' },
      { term: 'Tablao', def: 'Local donde se interpreta flamenco en vivo.' },
      { term: 'Cante jondo', def: 'Cante hondo, profundo y dramático.' },
    ],
  },
  {
    id: 'temas',
    title: 'Temas Comunes',
    icon: 'favorite',
    body: [
      'Amor y desamor: la pasión y el dolor de los sentimientos profundos.',
      'Libertad: la búsqueda de la autenticidad y el camino propio.',
      'Raíces: el orgullo por la tierra, la familia y la cultura andaluza.',
      'Noche y fiesta: el bullicio del tablao, la luna y el vino.',
      'Soledad: la melancolía y la introspección del alma flamenca.',
    ],
  },
  {
    id: 'consejos',
    title: 'Consejos de Escritura',
    icon: 'lightbulb',
    tips: [
      'Empieza por una emoción concreta, no por una rima.',
      'Usa imágenes sensoriales: olores, colores, sonidos del sur.',
      'Mantén la métrica natural: octosílabos funcionan muy bien.',
      'Repite frases clave para crear gancho en el estribillo.',
      'Mezcla expresiones populares con metáforas poéticas.',
      'Lee tu letra en voz alta para sentir el compás.',
    ],
  },
  {
    id: 'ejemplos',
    title: 'Letras Clásicas de Ejemplo',
    icon: 'auto-stories',
    examples: [
      {
        title: 'Luna de mi tierra',
        content: 'Luna que alumbras mi calle\ny mi pena de querer\ndime tú dónde se esconde\nla que ya no he de ver.\n\n(Estribillo)\nAy luna, luna, luna\nde mi tierra y de mi sur\ncuéntale al viento bajito\nque me muero por su luz.',
      },
      {
        title: 'Compás del corazón',
        content: 'Late mi pecho a compás\ncomo guitarra rasgá\ncada palmita en el aire\nme recuerda a mi querer.\n\n(Estribillo)\nY suena, suena, suena\nel cante de mi querer\nque ni la noche más larga\nme lo puede esconder.',
      },
    ],
  },
  {
    id: 'inspiracion',
    title: 'Inspiración y Referencias',
    icon: 'star',
    body: [
      'Estopa — fusión rumbera y sentimiento de barrio.',
      'Camarón de la Isla — la cumbre del cante jondo.',
      'Rosalía — flamenco contemporáneo con producción moderna.',
      'Niña Pastori — voz cálida del flamenquito popular.',
      'Ketama — pioneros del nuevo flamenco fusión.',
    ],
  },
];
