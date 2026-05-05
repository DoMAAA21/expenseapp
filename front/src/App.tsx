import Routes from './routes';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <>
       <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
