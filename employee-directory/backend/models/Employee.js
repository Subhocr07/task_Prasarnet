const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
