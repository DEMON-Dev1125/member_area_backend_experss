const mongoose = require('mongoose');

const CertificateSchema = mongoose.Schema({
    contentDetail: {
        type: String,
    },
    order: {
        type: Number,
        unique: false
    }
});

const Certificate = mongoose.model('Certificate', CertificateSchema)

module.exports = Certificate;
