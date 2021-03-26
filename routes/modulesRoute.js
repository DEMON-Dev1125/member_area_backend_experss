const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const isAuthenticated = require('./../middlewares/auth.js')
const Module = require('../models/modulesModel.js');

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
const checkModuleUniqueness = (field, value) => {
    return { error, isUnique } = Module.findOne({ [field]: value }).exec()
        .then(module => {
            let res = {};
            if (Boolean(module)) {
                res = { error: { [field]: "This " + field + " is not available" }, isUnique: false };
            } else {
                res = { error: { [field]: "" }, isUnique: true };
            }
            return res;
        })
        .catch(err => {
            return err;
        }
        )
}


router.get('/', isAuthenticated, (req, res) => {
    Module.find({}, (err, modules) => {
        res.json({ modules });
    }).sort({ order: 1 })
});

router.get('/:id', isAuthenticated, (req, res) => {
    Module.findById(req.params.id, (err, module) => {
        if (err) throw err;
        res.json({ module });
    })
});

router.post('/add', isAuthenticated, async (req, res) => {

    const name = req.body.name || '';
    let orderValue = 0;

    const { isValid, errors } = checkForErrors({ name });
    const max = await Module.find({}).sort({ order: -1 }).limit(1);
    if (max.length > 0) {
        orderValue = max[0].order + 1;
    }
    if (isValid) {

        const { error, isUnique } = await checkModuleUniqueness('name', name);
        if (!isUnique) {
            res.json({ errors: error });
        }
        else {
            const newModule = new Module({
                name: name,
                order: orderValue
            });

            newModule.save((err) => {
                if (err) throw err;
                else {
                    res.json({ success: 'success' });
                }
            });
        }
    } else {
        res.json({ errors });
    }
});

router.post('/edit', isAuthenticated, (req, res) => {
    if (req.body.modules) {
        const callback = function (err, r) {
            if (err) throw err;
            else {
                Module.find({}, (err, modules) => {
                    res.json({ modules });
                }).sort({order: 1})
            }
        }
        const ops = req.body.modules.map(function (item) {
            return {
                "updateOne": {
                    "filter": {
                        "_id": ObjectId(item._id),
                    },
                    "update": { $set: { order: item.order } }
                }
            }
        });

        Module.collection.bulkWrite(ops, callback);

    } else {
        res.json({ errors });
    }
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    const name = req.body.name || '';

    const { isValid, errors } = checkForErrors({ name });
    
    if (isValid) {
        const updatedModule = {
            name: name
        };

        Module.findByIdAndUpdate(req.params.id, updatedModule, err => {
            if (err) throw err;
            else res.json({ success: 'success' });
        });
    } else {
        res.json({ errors });
    }
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
    console.log(req.params.id);
    Module.remove({ _id: req.params.id }, err => {
        res.json({ success: 'success' });
    });
});

module.exports = router;
