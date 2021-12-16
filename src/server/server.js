const express = require('express');
let PORT_NUMBER = 3000;

const server = express();

server.use(express.static('src/client-side'));

server.listen(PORT_NUMBER, () => {
    console.log(`Server started on port ${PORT_NUMBER}`);
});

