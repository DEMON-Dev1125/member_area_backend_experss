const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const isAuthenticated = require('./../middlewares/auth.js')
const Certificate = require('../models/certificatesModel.js');

let router = express.Router();

const checkForErrors = ({ contentDetail }) => {
    let errors = {};
    let isValid = false;
    if (contentDetail === '') {
        errors = { ...errors, contentDetail: 'This field is required' }
    }
    if (Object.keys(errors).length > 0) {
        return { isValid, errors };
    }
    isValid = true;
    return { isValid, errors };
}



router.get('/', (req, res) => {
    Certificate.find({}, (err, certificates) => {
        res.json({ certificates });
    }).sort({ order: 1 })
});

router.get('/:id', (req, res) => {
    Certificate.findById(req.params.id, (err, certificates) => {
        if (err) throw err;
        res.json({ certificates });
    })
});

router.post('/add', isAuthenticated, async (req, res) => {
    console.log("dddd");
    const contentDetail = req.body.contentDetail || '';
    let orderValue = 0;

    const { isValid, errors } = checkForErrors({ contentDetail });
    const max = await Certificate.find({}).sort({ order: -1 }).limit(1);
    if (max.length > 0) {
        orderValue = max[0].order + 1;
    }

    if (isValid) {
        const newCertificate = new Certificate({
            contentDetail: contentDetail,
            order: orderValue
        });

        newCertificate.save((err) => {
            if (err) throw err;
            else {
                res.json({ success: 'success' });
            }
        });
    } else {
        res.json({ errors });
    }
});

router.post('/edit', isAuthenticated, (req, res) => {
    if (req.body.certificates) {
        const callback = function (err, r) {
            if (err) throw err;
            else res.json({ success: 'success' });
        }
        const ops = req.body.certificates.map(function (item) {
            return {
                "updateOne": {
                    "filter": {
                        "_id": ObjectId(item._id),
                    },
                    "update": { $set: { order: item.order } }
                }
            }
        });

        Certificate.collection.bulkWrite(ops, callback);

    } else {
        res.json({ errors });
    }
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    const contentDetail = req.body.contentDetail || '';

    const { isValid, errors } = checkForErrors({ title, module });

    if (isValid) {
        const updatedCertificate = {
            contentDetail: contentDetail,
        };

        Certificate.findByIdAndUpdate(req.params.id, updatedCertificate, err => {
            if (err) throw err;
            else res.json({ success: 'success' });
        });
    } else {
        res.json({ errors });
    }
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
    Certificate.remove({ _id: req.params.id }, err => {
        res.json({ success: 'success' });
    });
});

module.exports = router;
