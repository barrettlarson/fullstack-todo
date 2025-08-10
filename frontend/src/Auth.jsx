import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { api } from './api';

function Auth() {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const navigate = useNavigate();

const login = async () => {
  const response = await api('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    navigate('/App');
  } else {
    const errorData = await response.json();
    alert(errorData.message || 'Login failed');
  }
}

const register = async () => {
  const reponse = await api('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (reponse.ok) {
    const data = await reponse.json();
    navigate('/App');
  } else {
    const errorData = await reponse.json();
    alert(errorData.message || 'Registration failed');
  }
}

  return (
    <div className="auth-container">
      <h1>Login</h1>
        <form className="auth-form">
            <div className="auth-input-group">
                <input className="auth-input" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />     
            </div>
            <div className="auth-button-group">
                <button className="auth-button" type="button" onClick={login}>Login</button>
                <button className="auth-button" type="button" onClick={register}>Register</button>
            </div>
        </form>
    </div>
  );
}

export default Auth;