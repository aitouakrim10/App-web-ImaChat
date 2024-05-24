import React, { useState } from 'react';
import './views/App.css'
import Form from './components/Form';
import Home from './components/Home'


const App = () => { 
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')) || null);
  const handleLogin = (data) => {
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUserData(null);
    // Supprimer le token du stockage local
    localStorage.removeItem('token');  
  };
  
  return(
      <div className='root'>
          {userData ? (
              <Home data={userData} onLogout={handleLogout} />
          ) : (
              <Form onLogin={handleLogin} />
          )}
      </div>
  );
};

export default App;