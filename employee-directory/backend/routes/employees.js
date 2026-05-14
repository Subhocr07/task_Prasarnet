const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;
        const query = { deleted_at: null };

        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }
        if (department) {
            query.department = department;
        }

        const employees = await Employee.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

        const count = await Employee.countDocuments(query);

        res.json({
            employees,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalEmployees: count
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create employee
router.post('/', async (req, res) => {
    const employee = new Employee({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.body.image,
        department: req.body.department
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, deleted_at: null });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        if (req.body.name) employee.name = req.body.name;
        if (req.body.email) employee.email = req.body.email;
        if (req.body.phone) employee.phone = req.body.phone;
        if (req.body.image) employee.image = req.body.image;
        if (req.body.department) employee.department = req.body.department;

        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employee (Soft Delete)
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, deleted_at: null });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        employee.deleted_at = new Date();
        await employee.save();
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
