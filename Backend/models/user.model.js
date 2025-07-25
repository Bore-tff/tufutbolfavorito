import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import generarId from "../helpers/generarId.js";
import { sequelize } from "../config/db.js";
import Pronostico from "./predictions.model.js";
import PronosticoFavorito from "./predictionsFavoritos.model.js";

dotenv.config();

const Usuario = sequelize.define("Usuario",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Opcional, para evitar usuarios duplicados
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Muy recomendable para emails
      validate: {
        isEmail: true
      }
    },
    equipoFavorito: {
     type: DataTypes.STRING,
     allowNull: true,
     defaultValue: null, 
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);

// Eliminar espacios si es necesario
Usuario.beforeValidate((usuario) => {
  if (usuario.user) {
    usuario.user = usuario.user.trim();
  }
});

// Encriptar la contraseña al crear o actualizar
Usuario.beforeCreate(async (usuario) => {
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(usuario.password, salt);
});

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
  }
});

// Relación 1:N
Usuario.hasMany(Pronostico, { foreignKey: "userId", onDelete: "CASCADE" });
Pronostico.belongsTo(Usuario, { foreignKey: "userId" });

// Relación 2:N
Usuario.hasMany(PronosticoFavorito, { foreignKey: "userId", onDelete: "CASCADE" });
PronosticoFavorito.belongsTo(Usuario, {foreignKey: "userId"});


export default Usuario;
