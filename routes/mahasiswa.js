const express = require('express');
const router = express.Router();

const {body, validationResult } = require('express-validator');

const connection = require('../config/db.js');
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

router.get('/', function (req, res){
    connection.query('select a.nama, b.nama_jurusan as jurusan from mahasiswa a join jurusan b on b.id_j=a.id_jurusan order by a.id_m desc', function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
                error: err
            })
        }else{
            return res.status(200).json({
                status: true,
                message: 'Data Mahasiswa',
                data: rows
            })
        }
    })
});

router.post('/store', upload.single("gambar"), [
    body('nama').notEmpty(),
    body('nrp').notEmpty(),  
    body('jurusan').notEmpty()  
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.jurusan,
        gambar: req.file.filename
    }
    connection.query('INSERT INTO mahasiswa SET ?', Data, function(err, result){
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: Data 
            })
        }
    })
})


router.get('/(:id)', function (req, res) {
    let id = req.params.id;
    connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }
        else{
            return res.status(200).json({
                status: true,
                message: 'Data Mahasiswa',
                data: rows[0]
            })
        }
    })
})

router.patch('/update/(:id)',upload.single("gambar"), [
    body('nama').notEmpty(),
    body('nrp').notEmpty(),
    body('jurusan').notEmpty()
], (req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let id = req.params.id;
    let gambar = req.file ? req.file.filename : null;
    
    connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }
        const namaFileLama = rows[0].gambar;

        if (namaFileLama && gambar) {
            const pathFileLama = path.join(__dirname, '../public', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.jurusan,
        gambar: gambar
    }
    connection.query(`update mahasiswa set ? where id_m = ${id}`, Data, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else {
            return res.status(200).json({
                status: true,
                message: 'Update Success..!'
            })
        }
    })
})
})
router.delete('/delete/:id',function(req, res){
    let id = req.params.id;
    connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server eror',
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                staus: false,
                message: 'not Found',
            })
        }
        const namaFileLama = rows[0].gambar;

        if(namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }
    connection.query(`delete from mahasiswa where id_m = ${id}`, function (err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server failed', 
            })
        }else{
            return res.status(200).json({
                status: true,
                message: 'Data Berhasil Dihapus',
            })
        }
    })
})
})
module.exports = router;