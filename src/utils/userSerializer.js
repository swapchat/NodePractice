const toPublicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  age: user.age,
  gender: user.gender,
  about: user.about,
  photoUrl: user.photoUrl,
  skills: user.skills,
});

module.exports = {
  toPublicUser,
};
