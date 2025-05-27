const db = require('../config/database');

beforeAll((done) => {
    // Wait for database initialization
    setTimeout(() => {
        done();
    }, 500);
});

afterAll((done) => {
    db.close(() => {
        done();
    });
});