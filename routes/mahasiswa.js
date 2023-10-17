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

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Jenis file tidak diizinkan'), false);
    }
};

const upload = multer({storage: storage, fileFilter: fileFilter})

router.get('/', function (req, res){
    connection.query('SELECT a.nama, b.nama_jurusan as jurusan, a.gambar, a.swa_foto ' +
    ' from mahasiswa a join jurusan b' +
    ' on b.id_j=a.id_jurusan ORDER BY a.id_m DESC ', function(err, rows){
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

router.post('/store', upload.fields([{name: 'gambar', maxCount: 1}, {name: 'swa_foto',maxCount: 1}]), [
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
        gambar: req.files.gambar[0].filename, 
        swa_foto: req.files.swa_foto[0].filename 
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

router.patch('/update/(:id)',upload.fields([{ name: 'gambar', maxCount: 1 }, { name: 'swa_foto', maxCount: 1 }]), [
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
    let gambar = req.files['gambar'] ? req.files['gambar'][0].filename : null;
    let swa_foto = req.files['swa_foto'] ? req.files['swa_foto'][0].filename : null;
    
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
        const gambarLama = rows[0].gambar; 
        const swa_FotoLama = rows[0].swa_foto;

        if (gambarLama && gambar){
            const pathGambar = path.join(__dirname, '../public', gambarLama); 
            fs.unlinkSync(pathGambar);
        }
        if(swa_FotoLama && swa_foto){
            const pathSwaFoto = path.join(__dirname, '../public', swa_FotoLama); 
            fs.unlinkSync(pathSwaFoto);
        }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.jurusan,
        gambar: gambar,
        swa_foto: swa_foto
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
router.delete("/delete/(:id)", function (req, res) {
    let id = req.params.id;
  
    connection.query(
      `select * from mahasiswa where id_m = ${id}`,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "server error",
          });
        }
        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            message: "not found",
          });
        }
        const namaFileLama = rows[0].gambar;
        if (namaFileLama) {
          const patchFileLama = path.join(
            __dirname,
            "../public",
            namaFileLama
          );
          fs.unlinkSync(patchFileLama);
        }
        connection.query(
          `delete from mahasiswa where id_m = ${id}`,
          function (err, rows) {
            if (err) {
              return res.status(500).json({
                status: false,
                message: "server error",
              });
            } else {
              return res.status(200).json({
                status: true,
                message: "data berhasil dihapus",
              });
            }
          }
        );
      }
    );
  });
module.exports = router;