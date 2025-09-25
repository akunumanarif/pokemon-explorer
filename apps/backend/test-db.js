const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password123',
  database: 'pokemon_db',
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT current_user, current_database()');
    console.log('Query result:', result.rows[0]);
    
    await client.end();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();