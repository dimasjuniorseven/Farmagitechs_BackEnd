import React, { useState } from 'react';
import ChatPage from './components/ChatPage';
import Login from './components/LoginPage';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('chat');

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage('chat');
  };

  if (page === 'login') {
    return <Login setUser={handleLogin} goRegister={() => setPage('register')} />;
  }

  if (page === 'register') {
    return <Register goLogin={() => setPage('login')} />;
  }

  return (
    <ChatPage
      user={user}
      goLogin={() => setPage('login')}
    />
  );
}

export default App;
