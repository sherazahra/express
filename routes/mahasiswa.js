const express = require('express');
const router = express.Router();

const {body, validationResult } = require('express-validator');

const connection = require('../config/db.js');

router.get('/', function (req, res){
    connection.query('select * from mahasiswa order by id_m desc', function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
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

router.post('/store', [
    body('nama').notEmpty(),
    body('nrp').notEmpty()
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        })
    }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp
    }
    connection.query('insert into mahasiswa set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else{
            return res.status(201).json({
                satus: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})
module.exports = router;