const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    accessterm: {
        type: Number
    },
    standardclass: {
        type: Boolean,
        default: false
    },
    moduledata: [{
        module_id:{
            type: mongoose.Schema.Types.ObjectId,
        },
        free: {
            type:Boolean
        },
        schedule: {
            type:Boolean
        },
        purchase: {
            type:Boolean
        },
        hidden: {
            type:Boolean
        },
        fromdate:{
            type: Date
        },
        todate: {
            type: Date
        }
    }],
    order: {
        type: Number,
        unique: false
    }
});

const Group = mongoose.model('Group', GroupSchema)

module.exports = Group;
