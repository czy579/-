import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const password = encodeURIComponent('VS&pcBe%Z3-57yc');
const connectionString = `postgresql://postgres:${password}@db.qcpedqfrmqyntcuwydir.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString });

async function main() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 读取 schema 文件
    const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('🔧 启用 pgvector 扩展...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ pgvector 扩展已启用');

    console.log('📦 正在创建数据库表...');
    await client.query(sql);
    console.log('✅ 所有表创建成功！');

    // 验证
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 已创建的表:');
    rows.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
