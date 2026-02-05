import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [status, setStatus] = useState('starting');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('App mounted');
    setStatus('checking auth');
    
    supabase.auth.getSession()
      .then(({ data, error }) => {
        console.log('getSession result:', { data, error });
        if (error) {
          setStatus('auth error: ' + error.message);
          return;
        }
        setUser(data.session?.user || null);
        setStatus(data.session ? 'logged in' : 'not logged in');
      })
      .catch(err => {
        console.log('getSession catch:', err);
        setStatus('catch error: ' + err.message);
      });
  }, []);

  return (
    <div style={{ padding: 40, background: '#0a0f1a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <h1>Debug Mode</h1>
      <p>Status: <strong>{status}</strong></p>
      <p>User: {user ? user.email : 'none'}</p>
      <pre style={{ background: '#1e293b', padding: 16, borderRadius: 8, overflow: 'auto' }}>
        {JSON.stringify({ status, user: user?.email }, null, 2)}
      </pre>
    </div>
  );
}
