const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  // Generate with $2a$ prefix (bcrypt rounds using genSaltSync)
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('senha123', salt);
  console.log('New hash:', hash);
  console.log('Prefix:', hash.slice(0,4));
  console.log('Verify:', bcrypt.compareSync('senha123', hash));

  const client = new Client({ host:'localhost', port:5433, user:'minhavenda', password:'minhavenda', database:'minhavenda' });
  await client.connect();
  const r = await client.query('UPDATE usuarios SET senha = $1 RETURNING email, tipo', [hash]);
  console.log('Updated:', JSON.stringify(r.rows));
  await client.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
