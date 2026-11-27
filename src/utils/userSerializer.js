const toPublicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  age: user.age,
  gender: user.gender,
});

module.exports = {
  toPublicUser,
};
