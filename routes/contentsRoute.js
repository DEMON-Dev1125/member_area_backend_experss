const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const isAuthenticated = require('./../middlewares/auth.js')
const Content = require('../models/contentsModel.js');

let router = express.Router();

const checkForErrors = ({ title, module }) => {
    let errors = {};
    let isValid = false;
    if (title === '') {
        errors = { ...errors, title: 'This field is required' }
    }
    if (module === '') {
        errors = { ...errors, module: 'This field is required' }
    }
    if (Object.keys(errors).length > 0) {
        return { isValid, errors };
    }
    isValid = true;
    return { isValid, errors };
}



router.get('/', (req, res) => {
    Content.find({}, (err, contents) => {
        res.json({ contents });
    }).sort({ order: 1 })
});

router.get('/:id', (req, res) => {
    Content.findById(req.params.id, (err, content) => {
        if (err) throw err;
        res.json({ content });
    }).populate('module')
});

router.post('/add', isAuthenticated, async (req, res) => {
    const title = req.body.title || '';
    const module = req.body.module || '';
    const text = req.body.text || '';
    const videolink = req.body.videolink || '';
    const comment = req.body.comment || false;
    let orderValue = 0;

    console.log(req.body);
    const { isValid, errors } = checkForErrors({ title, module });
    const max = await Content.find({}).sort({ order: -1 }).limit(1);
    if (max.length > 0) {
        orderValue = max[0].order + 1;
    }

    if (isValid) {
        const newContent = new Content({
            title: title,
            module: new ObjectId(module),
            text: text,
            videolink: videolink,
            comment: comment,
            order: orderValue
            // authorId: new ObjectId(authorId)
        });

        newContent.save((err) => {
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
    if (req.body.contents) {
        const callback = function (err, r) {
            if (err) throw err;
            else res.json({ success: 'success' });
        }
        const ops = req.body.contents.map(function (item) {
            return {
                "updateOne": {
                    "filter": {
                        "_id": ObjectId(item._id),
                    },
                    "update": { $set: { order: item.order } }
                }
            }
        });

        Content.collection.bulkWrite(ops, callback);

    } else {
        res.json({ errors });
    }
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    const title = req.body.title || '';
    const module = req.body.module || '';
    const text = req.body.text || '';
    const videolink = req.body.videolink || '';
    const comment = req.body.comment || false;

    const { isValid, errors } = checkForErrors({ title, module });

    if (isValid) {
        const updatedContent = {
            title: title,
            module: new ObjectId(module),
            text: text,
            videolink: videolink,
            comment: comment,
        };

        Content.findByIdAndUpdate(req.params.id, updatedContent, err => {
            if (err) throw err;
            else res.json({ success: 'success' });
        });
    } else {
        res.json({ errors });
    }
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
    Content.remove({ _id: req.params.id }, err => {
        res.json({ success: 'success' });
    });
});

module.exports = router;
