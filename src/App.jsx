import './App.css';
import { useTheme } from './hooks/useTheme';
import AppRoutes from './routes/AppRoutes';

function App() {
  useTheme();
  return <AppRoutes />;
}

export default App;
