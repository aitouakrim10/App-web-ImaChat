import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';
import Groups from './Groups';
import Administrateur from './Administrateur';

const Home = ({data, onLogout}) => {
    const token = data.token;
    const isRoot = data.isAdmin;
    console.log(isRoot)
    const headersList = { "Accept": "*/*", "x-access-token": token};
    const [switchP, setSuperUser] = useState(0);
    // logout
    const handleLogout = () => {
        // Supprimer le token du stockage local
        localStorage.removeItem('token');
        // Appeler la fonction de déconnexion du composant parent
        onLogout();
    }
    // switch to super user
    const handleSw = async()=> {
        setSuperUser((switchP +1)%2);
    }

    /*get la liste des utulisateurs de l app */
    const [AllUsers, setAllUsers] = useState([]); // all users of the app
    useEffect(() => {
        getAllUsers();
    }, []);

    useEffect(() => {
        // Fetch initial data
        getAllUsers();
        fetchGroupsAdmin();
        fetchMyGroups();

        // Fetch data every 5 seconds
        const interval = setInterval(() => {
            fetchGroupsAdmin();
            fetchMyGroups();
        }, 5000);

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [token]); // Dependency array ensures effect runs when token changes


    const getAllUsers = async() => {
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
            console.error('Error getting  group members:', error);
        }
    }

    const [myGroups, setMyGroups] = useState([]);
    useEffect(() => {
        fetchMyGroups();
    }, []);

    const fetchMyGroups = async () => {
        try {
            const response = await fetch(DNS + "api/groupsmember", {
                method: "GET",
                headers: headersList
            });

            const data = await response.json();
            if (data.status) {
                setMyGroups(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching my groups:', error);
        }
    };

    const [groupsAdmin, setGroupsAdmin] = useState([]);
    useEffect(() => {
        fetchGroupsAdmin();
    }, []);
    const fetchGroupsAdmin = async () => {
        try {
            const response = await fetch(DNS + "api/mygroups", {
                method: "GET",
                headers: headersList
            });

            const data = await response.json();
            if (data.status) {
                setGroupsAdmin(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching my groups:', error);
        }
    };

    return (
        <div className='root'>
                {data && (
                <div className="logout-section panel">
                    <span id="email">Email : {data.email} <button className='sedeconnecter-Button' onClick={handleLogout}>Se déconnecter</button></span>
                    <span id="switch"><button className='switch-Button' onClick={()=>handleSw()}>Changer l'onglet</button></span>
                </div>
            )}
            {(switchP === 0)?<Groups myGroups={myGroups} setMyGroups={setMyGroups} groupsAdmin ={groupsAdmin} setGroupsAdmin={setGroupsAdmin} fetchGroupsAdmin={fetchGroupsAdmin} fetchMyGroups={fetchMyGroups} AllUsers={AllUsers} getAllUsers={getAllUsers} data ={data} token={token}/>
            : <Administrateur data={data}/>    
        }
            </div>
    );
}

export default Home;