import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';

const DeleteAddMember = ({ selectedGroup, AllUsers , getAllUsers, token }) => {
    const gid = selectedGroup.id; // id du groupe sélectionné.
    const headersList = { "Accept": "*/*", "x-access-token": token };
    const [usersToAdd, setUsersToAdd] = useState([]); // users that are not in the group
    const [groupMembers, setGroupMembers] = useState([]); // users that are in the group

    useEffect(() => {
        fetchGroupMembers();
        const interval = setInterval(() => {
            fetchGroupMembers(); // Fetch messages every 5 seconds
        }, 5000);
        return () => clearInterval(interval);  // Clean up the interval when the component unmounts or the gid changes
    }, [selectedGroup]);

    const fetchGroupMembers = async () => {
        try {
            const response = await fetch(`${DNS}api/mygroups/${gid}`, {
                method: "GET",
                headers: headersList
            })
            const data = await response.json();
            if (data.status) {
                console.log(AllUsers);
                await getAllUsers();
                setGroupMembers(data.data);
                console.log(groupMembers);
                const usersNotInGroup = AllUsers.filter(user => !data.data.some(member => member.id === user.id));
                setUsersToAdd(usersNotInGroup);
                console.log(usersToAdd);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error getting group members:', error);
        }
    }

    // add a user to group
    const [selectedUser, setSelectedUser] = useState('');
    const handleClickAdd = async () => {
        try {
            if (!selectedUser) {
                console.error("Veuillez choisir un utilisateur à ajouter.");
                return;
            }
            const uid = selectedUser;
            const response = await fetch(`${DNS}api/mygroups/${gid}/${uid}`, {
                method: "PUT",
                headers: headersList
            });
            const data = await response.json();
            if (data.status) {
                await fetchGroupMembers();
                setSelectedUser('');
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error adding user to group:', error);
        }
    }

    // delete member of group
    const handleClickdelete = async (uid) => {
        try {
            const response = await fetch(`${DNS}api/mygroups/${gid}/${uid}`, {
                method: "DELETE",
                headers: headersList
            });
            const data = await response.json();
            if (data.status) {
                await fetchGroupMembers()
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.error('Error deleting group member:', error);
        }
    }

    return (
        <div className='members member-groups ' >
            <div className='ajouterMember'>
                <label htmlFor="member-select">Ajouter un membre au groupe {selectedGroup.name}</label>
                <select name="member" id="member-select" onChange={(event) => setSelectedUser(event.target.value)} >
                    <option value="">-- Veuillez choisir --</option>
                    {usersToAdd.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
                <button className='add-button' onClick={() => handleClickAdd()}>Ajouter</button>
            </div>
            <div className='supprimerMember member'>
                <h3>Liste des membres du groupe {selectedGroup.name}</h3>
                <ul className='member'>{groupMembers.map(member => ( (member.id !== selectedGroup.ownerId) && 
                    <li key={member.id}>{member.name} <button className='delete-button' uid={member.id} gid={selectedGroup.id} onClick={() => handleClickdelete(member.id)}> Supprimer </button></li>
                ))}
                </ul>
            </div>
        </div>
    )
}

export default DeleteAddMember;
