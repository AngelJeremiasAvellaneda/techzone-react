// src/utils/theme-init.js
// Este script se ejecuta ANTES de que React se monte
// Previene el flash de tema incorrecto

(function() {
  // Intentar obtener tema guardado
  const savedTheme = localStorage.getItem('theme');
  
  // Si hay tema guardado, usarlo
  if (savedTheme) {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Si no hay tema guardado, usar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  
  // Hacer visible el contenido
  document.documentElement.style.visibility = 'visible';
})();