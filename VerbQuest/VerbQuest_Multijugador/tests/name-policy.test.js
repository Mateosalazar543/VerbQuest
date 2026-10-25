'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateName } = require('../public/name-policy');
const { GameService } = require('../engine');
const { server } = require('../server');

test('Permite nombres legitimos', () => {
  for (const name of [
    'Ana María',
    'José-24',
    'Maricarmen',
    'Computadora',
    'Scunthorpe',
    'Perro',
    'Student 0'
  ]) {
    assert.equal(validateName(name).ok, true, name);
  }
});

test('Bloquea groserias y evasiones', () => {
  for (const name of [
    'P3rro.hp',
    'HP2026',
    'h.p',
    'P.U.T.A',
    'P Ú T 4',
    'puta99',
    'm1erd4',
    'f.u.c.k',
    'fuuuck',
    'hijueputa',
    'Admin2026',
    'VerbQuestOficial',
    'example.com'
  ]) {
    assert.equal(
      validateName(name).code,
      'NAME_BLOCKED',
      name
    );
  }
});

test('Distingue errores de formato', () => {
  for (const name of [
    'A',
    '',
    'x'.repeat(23),
    '👻',
    'Ana\u200b'
  ]) {
    assert.equal(
      validateName(name).code,
      'NAME_INVALID',
      name
    );
  }
});

test('Protege al administrador y jugador', () => {
  const svc = new GameService();

  assert.throws(
    () => svc.create({ name: 'P3rro.hp' }),
    /no permitido/
  );

  assert.equal(svc.rooms.size, 0);

  const host = svc.create({
    name: 'Profe Ana',
    capacity: 10
  });

  assert.equal(
    svc.room(host.code).admin.name,
    'Profe Ana'
  );

  assert.throws(
    () => svc.join({
      code: host.code,
      name: 'M1erda'
    }),
    /no permitido/
  );

  assert.equal(
    svc.room(host.code).players.length,
    0
  );

  svc.join({
    code: host.code,
    name: 'Luis 25'
  });

  assert.equal(
    svc.room(host.code).players[0].name,
    'Luis 25'
  );
});

test('La API rechaza insultos y sirve multimedia', async () => {
  await new Promise(resolve =>
    server.listen(0, '127.0.0.1', resolve)
  );

  try {
    const origin =
      `http://127.0.0.1:${server.address().port}`;

    const response = await fetch(origin + '/api/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'P3rro.hp',
        capacity: 10,
        duration: 3
      })
    });

    assert.equal(response.status, 400);

    const result = await response.json();

    assert.equal(result.code, 'NAME_BLOCKED');

    for (const [filename, mime] of [
      ['freddy-jumpscare.gif', 'image/gif'],
      ['freddy-jumpscare.mp3', 'audio/mpeg']
    ]) {
      const asset = await fetch(
        origin + '/assets/' + filename
      );

      assert.equal(asset.status, 200, filename);
      assert.equal(
        asset.headers.get('content-type'),
        mime
      );
    }
  } finally {
    server.closeAllConnections();

    if (server.listening) {
      await new Promise(resolve => server.close(resolve));
    }
  }
});
