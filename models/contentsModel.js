const mongoose = require('mongoose');

const ContentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Module'
    },
    text: {
        type: String,
    },
    videolink: {
        type: String,
    },
    status: {
        type: String,  // read, reading, unread
        default: "unread"
    },
    file: {
        type: String,
    },
    comment: {
        type: Boolean,
        required: true,
        default: false
    },
    order: {
        type: Number,
        unique: false
    }
});

const Content = mongoose.model('Content', ContentSchema)

module.exports = Content;
