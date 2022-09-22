const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const additionalTeamsSchema = new Schema(
  {
    favoriteTeamId: Number,
    favoriteTeamName: String,
  });

const AdditionalTeams = model("AdditionalTeams", additionalTeamsSchema);

module.exports = AdditionalTeams;
