const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    acronym: {
        type: String,
        required: true
    },
    pageURL: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
    },
    commentModeration: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course;
