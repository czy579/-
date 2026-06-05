import pg from 'pg';

const password = encodeURIComponent('VS&pcBe%Z3-57yc');
const client = new pg.Client({
  connectionString: `postgresql://postgres:${password}@db.qcpedqfrmqntcuwydir.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function main() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 添加 gender 列
    await client.query(`
      ALTER TABLE characters
      ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'female'
      CHECK (gender IN ('male', 'female'));
    `);
    console.log('✅ gender 列已添加到 characters 表');

    // 更新现有角色的性别（可选）
    const { rowCount } = await client.query(
      `UPDATE characters SET gender = 'female' WHERE gender IS NULL`
    );
    if (rowCount > 0) {
      console.log(`✅ 已更新 ${rowCount} 个现有角色的性别为女`);
    }

    console.log('🎉 数据库迁移完成');
    await client.end();
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

main();
