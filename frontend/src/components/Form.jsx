
import Login from './Login';
import Register from './Register';

const Form = ({onLogin }) => {
    return (
      <div className="Forme-container">
        <h1>Bienvenue sur Imachat</h1>
        <p>Une application de messagerie instantanée pour rester en contact avec vos proches.</p>
        <div className="login"><Login onLogin={onLogin}/></div>
        <div className="register" ><Register/></div>
      </div>
    );
  };

export default Form;