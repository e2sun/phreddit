// demonstrate that the webserver is listening on port 8000
const axios = require('axios');
const app = require('./server');

describe('listening', () => {
    let server;

    beforeAll(async () => {
        server = app.listen(8000, () => console.log("Server listening on port 8000..."));
    });

    afterAll(async() => {
        if(server){
            server.close();
        }
    });

    test('should be listening on port 8000', async() => {
        const response = await axios.get('http://localhost:8000/');
        expect(response.status).toBe(200);
    });
});