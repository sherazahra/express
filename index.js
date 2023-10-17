const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')


const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({ extended: false}));
app.use(bodyPs.json());
app.use(cors())


const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public')))


const mhsRouter = require('./routes/mahasiswa');
app.use('/api/mhs', mhsRouter);

const jurusanRouter = require('./routes/jurusan');
app.use('/api/jurusan', jurusanRouter);

app.listen(port, () => {
    console.log(`aplikasi berjalan di http:://localhost:${port}`)
})
