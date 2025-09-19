import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Partido = sequelize.define(
  "Partido",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // ahora usamos el id del mockAPI
      allowNull: false,
    },
    homeTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    awayTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "scoreHome",
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "scoreAway",
    },
    fecha: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fase: {
      type: DataTypes.STRING, // 👈 eliminatorias: "Cuartos", "Semi", "Final"
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "dateTime",
    },
  },
  {
    tableName: "partidos",
    timestamps: false,
  }
);

export default Partido;