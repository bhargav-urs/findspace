import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (router.query.registered === '1') {
      setToast('Account created! Please sign in.');
      setTimeout(() => setToast(''), 3500);
    }
  }, [router.query]);

  return (
    <>
      <Component {...pageProps} />
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
