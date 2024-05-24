import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';
import { validatePassword } from './Utile';
import { validateEmail } from './Utile';
import { validateName} from './Utile';

const UpdateInformation = ({selectedUser,token})=> {
    const headersList = { "Accept": "*/*", "x-access-token": token,"Content-Type": "application/json"};
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleUpdate = async() => {
        const bbd = JSON.stringify({name,email,password,isAdmin})
        console.log(bbd)
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

        const response = await fetch(`${DNS}api/users/${selectedUser.id}`, {
            method: "PUT",
            body: JSON.stringify({name,email,password,isAdmin}),
            headers: headersList
        });
        const data = await response.json();
        if (!response.status) {
            setErrorMessage(response.message);
        } else {
            setErrorMessage('');
            setSuccessMessage(data.message);
        }
        // Réinitialisation des champs
        setEmail('');
        setPassword('');
        setName('');
    }

    return (
    <div className='updateUser'>
         <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="name">Nouveau nom :</label>
                    <input
                      id="name"
                      type="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nouveau nom"
                      required
                    />

                <label htmlFor="email">Nouveau mail :</label>
                         <input
                           id="email"
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="Nouveau email"
                           required
                         />

                <label htmlFor="password">Nouveau mot de passe :</label>
                  <input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    required
                  />
                <label htmlFor="isAdmin">Administrateur :</label>
                    <select id="isAdmin" name="isAdmin" value={isAdmin} onChange={(e) => setIsAdmin(e.target.value)} required>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                </select>
                <button type="button" onClick={handleUpdate}>Mettre à jour</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        </div>

    )
    
}

export default UpdateInformation;