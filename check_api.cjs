
const https = require('https');

https.get('https://devpro-backend.onrender.com/api/courses', (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Body:', data.substring(0, 500)); // First 500 chars
    });
}).on('error', (e) => {
    console.error(e);
});
