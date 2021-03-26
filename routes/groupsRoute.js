const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const isAuthenticated = require('./../middlewares/auth.js')
const Group = require('../models/groupsModel.js');

let router = express.Router();

const checkForErrors = ({ name }) => {
    let errors = {};
    let isValid = false;
    if (name === '') {
        errors = { ...errors, name: 'This field is required' }
    }
    if (Object.keys(errors).length > 0) {
        return { isValid, errors };
    }
    isValid = true;
    return { isValid, errors };
}



router.get('/', (req, res) => {
    Group.find({}, (err, groups) => {
        res.json({ groups });
    }).sort({ order: 1 })
});

router.get('/:id', (req, res) => {
    Group.findById(req.params.id, (err, group) => {
        if (err) throw err;
        res.json({ group });
    })
});

router.post('/add', isAuthenticated, async (req, res) => {
    const name = req.body.name || '';
    const accessterm = req.body.accessterm || '';
    const standardclass = req.body.standardclass || false;
    const moduledata = req.body.moduledata || [];
    let orderValue = 0;

    const { isValid, errors } = checkForErrors({ name });
    const max = await Group.find({}).sort({ order: -1 }).limit(1);
    if (max.length > 0) {
        orderValue = max[0].order + 1;
    }

    if (isValid) {
        const newGroup = new Group({
            name: name,
            accessterm: accessterm,
            standardclass: standardclass,
            moduledata: moduledata,
            order: orderValue
        });

        newGroup.save((err) => {
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
    if (req.body.groups) {
        const callback = function (err, r) {
            if (err) throw err;
            else res.json({ success: 'success' });
        }
        const ops = req.body.groups.map(function (item) {
            return {
                "updateOne": {
                    "filter": {
                        "_id": ObjectId(item._id),
                    },
                    "update": { $set: { order: item.order } }
                }
            }
        });

        Group.collection.bulkWrite(ops, callback);

    } else {
        res.json({ errors });
    }
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    const name = req.body.name || '';
    const accessterm = req.body.accessterm || '';
    const standardclass = req.body.standardclass || false;
    const moduledata = req.body.moduledata || [];

    const { isValid, errors } = checkForErrors({ name });

    if (isValid) {
        const updatedGroup = {
            name: name,
            accessterm: accessterm,
            standardclass: standardclass,
            moduledata: moduledata,
            order: orderValue
        };

        Group.findByIdAndUpdate(req.params.id, updatedGroup, err => {
            if (err) throw err;
            else res.json({ success: 'success' });
        });
    } else {
        res.json({ errors });
    }
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
    Group.remove({ _id: req.params.id }, err => {
        res.json({ success: 'success' });
    });
});

module.exports = router;
