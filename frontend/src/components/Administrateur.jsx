import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';
import { validatePassword } from './Utile';
import { validatePasswordConfirmation } from './Utile';
import UpdateInformation from './UpdateInformation'

const Administrateur = ({ data }) => {
    const adminId = data.id;
    const token = data.token;
    const isAdmin = data.isAdmin
    const apiEnd = (isAdmin? "groups" : "mygroups");
    const headersList = { "Accept": "*/*", "x-access-token": token };
    const [users, setUsers] = useState([]); // all users of the app
    const [groups, setGroups] = useState([]); // all groups of the app
    const [selectedUser, setSelectedUser] = useState(null);
    // update password
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        // Fetch data every 8 seconds
        const interval = setInterval(() => {
            setSuccessMessage("")
            setErrorMessage('')
        }, 10000);

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [token]); // Dependency array ensures effect runs when token changes


    const handleUpdatePassword= async() =>{
        // verifier password
        if (!validatePassword(password)) {
            setErrorMessage('Le mot de passe doit contenir au moins 8 caractères, dont :\n- Au moins une lettre majuscule\n- Au moins une lettre minuscule\n- Au moins un chiffre\n- Au moins un caractère spécial');
            setPassword('')
            setPasswordConfirmation('')
            return;
        }
        // verifier la comfirmation de password
        if (!validatePasswordConfirmation(password, passwordConfirmation)) {
            setErrorMessage('Les mots de passe ne correspondent pas');
            setPassword('')
            setPasswordConfirmation('')
            return;
        }
        try {
            const response = await fetch(`${DNS}api/password`, {
                method: 'PUT',
                headers: {"x-access-token": token,'Content-Type': 'application/json'},
                body: JSON.stringify({ password}),
            });

            const data = await response.json();
            if (data.status == false) {
                setPassword('')
                setPasswordConfirmation('')
                setErrorMessage(data.message)
            }else {
                setSuccessMessage(data.message);
                setPassword('')
                setPasswordConfirmation('')
                setErrorMessage("");
            }
        } catch (error) {
            setErrorMessage(error.message)
            console.error('Error updating password:', error);
        }
    }

    useEffect(() => {
        // Fetch initial data
        if(isAdmin) getUsers();
        getGroups();
        // Fetch data every 5 seconds
        const interval = setInterval(() => {
            if(isAdmin) getUsers();
            getGroups();
        }, 8000);
        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [token]); // Dependency array ensures effect runs when token changes

    const getUsers = async () => {
        try {
            const response = await fetch(`${DNS}api/users`, {
                method: "GET",
                headers: headersList
            });

            const data = await response.json();
            if (data.status) {
                setUsers(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error getting users:', error);
        }
    }
    // get all groups if isadmin else : get my groups
    const getGroups = async () => {
        try {
            const response = await fetch(`${DNS}api/${apiEnd}`, {
                method: "GET",
                headers: headersList
            });

            const data = await response.json();
            if (data.status) {
                setGroups(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error getting groups:', error);
        }
    }

    // handle delete button
    const handeleDelete = async(idObjet, type)=> {
        try {
            setSelectedUser(null);
            const response = await fetch(`${DNS}api/${type}/${idObjet}`, {
                method: "DELETE",
                headers: headersList
            });
            const data = await response.json();
            if (data.status) {
                console.log(data.message);
                getUsers();
                getGroups();
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error getting groups:', error);
        }
    }

    const handleModify = async (user) =>{
        setSelectedUser(user);
    }

    return (
        <div className='Settings'>
            <div className='groups-list'>
                <p className='groups-title'>Groups</p>
                <ul className='groups-list'>
                    {groups.map(group => (
                        <li key={group.id}>
                            <span className='group'>{group.name} <button className='delete-group' onClick={()=> handeleDelete(group.id, 'groups')} > Supprimer </button></span>
                        </li>
                    ))}
                </ul>
            </div>
            {isAdmin && 
                <div className='users-list'>
                    <p className='users-title'>Users</p>
                    <ul className='users-list'>
                        {users.map(user => user.id !== adminId && (
                            <li key={user.id}>
                                <span className='user'>{user.name} <button className='modify-user'onClick={()=>handleModify(user)} > Modifier </button> <button className='delete-user' onClick={()=> handeleDelete(user.id, 'users')} > Supprimer </button></span>
                            </li>
                        ))}
                    </ul>
                </div>
            }
            {selectedUser && 
                    <UpdateInformation selectedUser={selectedUser} token={token} />
            
            }

           <div className='updatePassword'>
                <form onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="newPassword">Nouveau mot de passe :</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    required
                  />
                  <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe :</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                    required
                  />
                  <button type="button" onClick={handleUpdatePassword}>Mettre à jour</button>
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
                  {successMessage && <p className="success-message">{successMessage}</p>}
                </form>
            </div>
        </div>
    )
}

export default Administrateur;
