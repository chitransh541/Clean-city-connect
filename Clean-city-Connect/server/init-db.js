import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  const { Client } = pg;
  
  const isCloudDB = !!process.env.DATABASE_URL;

  if (!isCloudDB) {
    const defaultClient = new Client({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      port: process.env.PGPORT || 5432,
    });

    try {
      await defaultClient.connect();
      const res = await defaultClient.query("SELECT datname FROM pg_catalog.pg_database WHERE datname = 'cleancity'");
      
      if (res.rowCount === 0) {
        console.log('Database cleancity not found, creating it...');
        await defaultClient.query('CREATE DATABASE cleancity');
        console.log('Database cleancity created successfully.');
      } else {
        console.log('Database cleancity already exists.');
      }
    } catch (err) {
      console.error('Error connecting or creating database:', err);
      process.exit(1);
    } finally {
      await defaultClient.end();
    }
  }

  const clientConfig = isCloudDB
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'cleancity',
        password: process.env.PGPASSWORD || 'postgres',
        port: process.env.PGPORT || 5432,
      };

  const cleancityClient = new Client(clientConfig);

  try {
    await cleancityClient.connect();
    
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema.sql...');
    await cleancityClient.query(schema);
    console.log('Schema created successfully.');
    
    // ─── Migrations for existing databases ───
    console.log('Running migrations...');
    
    // Add password_hash column
    await cleancityClient.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
    
    // Migrate media_url → photo_url + video_url
    const hasMediaUrl = await cleancityClient.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'complaints' AND column_name = 'media_url';
    `);
    if (hasMediaUrl.rowCount > 0) {
      console.log('Migrating media_url → photo_url...');
      await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photo_url TEXT;`);
      await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS video_url TEXT;`);
      // Copy existing media_url to photo_url for existing rows
      await cleancityClient.query(`UPDATE complaints SET photo_url = media_url WHERE photo_url IS NULL AND media_url IS NOT NULL;`);
      await cleancityClient.query(`ALTER TABLE complaints DROP COLUMN IF EXISTS media_url;`);
      console.log('media_url migrated to photo_url.');
    } else {
      await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photo_url TEXT;`);
      await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS video_url TEXT;`);
    }

    // Add labels, officer_note, rejected_at columns
    await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';`);
    await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS officer_note TEXT;`);
    await cleancityClient.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;`);
    
    // Make description nullable (AI generates it now)
    await cleancityClient.query(`ALTER TABLE complaints ALTER COLUMN description DROP NOT NULL;`);
    
    console.log('Migration complete.');

    // Create a default officer for testing
    const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'officer123';
    const adminPhoneRaw = process.env.ADMIN_PHONE || '+911234567890';
    
    if (!process.env.ADMIN_PASSWORD && isCloudDB) {
       console.warn('⚠️ WARNING: No ADMIN_PASSWORD set. Using default officer123. PLEASE CHANGE THIS.');
    }

    const officerPassword = await bcrypt.hash(adminPasswordRaw, 10);
    console.log(`Creating default officer account (phone: ${adminPhoneRaw})...`);
    await cleancityClient.query(`
      INSERT INTO users (name, phone, password_hash, role) 
      VALUES ('Admin Officer', $2, $1, 'officer') 
      ON CONFLICT (phone) DO UPDATE SET password_hash = $1;
    `, [officerPassword, adminPhoneRaw]);
    
  } catch (err) {
    console.error('Error running schema:', err);
    process.exit(1);
  } finally {
    await cleancityClient.end();
  }
}

initDB();
