const users = [];

const addUser = ({ id, username }) => {
  //Clean the data
  username = username.trim().toLowerCase();

  //Validate the data
  if (!username) {
    return {
      error: "Username is required!",
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  const user = { id, username };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = () => {
  return users.map((user) => user);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
