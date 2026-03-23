const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const client = new Client({ host:'localhost', port:5433, user:'minhavenda', password:'minhavenda', database:'minhavenda' });
client.connect().then(async () => {
  const r = await client.query("SELECT email, tipo, LEFT(senha,30) as hash_prefix FROM usuarios WHERE email IN ('admin@loja.com','joao.silva@email.com')");
  console.log(JSON.stringify(r.rows));
  // Also verify the hash matches
  const r2 = await client.query("SELECT senha FROM usuarios WHERE email = 'admin@loja.com'");
  const hash = r2.rows[0]?.senha;
  const match = await bcrypt.compare('senha123', hash);
  console.log('bcrypt match for senha123:', match, '| hash prefix:', hash?.slice(0,20));
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
