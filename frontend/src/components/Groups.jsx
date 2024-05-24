import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';
import CreatGroup from './CreateGroup';
import DeleteAddMember from './DeleteAddMember';
import Messages from './Messages';


const Groups = ({myGroups, groupsAdmin , data ,fetchGroupsAdmin , fetchMyGroups, token}) =>{
    const headersList = { "Accept": "*/*", "x-access-token": token};
    /* Gestion du click sur un groupe dont je suis l'administrateur */
    const [selectedGroup, setSelectedGroup] = useState(null); // selected group (group || null)
    const [isMygroup, setBool] = useState(false); // selected group (group || null)

    const handleClick = async(group,bool) => {
        getAllUsers();
        setSelectedGroup(group);
        setBool(bool);
    }

    const [AllUsers, setAllUsers] = useState([]); // all users of the app
    useEffect(() => {
        // Obtenir la liste de tous les utilisateurs de l'application lors du chargement du composant
        getAllUsers();
        const interval = setInterval(() => {
            getAllUsers(); // Fetch messages every 5 seconds
        }, 5000);
    }, []);

    const getAllUsers = async () => {
        try {
            const response = await fetch(`${DNS}api/users`, {
                method: "GET",
                headers: headersList
            });
            const data = await response.json();
            if (data.status) {
                setAllUsers(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error getting users:', error);
        }
    }
   

return (
    <div className='home-container'>
    <div className='groups'>
        <div className='mygroups-container section'>
            <h3 className='mygroups-title'>Mes groupes</h3>
            <ul className='mygroups-list'>
                {myGroups.map(group => (
                <li key={group.id}>
                    <span className='mygroups-list-item' onClick={() => handleClick(group,false)} uid ={group.ownerId} gid={group.id} key={group.id}>{group.name}</span>
                </li>
                 ))}
            </ul>
        </div>
        <div  className='groupsAdmin-container section'>
                <h3 className='groupsAdmin-title'>Ceux que j'administre</h3>
                    <ul className='groupsAdmin-list'>
                        {groupsAdmin.map(group => (
                            <li  key={group.id} >
                                <span id="admin" className='groupsAdmin-list-item' uid={group.ownerId} gid={group.id} key={group.id} onClick={() => handleClick(group, true) }>{group.name}</span>
                            </li>
                        ))}
                    </ul>
            <div><CreatGroup token={token}  updateGroupsAdmin={fetchGroupsAdmin} updateMyGroups={fetchMyGroups} /></div>
        </div>
    </div>
        {selectedGroup && (
            <Messages selectedGroup= {selectedGroup} data={data} token={token} AllUsers={AllUsers}/>
            )}
    
        {selectedGroup && (isMygroup == true) && (
            <DeleteAddMember selectedGroup= {selectedGroup}  token={token} AllUsers={AllUsers} getAllUsers={getAllUsers}/>
         )}
</div>       
)
}

export default Groups;