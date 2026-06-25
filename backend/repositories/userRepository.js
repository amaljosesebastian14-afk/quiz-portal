const { getDB } = require("../config/db");

const getUserByEmail = async (email) => {

  const db = getDB();

  return await db
    .collection("users")
    .findOne({ email });

};

const createUser = async (userData) => {

  const db = getDB();

  return await db
    .collection("users")
    .insertOne(userData);

};

module.exports = {
  getUserByEmail,
  createUser
};