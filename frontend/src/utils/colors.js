// Extract primary colors from Tailwind config
export const primaryColors = {
  50: '#fff5e6',
  100: '#ffe8cc',
  200: '#ffd199',
  300: '#ffba66',
  400: '#ffa333',
  500: '#CD5700',
  600: '#a44600',
  700: '#7b3400',
  800: '#522300',
  900: '#291100',
  950: '#1a0a00',
};

// Helper function to convert hex to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};