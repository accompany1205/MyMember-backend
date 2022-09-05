const express = require("express");
const router = express.Router();
const cors = require("cors")

const {getForms, 
       getForm,
       updateFormData,
       updateFormSettings, 
       deleteForm,
       moveToTrash,
       processForm, 
       createForm,
       markAsFavourite,
       getFavourites,
       storeForm,
       loadForm,
       favouriteForm,
       archiveForm
    } = require("../../controllers/builder/builder")

router.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * @swagger
 * /api/forms/test:
 *   get:
 *     description: api test
 */
router.get('/test', (req,res)=>{
    res.json({
        success: false,
        message: "API Test Successful"
    })
})

/**
 * @swagger
 * /api/forms/process/newstudent:
 *   get:
 *     description: process form
 */
 router.get('/process/newstudent/:id/:userId', processForm)

/**
 * @swagger
 * /api/forms/new:
 *   post:
 *     summary: creates new form
 *     description: creates new form
 *     requestBody:
 *       descripton: Body for the new form
 *     responses:
 *       200:
 *         description: Created
 */
router.post('/new', createForm)

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: get all forms
 *     description: fetch all forms
 *     responses:
 *       200:
 *         description: Fetch forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArrayOfForms'
 */
router.get('/', getForms)

/**
 * @swagger
 * /api/forms/update:
 *   patch:
 *     summary: update form
 *     description: update specific form
 *     parameters:
 *       - in: id
 *         name: formId
 *         schema: 
 *           type: string
 *         required: true
 *         description: ID of the form to update
 *     responses:
 *       200:
 *         descripton: update form
 */
router.patch('/update/settings/:id', updateFormSettings)

/**
 * @swagger
 * /api/forms/update:
 *   patch:
 *     summary: update form
 *     description: update specific form
 *     parameters:
 *       - in: id
 *         name: formId
 *         schema: 
 *           type: string
 *         required: true
 *         description: ID of the form to update
 *     responses:
 *       200:
 *         descripton: update form
 */
 router.patch('/update/data/:id', updateFormData)

 
 //router.patch('/favourite/:id', favouriteForm)

 router.patch('/archive/:id', archiveForm)
 

/**
 * @swagger
 * /api/forms/delete:
 *   delete:
 *     summary: delete specific form
 *     description: delete specific form
 *     parameters:
 *       - in: id
 *         name: formId
 *         schema:
 *           type: String
 *         required: true
 *         descripton: ID of the form to delete
 */
router.delete('/delete/:id', deleteForm)

/**
 * @swagger
 * /api/forms/trash/:id:
 *   patch:
 *     summary: move form to trash
 *     description: move form to trash
 *     parameters:
 *       - in: id
 *         name: formId
 *         schmema:
 *           type: String
 *         required: true
 */
router.patch('/trash/:id', moveToTrash)


/**
 * @swagger
 * /api/forms/favourite/new:
 *   patch:
 *     summary: mark form as favourite
 *     description: mark form as favourite
 *     parameters:
 *       - in: id
 *         name: formId
 *         schmema:
 *           type: String
 *         required: true
 */
router.patch('/favourite/:id', markAsFavourite)

/**
 * @swagger
 * /api/forms/favourites:
 *   get:
 *     summary: mark form as favourite
 *     description: mark form as favourite
 *     parameters:
 *       - in: id
 *         name: formId
 *         schmema:
 *           type: String
 *         required: true
 */
 router.post('/favourites', getFavourites)

/**
 * @swagger
 * /api/forms/store:
 *   get:
 *     summary: store form
 *     description: store form
 */
 router.post('/store/:id', storeForm)

/**
 * @swagger
 * /api/forms/load:
 *   get:
 *     summary: load form
 *     description: load form
 */
 router.get('/load/:id', loadForm)

/**
 * @swagger
 * /api/form/:id:
 *   get:
 *     summary: get form with id
 *     description: fetch form with ID :id
 *     responses:
 *       200:
 *         description: Fetch form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArrayOfForms'
 */
router.get('/:id', getForm)


module.exports = router;
