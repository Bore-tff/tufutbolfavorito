import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Partido from "./partido.model.js";

const PronosticoFavorito = sequelize.define("PronosticoFavorito", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  homeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  awayScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  penalesHome: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
penalesAway: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
  puntos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fecha: {
  type: DataTypes.INTEGER,
  allowNull: false
  },
  fase: {
      type: DataTypes.STRING, // 👈 eliminatorias: "Cuartos", "Semi", "Final"
      allowNull: true,
    },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: "usuarios",
      key: "id",
    },
  }
}, {
  tableName: "pronosticosFavoritos",
  timestamps: false,
});

// Asociación con Partido
PronosticoFavorito.belongsTo(Partido, { foreignKey: "matchId" });
Partido.hasMany(PronosticoFavorito, { foreignKey: "matchId" });

export default PronosticoFavorito;
