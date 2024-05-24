// Register.jsx
import { validateEmail } from './Utile';
import { validatePassword } from './Utile';
import { validatePasswordConfirmation } from './Utile';
import React, { useState } from 'react';
import { DNS } from './Utile';
import { validateName } from './Utile';
const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async () => {
        if(!validateName(name)){
            setErrorMessage('Nom invalide');
            return;
        }
        if (!validateEmail(email)) {
            setErrorMessage('Email invalide');
            return;
        }
        // verifier password
        if (!validatePassword(password)) {
            setErrorMessage('Le mot de passe doit contenir au moins 8 caractères, dont :\n- Au moins une lettre majuscule\n- Au moins une lettre minuscule\n- Au moins un chiffre\n- Au moins un caractère spécial');
            return;
        }
        // verifier la comfirmation de password
        if (!validatePasswordConfirmation(password, passwordConfirmation)) {
            setErrorMessage('Les mots de passe ne correspondent pas');
            return;
        }

        // Enregistrement
        const headersList = {
            "Content-Type": "application/json"
          };
      
          const bodyContent = JSON.stringify({
            "name": name,
            "email": email,
            "password": password
          });
          // envoyer la requete
          const response = await fetch(DNS + "register", {
            method: "POST",
            body: bodyContent,
            headers: headersList
          });
      
          if (!response.status) {
            setErrorMessage(response.message);
          }
    
          const responseData = await response.json();
          // voir data 
          console.log(responseData); // ok !!

        // Réinitialisation des champs
        setEmail('');
        setPassword('');
        setName('');
        setPasswordConfirmation('');
        setErrorMessage('');
    };

    return (
        <div className="register-container">
            <h3 className="register-title">Enregistrement</h3>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="register-input"
                />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="register-input"
                />
            </div>
            <div>
                <label htmlFor="password">Mot de Passe</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="register-input"
                />
            </div>
            <div>
                <label htmlFor="confirm-password">Confirmez votre Mot de Passe</label>
                <input
                    type="password"
                    id="confirm-password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="register-input"
                />
            </div>
            <button onClick={handleRegister} className="register-button">S'inscrire</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default Register;
