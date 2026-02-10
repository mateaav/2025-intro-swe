const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
let id1, id2, id3;

app.use(express.json());
const voznjeRouter = require('../routes/voznje');
app.use('/voznje', voznjeRouter);
const validToken = jwt.sign({ id: 11, email: 'test@example.com' }, 'tajni_kljuc', { expiresIn: '1h' });

describe('Vožnje API', () => {

  it('should create a new vožnja (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        instruktor_email: 'ivan.horvat@example.com',
        polaznik_email: 'marko@example.com',
        termin: '2025-01-22T08:00:00',
        trajanje: '01:00:00',
        lokacija: 'Zagreb',
        status: 0
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    id1 = response.body.id;
    expect(response.body).toHaveProperty('instruktor_email', 'ivan.horvat@example.com');
  });

  it('should create a vožnja with status 1 (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        instruktor_email: 'ana.kovacic@example.com',
        polaznik_email: 'petar@example.com',
        termin: '2025-01-23T10:00:00',
        trajanje: '02:00:00',
        lokacija: 'Split',
        status: 1
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    id2 = response.body.id;
    expect(response.body).toHaveProperty('status', 1);
  });

  it('should fetch all vožnje (GET)', async () => {
    const response = await request(app)
      .get('/voznje')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should fetch vožnja by ID (GET)', async () => {
    const response = await request(app)
      .get(`/voznje/${id1}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', id1);
    expect(response.body).toHaveProperty('instruktor_email', 'ivan.horvat@example.com');
  });

  
  it('should return error when instruktor_email is missing (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        polaznik_email: 'janko@example.com',
        termin: '2025-01-24T12:00:00',
        trajanje: '01:30:00',
        lokacija: 'Osijek',
        status: 0
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Sva polja su obavezna.');
  });


  it('should return error when trajanje is missing (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        instruktor_email: 'marko.j@example.com',
        polaznik_email: 'lucija@example.com',
        termin: '2025-01-26T15:00:00',
        lokacija: 'Pula',
        status: 0
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Sva polja su obavezna.');
  });

  it('should create a vožnja with all fields (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        instruktor_email: 'ivan.horvat@example.com',
        polaznik_email: 'petar@example.com',
        termin: '2025-01-30T09:00:00',
        trajanje: '02:00:00',
        lokacija: 'Zagreb',
        status: 0
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('instruktor_email', 'ivan.horvat@example.com');
  });

  it('should return error when instruktor_email is invalid (POST)', async () => {
    const response = await request(app)
      .post('/voznje')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        instruktor_email: 'invalid-email',
        polaznik_email: 'marko@example.com',
        termin: '2025-01-31T10:00:00',
        trajanje: '01:30:00',
        lokacija: 'Split',
        status: 0
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Neispravan instruktor email.');
  });

  it('should delete vožnja by id (DELETE)', async () => {
    const response = await request(app)
      .delete(`/voznje/${id1}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Lekcija je obrisana.');
  });

  it('should return error when trying to delete non-existing vožnja (DELETE)', async () => {
    const response = await request(app)
      .delete(`/voznje/9999999`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Lekcija nije pronađena.');
  });

});
