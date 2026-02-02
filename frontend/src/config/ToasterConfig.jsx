import { Toaster } from 'react-hot-toast';

const ToasterConfig = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
        },
        success: {
          iconTheme: {
            primary: '#ea580c', 
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', 
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToasterConfig;