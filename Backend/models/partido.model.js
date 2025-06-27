import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Partido = sequelize.define("Partido", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  field: 'scoreHome', // <-- mapea esta propiedad al campo de la BD
},
awayScore: {
  type: DataTypes.INTEGER,
  allowNull: true,
  field: 'scoreAway',
},
  fecha: {
    type: DataTypes.INTEGER,
    allowNull: false, // número de jornada: 1, 2, 3...
  },
  date: {
  type: DataTypes.DATE,
  allowNull: false,
  field: 'dateTime', // mapea al campo real 'dateTime'
},
}, {
  tableName: "partidos",
  timestamps: false,
});

export default Partido;
