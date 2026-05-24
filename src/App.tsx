import { AppRouter } from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '1rem',
            border: '1px solid var(--color-outine)',
            background: 'var(--color-section)',
            color: 'var(--color-text)',
            backdropFilter: 'blur(12px) saturate(180%)',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: 'var(--color-action)', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' },
          },
        }}
      />
    </>
  )
}

export default App
