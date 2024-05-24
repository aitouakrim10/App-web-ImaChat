import React, { useState } from 'react';
import { DNS } from './Utile';



const Login = ({onLogin}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState(null);

    const handleLogin = async () => {
        try {
            //récupérer le token avec email et password
            const response = await fetch( DNS + "login", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (data.status == false) {
                console.log(data)
                setErrorMessage(data.message)
            }else {
                // Stocker le token dans le state
                console.log(data)
                const updata = {'id' : data.id, 'email' : email , 'token' : data.token, 'isAdmin' : data.isAdmin};
                onLogin(updata);
                // Effacer les messages d'erreur précédents
                setErrorMessage('');
            }
        } catch (error) {
            console.error('Error fetching token:', error);
            setErrorMessage('Identifiants incorrects');
            // Réinitialiser le token en cas d'échec de connexion
            setToken(null);
        }
    };

    return (
        <div className="login-container">
            <h3 className="login-title">Se Connecter</h3>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                />
            </div>
            <div>
                <label htmlFor="password">Mot de Passe</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
            </div>
            <button onClick={handleLogin} className="login-button">Se Connecter</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {token && <p className="success-message">Connecté avec le token : {token}</p>}
        </div>
    );
};

export default Login;
