
const {
  getUserByEmail,
  createUser
} = require("../repositories/userRepository");

const login = async (req, res) => {

  try {

    const {
      name,
      email,
      firebaseUid
    } = req.body;

    let user =
      await getUserByEmail(email);

    if (!user) {

      const newUser = {
        name,
        email,
        firebaseUid,
        role: "user",
        createdAt: new Date()
      };

      await createUser(newUser);

      user = newUser;
    }

    return res.json({
      success: true,
      user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  login
};
