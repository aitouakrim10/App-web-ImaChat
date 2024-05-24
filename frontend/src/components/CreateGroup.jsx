import React, { useState, useEffect } from 'react';
import { DNS, validateName } from './Utile';

const CreatGroup = ({token , updateMyGroups, updateGroupsAdmin}) => {
    const [name, setGroupName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validateName(name)) {
            setErrorMessage("Nom de groupe invalide");
        } else {
            try {
                const response = await fetch(DNS + "api/mygroups", {
                    method: 'POST',
                    headers: {
                        "x-access-token": token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name}),
                });

                const data = await response.json();
                if (data.status == false) {
                    console.log(data)
                    setErrorMessage(data.message)
                }else {
                    setSuccessMessage(data.message);
                    // Effacer les messages d'erreur précédents
                    setErrorMessage("");
                    setGroupName("");
                    updateGroupsAdmin();
                    updateMyGroups();

                }
            
            } catch (error) {
                console.error('Error creating group:', error);
            }
        }
    }
    return (
        <div className='add-group'>
         <form onSubmit={handleSubmit}>
            <input
                id = "add-group"
                type="text"
                value={name}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nom du nouveau groupe"
            />
            <button className='add-group-button' id = "add-group" type="submit">Créer</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
</div>

    )
}


export default CreatGroup;