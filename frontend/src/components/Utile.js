

// domaine d application : https://imachat.osc-fr1.scalingo.io/
export const DNS = "https://imachat.osc-fr1.scalingo.io/"
// Fonction de validation de l'email
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
// Fonction de validation du mot de passe (au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial)
export const validatePassword = (password) => {
    return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password);
  };
  
// Fonction de validation du champ de confirmation du mot de passe
export const validatePasswordConfirmation = (password, passwordConfirmation) => {
  return password === passwordConfirmation;
  };
// fonction de validation de username
export const validateName = (name) => {
  // Vérifie si le nom contient uniquement des espaces
  const containsOnlySpaces = /^\s*$/.test(name);
  // Vérifie si le nom ne contient que des caractères autorisés
  const nameRegex = /^[a-z\-'\s]{1,128}$/i;
  // Retourne true si le nom n'est pas vide et ne contient pas uniquement des espaces et correspond au regex
  return name && !containsOnlySpaces && nameRegex.test(name);
};

