const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const isAuthenticated = require('./../middlewares/auth.js')
const Course = require('../models/coursesModel.js');

let router = express.Router();

const checkForErrors = ({ title, author, body }) => {
    let errors = {};
    let isValid = false;
    if (title === '') {
        errors = { ...errors, title: 'This field is required' }
    }
    if (author === '') {
        errors = { ...errors, author: 'This field is required' }
    }
    if (body === '') {
        errors = { ...errors, body: 'This field is required' }
    }

    if (Object.keys(errors).length > 0) {
        return { isValid, errors };
    }
    isValid = true;
    return { isValid, errors };
}



router.get('/', (req, res) => {
    Course.find({}, (err, courses) => {
        res.json({ courses });
    })
});

router.get('/:id', (req, res) => {
    Course.findById(req.params.id, (err, course) => {
        if (err) throw err;
        res.json({ course });
    })
});

router.post('/add', isAuthenticated, (req, res) => {
    const name = req.body.name || '';
    const acronym = req.body.acronym || '';
    const pageURL = req.body.pageURL || '';
    const description = req.body.description || '';
    const commentModeration = req.body.commentModeration || '';

    // const { isValid, errors } = checkForErrors({ title, author, body });

    // if (isValid) {
    //     const newCourse = new Course({
    //         title: title,
    //         author: author,
    //         body: body,
    //         authorId: new ObjectId(authorId)
    //     });

    //     newCourse.save((err) => {
    //         if (err) throw err;
    //         else {
    //             res.json({ success: 'success' });
    //         }
    //     });
    // } else {
    //     res.json({ errors });
    // }
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    // const title = req.body.title || '';
    // const author = req.body.author || '';
    // const body = req.body.body || '';
    // const authorId = req.authorId;

    // const { isValid, errors } = checkForErrors({ title, author, body });

    // if (isValid) {
    //     const updatedCourse = {
    //         title: req.body.title,
    //         author: req.body.author,
    //         body: req.body.body,
    //         authorId: new ObjectId(authorId)
    //     };

    //     Course.findByIdAndUpdate(req.params.id, updatedCourse, err => {
    //         if (err) throw err;
    //         else res.json({ success: 'success' });
    //     });
    // } else {
    //     res.json({ errors });
    // }
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
    Course.remove({_id: req.params.id}, err => {
        res.json({ success: 'success' });
    });
});

module.exports = router;
