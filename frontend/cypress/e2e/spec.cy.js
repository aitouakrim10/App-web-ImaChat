describe('login Component', () => {
  it('login valide', () => {
    cy.visit('http://127.0.0.1:5173/')
    cy.get('.login-container').within(() => { // form login
      cy.get('#email').type('Sebastien.Viardot@grenoble-inp.fr'); // valid password and email
      cy.get('#password').type('123456');
      cy.get('.login-button').click();
    });
    cy.get('.logout-section').should('exist'); // vérifie que la section de déconnexion existe après le login
  });

  it('should display error message with invalid credentials', () => {
    const invalidEmail = 'invalid_email@example.com'; //  e-mail invalide
    const invalidPassword = 'invalid_password'; // un mot de passe invalide
    cy.visit('http://127.0.0.1:5173/')
    cy.get('.login-container').within(() => {
      cy.get('#email').type(invalidEmail);
      cy.get('#password').type(invalidPassword);
      cy.get('.login-button').click();
    });
    cy.get('.error-message').should('exist');
  }); 
})

describe('Register Component', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5173/')
  });

  it('should display registration form', () => {
    cy.get('.register-title').should('contain', 'Enregistrement'); // verification de vue
    cy.get('#name').should('exist');
    cy.get('#email').should('exist');
    cy.get('#password').should('exist');
    cy.get('#confirm-password').should('exist');
    cy.get('.register-button').should('contain', "S'inscrire");
  });

  it('should show error message for invalid email', () => {
    const invalidEmail = 'invalid_email'; // un e-mail invalide

    cy.get('.register-container').within(() => {
      cy.get('#name').type("test");
      cy.get('#email').type(invalidEmail);
      cy.get('.register-button').click();
    });

    cy.get('.error-message').should('contain', 'Email invalide');
  });

  it('should show error message for invalid password', () => {
    const invalidPassword = 'invalid'; // un mot de passe invalide

    cy.get('.register-container').within(() => {
      cy.get('#name').type("test");
      cy.get('#email').type('Sebastien.Viardot@grenoble-inp.fr');
      cy.get('#password').type(invalidPassword);
      cy.get('#confirm-password').type(invalidPassword);
      cy.get('.register-button').click();
    });

    cy.get('.error-message').should('contain', 'Le mot de passe doit contenir au moins 8 caractères');
  });

  it('should show error message for non-matching passwords', () => {
    const password = 'StrongPassword@1234!!'; // un mot de passe valide
    const passwordConfirmation = 'non_matching_password'; //mot de passe de confirmation non correspondant

    cy.get('.register-container').within(() => {
      cy.get('#name').type("test");
      cy.get('#email').type('Sebastien.Viardot@grenoble-inp.fr');
      cy.get('#password').type(password);
      cy.get('#confirm-password').type(passwordConfirmation);
      cy.get('.register-button').click();
    });
    cy.get('.error-message').should('exist');
  });

});

describe('Group Management', () => {

  it('Registers a user, logs in, creates a group, send messages ,adds and removes users from the group, delete groups/users and logs out', () => {
      // Register a user
      cy.visit('http://127.0.0.1:5173/')
      cy.get('.register-container').within(() => {
      cy.get('#name').type('TestUser');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('StrongPassword@1234!!');
      cy.get('#confirm-password').type('StrongPassword@1234!!');
      cy.get('.register-button').click();
      });
      // Log in
      cy.get('.login-container').within(() => {
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('StrongPassword@1234!!');
        cy.get('.login-button').click();
      });
      // Create a group named "Campus"
      cy.get('.home-container').should('exist');
      // Create a group named "Campus"
      cy.get('.home-container').within(() => {
        cy.get('input[id="add-group"]').type('Campus'); 
        cy.get('form').submit();
      });
      // Create a group named "Ensimag"
      cy.get('.home-container').within(() => {
        cy.get('input[id="add-group"]').clear();
        cy.wait(1000);
        cy.get('input[id="add-group"]').type('Ensimag'); 
        cy.get('form').submit();
      });
      // Check if the groups "Campus", "Ensimag" appears in "My Groups" section
      cy.get('.mygroups-container').within(() => {
        cy.contains('.mygroups-list-item', 'Campus').should('exist');
        cy.contains('.mygroups-list-item', 'Ensimag').should('exist');
      });
      // Check if the group "Campus" appears in "Group Admins" section
      cy.get('.groupsAdmin-container').within(() => {
        cy.contains('.groupsAdmin-list-item', 'Campus').should('exist');
        cy.contains('.groupsAdmin-list-item', 'Ensimag').should('exist');
      });
      // Add "Sebastien Viardot" to the group
      cy.contains('.groupsAdmin-list-item', 'Campus').click();
      cy.get('.member-groups').within(() => {
          cy.get('#member-select').select('Sebastien Viardot');
          // Click the "Add" button
          cy.contains('.add-button', 'Ajouter').click();
      });
      // verify Sebastien Viardot appears in the group members list
      cy.get('.supprimerMember').within(() => {
        cy.contains('Sebastien Viardot').should('exist');
      });
      //add a new message
      const message = 'Test message......';
      cy.get('.send-message textarea')
      .type(message)
      .should('have.value', message);
      // Cliquez sur le bouton "Send"
      cy.get('.send-message button').click();
      // check if the message is in messagesList
      cy.get('.messagesList')
      .contains('.massageContent p', message)
      .should('exist');
      // verify Sebastien Viardot no longer exists in the list of users available to add
      cy.get('.ajouterMember').within(() => {
        cy.get('#member-select').should('not.contain', 'Sebastien Viardot');
      });
      //Click the "Supprimer" button associated with "Sebastien Viardot"
      cy.contains('.member li', 'Sebastien Viardot').find('.delete-button').click();      
      // verify Sebastien Viardot exists in the list of users available to add
      cy.get('.ajouterMember').within(() => {
        cy.get('#member-select').should('contain', 'Sebastien Viardot');
      });
       // verify Sebastien Viardotno longer exists  in the group members list
       cy.get('.supprimerMember').within(() => {
        cy.get('.member').should('not.contain', 'Sebastien Viardot');
      });
      // click in my groups 
      cy.contains('.mygroups-list-item', 'Campus').click();
      // check if the message is in messagesList
      cy.get('.messagesList')
      .contains('.massageContent p', message)
      .should('exist');
      // switch to settings
      cy.get('.switch-Button').click();
      // Update password
      const newPassword = 'StrongPassword@1234!!';
      // Saisissez le nouveau mot de passe et confirmez-le
      cy.get('#newPassword').type(newPassword);
      cy.get('#confirmPassword').type(newPassword);
      // Cliquez sur le bouton "Mettre à jour"
      cy.get('.updatePassword button').click();
      // Vérifiez le message de succès ou d'erreur
      cy.get('.error-message').should('not.exist'); // Vérifiez qu'il n'y a pas de message d'erreur
      cy.get('.success-message').should('be.visible'); // Vérifiez que le message de succès est affiché
      // Cliquez sur le bouton "Supprimer" du groupe "Ensimag"
      cy.contains('.group', 'Ensimag').find('.delete-group').click();      // Verifiez que le groupe "Ensimag" n 'est plus present dans la liste des groupes
      cy.get('.groups-list').should('not.contain', 'Ensimag');
      cy.get('.groups-list').should('not.contain', 'Ensimag');
      // switch to home
      cy.get('.switch-Button').click();
      // Logout    
      cy.get('.sedeconnecter-Button').click();
      // administrateur : sign in
      // Log in
      cy.get('.login-container').within(() => {
        cy.get('#email').type('Sebastien.Viardot@grenoble-inp.fr');
        cy.get('#password').type('123456');
        cy.get('.login-button').click();
      });
      // switch to Settings
      cy.get('.switch-Button').click();
      // delete a group by the root
      cy.contains('.group', 'Campus').find('.delete-group').click(); 
      // update a user
      cy.contains('.user', 'TestUser').find('button.modify-user').click();
      cy.get('.updateUser #name').clear().type("modifUser"); 
      cy.get('.updateUser #email').clear().type("test@example.com"); 
      cy.get('.updateUser #password').clear().type('StrongPassword@1234!!'); 
      cy.get('.updateUser #isAdmin').select('true');
      cy.get('.updateUser button').click();
      cy.wait(3000);
      // delete a user by the root
      cy.get('.users-list').should('contain', 'modifUser');
      cy.contains('.users-list', 'modifUser').find('button.delete-user').click(); 
      // Logout    
      cy.get('.sedeconnecter-Button').click();
  });
});

