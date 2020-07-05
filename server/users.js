//users helper functions
const users = [];

const addUser = ({ id, name, room }) => {
  //Neha Negi = nehanegi

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //check if user already exist
  const existingUser = users.find(
    user => user.room === room && user.name === name
  );
  if (existingUser) {
    return { error: "Username is taken" };
  }
  //if not, create new user, add it to user array
  const user = { id, name, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  return users.filter(user => users.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
