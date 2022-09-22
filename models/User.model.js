const { Schema, model } = require("mongoose");


const AdditionalTeams = require('../models/AdditionalTeams.model');



// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    favoriteTeamId: Number,
    favoriteTeamName: String,
    additionalTeams: [{ type: Schema.Types.ObjectId, ref: 'AdditionalTeams' }]
  });

const User = model("User", userSchema);

module.exports = User;
