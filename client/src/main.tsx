import { createRoot } from 'react-dom/client'
import { ThemeManager } from './lib/themeManager'
import App from './App.tsx'
import './index.css'

// Initialize theme system
ThemeManager.init();

createRoot(document.getElementById("root")!).render(<App />);
