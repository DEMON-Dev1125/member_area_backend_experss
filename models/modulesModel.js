const mongoose = require('mongoose');

const ModuleSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    order: {
        type: Number,
        // required: true
    }
});

const Module = mongoose.model('Module', ModuleSchema)

module.exports = Module;
