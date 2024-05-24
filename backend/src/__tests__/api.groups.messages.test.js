const app = require('../app');
const request = require('supertest');

/*--------------------------------------------------------------------------------*/
/*                   Contrôleur groups et massages  : tests                       */
/*--------------------------------------------------------------------------------*/

describe("Contrôleur groups ", () => {

  let token ;
  let token_user; // Declaration of a variable to store the user token: not admin
  let userId;

  test('create group', async () => {
    const respon = await request(app)
      .post('/login')
      .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' });
    token = respon.body.token;
    // create two groups
    // group 1 ensimag
    const response1 = await request(app)
        .post('/api/mygroups')
        .set('x-access-token', token)
        .send({ name: 'Ensimag'});
    expect(response1.statusCode).toBe(200);
    expect(response1.body.message).toBe('Group created');
    // group 2 cpge
    const response2 = await request(app)
        .post('/api/mygroups')
        .set('x-access-token', token)
        .send({ name: 'CPGE'});
      expect(response2.statusCode).toBe(200);
      expect(response2.body.message).toBe('Group created');
    });
  
    test("tryin to create a group without valide name", async() => {
      const response2 = await request(app)
      .post('/api/mygroups')
      .set('x-access-token', token)
      expect(response2.body.message).toBe('You must specify the name of group');
    });

  test("User creats a group with the same name ", async() => {
    const response2 = await request(app)
    .post('/api/mygroups')
    .set('x-access-token', token)
    .send({ name: 'CPGE'});
    expect(response2.statusCode).toBe(403);
    expect(response2.body.message).toBe('Group already exists');
  });
  
  test('Lister les groupes créés et donc gérés par l utilisateur', async () => {
          const groups = await request(app)
          .get('/api/mygroups')
          .set('x-access-token', token)
          expect(groups.statusCode).toBe(200);
          expect(groups.body.message).toBe('User groups retrieved successfully');
          expect(groups.body.data.length).toBe(2); 
    });

  test('add a user to group', async () => {
    const newUserResponse = await request(app)
      .post('/register')
      .send({ name: 'aitouaka', email: 'aitouaka@grenoble-inp.fr', password: 'Aitouaka@password123!!!' });
      expect(newUserResponse.statusCode).toBe(200);
      expect(newUserResponse.body.status).toBe(true);
      expect(newUserResponse.body.message).toBe('User Added');
      const response = await request(app)
    .post('/login')
    .send({ email: 'aitouaka@grenoble-inp.fr', password: 'Aitouaka@password123!!!' });
    expect(response.statusCode).toBe(200);
    userId = response.body.id;
    token_user = response.body.token;

      const usersResponse = await request(app)
        .get('/api/users')
        .set('x-access-token', token);
      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.message).toBe('Returning users');

      const groups = await request(app)
      .put('/api/mygroups/1/'+ userId)
      .set('x-access-token', token)
      expect(groups.body.message).toBe('User added to group');
      expect(groups.statusCode).toBe(200);
  });

  test('add an Invalid user to group', async () => {
    const groups = await request(app)
    .put('/api/mygroups/1/'+ 0)
    .set('x-access-token', token)
    expect(groups.body.message).toBe('Uid user is Invalid');
    expect(groups.statusCode).toBe(404);
  });

  test('Lister les membre d Ensimag', async () => {
    const groups = await request(app)
    .get('/api/mygroups/1')
    .set('x-access-token', token)
    expect(groups.statusCode).toBe(200);
    expect(groups.body.message).toBe('Group members retrieved successfully');
    expect(groups.body.data.length).toBe(2); // sebastien + aitouaka
  });

  test("Lister les group de user", async () => {
    const groups = await request(app)
    .get('/api/groupsmember')
    .set('x-access-token', token_user)
    expect(groups.statusCode).toBe(200);
    expect(groups.body.message).toBe('User groups retrieved successfully');
    expect(groups.body.data.length).toBe(1); // group ensimag
  }); 

  test("envoyer un message au membres du Ensimag", async () => {
    const groups = await request(app)
    .post('/api/messages/1')
    .set('x-access-token', token_user)
    .send({Content : "Hello wrold!"})
    expect(groups.body.message).toBe('Message sent');
    expect(groups.statusCode).toBe(200);
  }); 

  test("envoyer un message non valide", async () => {
    const groups = await request(app)
    .post('/api/messages/1')
    .set('x-access-token', token_user)
    .send({Content : ""}) // message vide
    expect(groups.body.message).toBe('You must specify the Content of message : Invalide message');
  }); 

  test("lister les message du group Ensimag", async () => {
    const groups = await request(app)
    .get('/api/messages/1')
    .set('x-access-token', token)
    .send({Content : "Hello wrold!"})
    expect(groups.body.message).toBe('Messages retrieved successfully');
    expect(groups.statusCode).toBe(200);
  }); 
  

  test('Non admin group user try to Delete a member ', async () => {
    const groups = await request(app)
    .delete('/api/mygroups/1/'+userId)
    .set('x-access-token', token_user)
    expect(groups.statusCode).toBe(404);
    expect(groups.body.message).toBe('User is not admin for this group');
    const grpMembers = await request(app)
    .get('/api/mygroups/1')
    .set('x-access-token', token)
    expect(grpMembers.statusCode).toBe(200);
    expect(grpMembers.body.message).toBe('Group members retrieved successfully');
    expect(grpMembers.body.data.length).toBe(2); // sebastien
  });

  test('Delete member from group  Ensimag', async () => {
    const groups = await request(app)
    .delete('/api/mygroups/1/'+userId)
    .set('x-access-token', token)
    expect(groups.statusCode).toBe(200);
    expect(groups.body.message).toBe('User deleted from group');
    const grpMembers = await request(app)
    .get('/api/mygroups/1')
    .set('x-access-token', token)
    expect(grpMembers.statusCode).toBe(200);
    expect(grpMembers.body.message).toBe('Group members retrieved successfully');
    expect(grpMembers.body.data.length).toBe(1); // sebastien

  });

  test('Delete a user from group  Ensimag that is not member ', async () => {
    const groups = await request(app)
    .delete('/api/mygroups/1/'+ 0)
    .set('x-access-token', token)
    expect(groups.body.message).toBe('User to delete is not found');
    expect(groups.statusCode).toBe(404);
  });

  test('Admin can not delet him self ', async () => { // admin here is sebastien : id = 1
    const groups = await request(app)
    .delete('/api/mygroups/1/'+ 1)
    .set('x-access-token', token)
    expect(groups.body.message).toBe('You  cannot remove your self');
    expect(groups.statusCode).toBe(404);
  });

  test('A normal user attempts to delete a group', async () => {
    const group = await request(app)
    .delete('/api/groups/1')
    .set('x-access-token', token_user)
    expect(group.body.message).toBe('You are not an admin');
    expect(group.body.status).toBe(false);
  });

  test('A normal user attempts to get a list of all the groups', async () => {
    const group = await request(app)
    .get('/api/groups')
    .set('x-access-token', token_user)
    expect(group.body.message).toBe('You are not an admin');
    expect(group.body.status).toBe(false);
  });

  test('Delete User', async () => {
    // Testing deletion of user
    const deletedUserResponse = await request(app)
      .delete('/api/users/' + userId)
      .set('x-access-token', token);
    expect(deletedUserResponse.statusCode).toBe(200);
    expect(deletedUserResponse.body.status).toBe(true);
    expect(deletedUserResponse.body.message).toBe('User deleted');
  });


  test('Invalide Group admin requests', async () => {
    const res = await request(app)
      .delete('/api/mygroups/0/0')
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('Invalid token');

    const resp = await request(app)
      .delete('/api/mygroups/0/0')
      .set('x-access-token', token_user);
    expect(resp.body.status).toBe(false);
    expect(resp.body.message).toBe('User not found');
  });

  test('Invalide Group member requests', async () => {
    const res = await request(app)
      .post('/api/messages/0')
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('Invalid token');

    const resp = await request(app)
      .post('/api/messages/0')
      .set('x-access-token', token_user);
    expect(resp.body.status).toBe(false);
    expect(resp.body.message).toBe('User not found');

    const re = await request(app)
      .post('/api/messages/0')
      .set('x-access-token', token);
    expect(re.body.status).toBe(false);
    expect(re.body.message).toBe('User is not a member in this Group');
  });

  test('Retrieve all groups ', async () => {
    const groups = await request(app)
    .get('/api/groups')
    .set('x-access-token', token)
    expect(groups.body.message).toBe('Returning groups');
    expect(groups.body.status).toBe(true);
    expect(groups.body.data.length).toBe(2);
  });

  test('Delete all groups ', async () => {
    const group = await request(app)
    .delete('/api/groups/1')
    .set('x-access-token', token)
    expect(group.body.message).toBe('Group deleted');
    expect(group.body.status).toBe(true);

    const groups = await request(app)
    .delete('/api/groups/2')
    .set('x-access-token', token)
    expect(group.body.message).toBe('Group deleted');
    expect(group.body.status).toBe(true);

    const grps = await request(app)
    .get('/api/groups')
    .set('x-access-token', token)
    expect(grps.body.message).toBe('Returning groups');
    expect(grps.body.status).toBe(true);
    expect(grps.body.data.length).toBe(0);
  });

});

