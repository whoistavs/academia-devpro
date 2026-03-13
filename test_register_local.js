async function testRegister() {
    try {
        const randomId = Date.now();
        const response = await fetch('http://localhost:3000/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                username: 'testuser' + randomId,
                email: 'test' + randomId + '@example.com',
                password: 'Password123!',
                role: 'student',
                language: 'pt'
            })
        });
        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('DATA:', data);
    } catch (err) {
        console.error('ERROR:', err);
    }
}

testRegister();
