/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      //  Colores personalizados desde Figma
      colors: {
        'cyan-200': '#a5f3fc',
        'cyan-400': '#22d3ee', 
        'cyan-700': '#0e7490',
        'teal-800': '#115e59',
        'pink-500': '#ec4899',
        'yellow-500': '#eab308', // Para el paddle derecho
        //  Variables CSS para temas
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        //  Agregar el color de fondo base de Figma
        figma: {
          background: '#071016', // Color base del fondo
          overlay: 'rgba(63, 144, 200, 0.26)', // Overlay azul
          white: 'rgba(255, 255, 255, 0.07)', // Overlay blanco
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'], // Si quieres usar Inter
      },
      boxShadow: {
        'figma': '2px 2px 10px 0px rgba(0,240,255,0.20)',
      },
      
      //  Agregar el border-radius específico
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        'figma': '20px', //  Border radius exacto de Figma
      },
      
      //  Agregar gradientes personalizados
      backgroundImage: {
        'figma-gradient': 'linear-gradient(108deg, rgba(63, 144, 200, 0.26) 0%, rgba(255, 255, 255, 0.07) 100%)',
      },
      
      // ... resto de tu configuración ...
    },
  },
  plugins: [],
}