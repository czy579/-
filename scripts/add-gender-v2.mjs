// 通过 Supabase REST API 添加 gender 列
// 使用 service_role key 直接操作数据库

const SUPABASE_URL = 'https://qcpedqfrmqntcuwydir.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGVkcWZybXF5bnRjdXd5ZGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY3MjU4MCwiZXhwIjoyMDk2MjQ4NTgwfQ.OiOop_vF7DSwBzufF9dPo46ZPehZ69hpGjhCokVlhu8';

async function main() {
  try {
    // 方法1：尝试通过 pg_dump 风格的 SQL API
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });
    console.log('REST API 状态:', res.status);

    // 方法2：直接 ALTER TABLE 通过 service_role (如果 REST API 支持)
    // Supabase 的 REST API 不支持 DDL，所以改用直接 PostgreSQL 连接
    // 或者用 Management API

    // 方法3：尝试 Supabase Management API
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/qcpedqfrmqntcuwydir/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'female' CHECK (gender IN ('male', 'female'));`
      }),
    });
    console.log('Management API 状态:', mgmtRes.status);
    if (!mgmtRes.ok) {
      const err = await mgmtRes.text();
      console.log('Management API 返回:', err);
    } else {
      console.log('✅ gender 列添加成功！');
      process.exit(0);
    }

    // 方法4：用 pg 再次尝试直连（等连接池释放）
    console.log('\n等待连接池释放...');
    await new Promise(r => setTimeout(r, 5000));

    const pg = (await import('pg')).default;
    const password = encodeURIComponent('VS&pcBe%Z3-57yc');
    const client = new pg.Client({
      connectionString: `postgresql://postgres:${password}@db.qcpedqfrmqntcuwydir.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    await client.connect();
    console.log('✅ 直连成功');

    await client.query(`
      ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'female' CHECK (gender IN ('male', 'female'));
    `);
    console.log('✅ gender 列已添加');

    await client.end();

  } catch (err) {
    console.error('❌:', err.message);
    process.exit(1);
  }
}

main();
