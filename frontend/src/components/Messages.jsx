import React, { useState, useEffect } from 'react';
import { DNS } from './Utile';

const Messages = ({selectedGroup , data ,token})=> {
    const gid = selectedGroup.id; // id du groupe sélectionné. {id, name, ownerId}
    const uid = selectedGroup.ownerId; // id de admin
    const iduser = data.id; // id user
    const headersList = { "Accept": "*/*", "x-access-token": token ,'Content-Type': 'application/json' };
    
    const [messages, setMessages] = useState([]); // list of messages message = {id ,groupid , time ,content , name}
    useEffect(() => { // Re-fetch messages when the selected group changes
        fetchMessages();
        const interval = setInterval(() => {
            fetchMessages(); // Fetch messages every 5 seconds
        }, 5000);
        return () => clearInterval(interval);  // Clean up the interval when the component unmounts or the gid changes
    }, [selectedGroup]); 
    
    // get group's messages
    const fetchMessages = async () =>{ 
        try {
           let response = await fetch(`${DNS}api/messages/${gid}`, { 
             method: "GET",
             headers: headersList
           });
           let data = await response.json();
           if(data.status) {
                setMessages(data.data);
           } else {
                console.error(data.message);
           }
        } catch(error) {
            console.error('Error getting  messages:', error)
        }
    }

    // send message 
    const [Content, setNewMessage] = useState(''); // state for the new message
    const sendMessage = async() => {
        try {
            if (!Content.trim()) {
                console.error('Please enter a message.');
                return;
            }
            const bod = JSON.stringify({Content});
            let response = await fetch(`${DNS}api/messages/${gid}`, { 
              method: "POST",
              headers: headersList,
              body: bod,
            });
            let data = await response.json();
            if(data.status) {
                 await fetchMessages();
                 setNewMessage("");
            } else {
                 console.error(data.message);
            }
         } catch(error) {
             console.error('Error getting  messages:', error)
         }
    }
    return (
        <div className='messages'>
            <div className='messagesList'>
                {messages.map(message => (
                <div key={message.id} className={(message.userId == iduser )? 'myMessage' : 'otherMessage'}>
                    <div className='messageHeader'>
                        <p id="sender"> {message.name} at : {message.createdAt}</p>
                   </div>
                   <div className='massageContent'>
                        <p id="message">{message.content}</p>
                    </div>
                </div>
                ))}
            </div>
            <div className='send-message'>
                <textarea
                    value={Content}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Type your message...'
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}

export default Messages;

