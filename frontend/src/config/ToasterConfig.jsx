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
            primary: '#CD5700', // primary-500
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToasterConfig;