import { AppRouter } from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App
