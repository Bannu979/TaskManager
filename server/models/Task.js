const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('To Do', 'In Progress', 'Done'),
        defaultValue: 'To Do',
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define the relationship
Task.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

User.hasMany(Task, {
    foreignKey: 'user_id',
    as: 'tasks'
});

module.exports = Task; 