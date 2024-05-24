const User = require('../models/users.js')
const Group = require('../models/groups.js')
const User_Group = require('../models/users_groups.js')
const Message = require('../models/messages.js')

const bcrypt = require('bcrypt');

// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')
  // Initialise la base avec quelques données
  const passhash = await bcrypt.hash('123456', 2)
  console.log(passhash)
  await User.create({
    name: 'Sebastien Viardot', email: 'Sebastien.Viardot@grenoble-inp.fr', passhash ,isAdmin: true
  })
  // Ajouter ici le code permettant d'initialiser par défaut la base de donnée
})()
