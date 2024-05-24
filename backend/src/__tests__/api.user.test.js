const app = require('../app');
const request = require('supertest');


/*--------------------------------------------------------------------------------*/
/*                   Contrôleur Utilisateur : tests                               */
/*--------------------------------------------------------------------------------*/

describe("Contrôleur Utilisateur", () => {
  let token; // Declaration of a variable to store the admin token
  let token_user; // Declaration of a variable to store the user token: not admin
  let idUser1;
  let idUser2;

  test('Send a request without token', async () => {
    const response = await request(app)
      .get('/api/users');
    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('Invalid token');
  });

  test('User Login with Invalid Credentials', async () => {
    // Attempting to log in with invalid credentials
    const response = await request(app)
      .post('/login');
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('You must specify the email and password');
  });

  test('User Login with Wrong Email', async () => {
    // Attempting to log in with wrong credentials
    const response = await request(app)
      .post('/login')
      .send({ email: 'aitoua@grenoble-inp.fr', password: '123456' });
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Wrong email/password');
  });
  
  test('User Login with Wrong password ', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123' });
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Wrong email/password');
  });

  test('User Login with Valid Credentials', async () => {
    // Attempting to log in with valid credentials
    const response = await request(app)
      .post('/login')
      .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token; // Storing the token for later use

  });

  // inavalide sign up
  test('inavalide sign up', async () => {
    // Testing addition of a new user
    const newUserResponse = await request(app)
      .post('/register')
      .send({ name: 'John Doe', password: 'StrongPassword123!' });
      expect(newUserResponse.body.message).toBe('You must specify the name, email and password');

      const response = await request(app)
      .post('/register')
      .send({ name: 'John Doe', email : "john@gmail.com", password: 'S123!' });
      expect(response.body.message).toBe('Weak password!');

      const resp = await request(app)
      .post('/register')
      .send({ name: 'John Doe', email : "johncom", password: 'S123!' });
      expect(resp.body.message).toBe('Invalide email');
  })

  test('Add New User', async () => {
    // Testing addition of a new user
    const newUserResponse = await request(app)
      .post('/register')
      .send({ name: 'John Doe', email: 'john.doe@example.com', password: 'StrongPassword123!' });
      expect(newUserResponse.body.message).toBe('User Added');

      const response = await request(app)
      .post('/login')
      .send({ email: 'john.doe@example.com', password: 'StrongPassword123!' });
      //expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login/Password ok');
      idUser1 = response.body.id;
      token_user = response.body.token;
  });

  test('Try to add a new user with an email address that already exists', async () => {
    // Testing addition of a new user
    const newUserResponse = await request(app)
      .post('/register')
      .send({ name: 'myname', email: 'Sebastien.Viardot@grenoble-inp.fr', password: 'StrongPassword123!' });
      expect(newUserResponse.body.message).toBe('Email address already exists');

  });

  test('Add Another New User', async () => {
    // Testing addition of another new user
    const newUserResponse = await request(app)
      .post('/register')
      .set('x-access-token', token)
      .send({ name: 'root', email: 'root@example.com', password: 'StrongPassword123!' });

    expect(newUserResponse.statusCode).toBe(200);
    expect(newUserResponse.body.status).toBe(true);
    expect(newUserResponse.body.message).toBe('User Added');

    const response = await request(app)
    .post('/login')
    .send({ email: 'root@example.com', password: 'StrongPassword123!' });
    expect(response.statusCode).toBe(200);
    idUser2 = response.body.id;
  });


  test('Get Users', async () => {
    // Testing retrieval of the list of users
    const usersResponse = await request(app)
      .get('/api/users')
      .set('x-access-token', token);

    expect(usersResponse.statusCode).toBe(200);
    expect(usersResponse.body.message).toBe('Returning users');
  });

  test('User Updates his password', async () => {
    // update password
    const updatedUserResponse = await request(app)
      .put('/api/password')
      .set('x-access-token', token_user)
      .send({password: 'StrongRootRoot123@gmailcom!!'});
    expect(updatedUserResponse.body.message).toBe('Password updated');
    expect(updatedUserResponse.body.status).toBe(true);
  });

  test('Invalid password updae', async () => {
    // update password
    const updat = await request(app)
      .put('/api/password')
      .set('x-access-token', token_user)
      .send({password: 'week!'});
      expect(updat.body.message).toBe('Weak password!');

      const response = await request(app)
        .put('/api/password')
        .set('x-access-token', token_user)
      expect(response.body.message).toBe('You must specify the new password');
  })

  test('Update User as Non-Admin', async () => {
    // Testing update of user information by a non-admin user
    const updatedUserResponse = await request(app)
      .put('/api/users/' + idUser1)
      .set('x-access-token', token_user)
      .send({ name: 'root', email: 'root@gmail.com', password: 'StrongRoot123gmailCOM!', isAdmin: true });

    expect(updatedUserResponse.statusCode).toBe(403);
    expect(updatedUserResponse.body.status).toBe(false);
    expect(updatedUserResponse.body.message).toBe('You are not an admin');
  });


  test('Invalid User Update', async () => {
    // Testing update of user information : empty body
    const updatedUserResponse = await request(app)
      .put('/api/users/'+ idUser1)
      .set('x-access-token', token)
    expect(updatedUserResponse.body.message).toBe('You must specify the name, email or password');
  });

  test('Update User', async () => {
    // Testing update of user information
    const updatedUserResponse = await request(app)
      .put('/api/users/'+ idUser1)
      .set('x-access-token', token)
      .send({ name: 'root', email: 'root@gmail.com', password: 'root123@gmail.com', isAdmin: true });
    expect(updatedUserResponse.statusCode).toBe(200);
    expect(updatedUserResponse.body.status).toBe(true);
    expect(updatedUserResponse.body.message).toBe('User updated');
  });

  test('Non admin user try to Delete another User', async () => {
      // Testing deletion of user
      const response = await request(app)
      .post('/login')
      .send({ email: 'root@example.com', password: 'StrongPassword123!' });
      expect(response.statusCode).toBe(200);
      const token2 = response.body.token;
      const deletedUserResponse = await request(app)
        .delete('/api/users/1')
        .set('x-access-token', token2);
      expect(deletedUserResponse.body.status).toBe(false);
      expect(deletedUserResponse.body.message).toBe('You are not an admin');
  });

  test('Delete new Users', async () => {
    // Testing deletion of user
    const deletedUserResponse = await request(app)
      .delete('/api/users/' + idUser2)
      .set('x-access-token', token);
    expect(deletedUserResponse.statusCode).toBe(200);
    expect(deletedUserResponse.body.status).toBe(true);
    expect(deletedUserResponse.body.message).toBe('User deleted');

    const deletedUser = await request(app)
      .delete('/api/users/' + idUser1)
      .set('x-access-token', token);
    expect(deletedUser.statusCode).toBe(200);
    expect(deletedUser.body.status).toBe(true);
    expect(deletedUser.body.message).toBe('User deleted');
  });

  test('Send a request with old token : the owner of this token is deleted', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-access-token', token_user);
    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  test('Trying to delete myself', async () => {
    // admin try to delele him self : he can't do that
    const deletedUserResponse = await request(app)
      .delete('/api/users/1')
      .set('x-access-token', token);
    expect(deletedUserResponse.body.status).toBe(false);
    expect(deletedUserResponse.body.message).toBe('You cannot delete your self');
  });
});

describe('Testing handling of not found endpoints', () => {
  it('Returns a 404 error with Endpoint Not Found message', async () => {
    const response = await request(app).get('/non-existent-path');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: false,
      message: 'Endpoint Not Found'
    });
  });
});


