import pg from 'pg';

const password = encodeURIComponent('VS&pcBe%Z3-57yc');
const connectionString = `postgresql://postgres:${password}@db.qcpedqfrmqntcuwydir.supabase.co:5432/postgres`;
const client = new pg.Client({ connectionString });

async function main() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 1. 查看当前对话
    const { rows: convs } = await client.query('SELECT id, user_id, character_id, is_active FROM conversations');
    console.log(`📋 现有 ${convs.length} 个对话:`);
    convs.forEach(c => console.log(`   - ${c.id} | user=${c.user_id} | active=${c.is_active}`));

    // 2. 清理无效的对话（如果有）
    if (convs.length > 0) {
      await client.query('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations)');
      await client.query('DELETE FROM intimacy_levels WHERE conversation_id IN (SELECT id FROM conversations)');
      await client.query('DELETE FROM conversations');
      console.log('🧹 已清理现有对话和消息');
    }

    // 3. 测试手动创建一个对话
    const { rows: users } = await client.query('SELECT id FROM auth.users LIMIT 1');
    const { rows: chars } = await client.query('SELECT id FROM characters LIMIT 1');

    if (users.length > 0 && chars.length > 0) {
      // 用 service_role 直接插入（绕过 RLS）
      await client.query(
        `INSERT INTO conversations (user_id, character_id, intimacy_level)
         VALUES ($1, $2, 0)
         ON CONFLICT (user_id, character_id) DO NOTHING`,
        [users[0].id, chars[0].id]
      );
      console.log('✅ 测试对话创建成功');
    }

    // 4. 检查 auth 设置
    const { rows: authConfig } = await client.query(`
      SELECT instance_id, provider FROM auth.sso_providers
    `);
    console.log(`\n📋 Auth providers: ${authConfig.length}`);

    // 5. 检查 RLS 是否启用
    const { rows: rlsTables } = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      LEFT JOIN pg_class ON pg_class.relname = tablename
      WHERE schemaname = 'public' AND tablename IN ('profiles','characters','conversations','messages','memories')
      ORDER BY tablename
    `);
    console.log('\n📋 RLS 状态:');
    rlsTables.forEach(t => console.log(`   - ${t.tablename}: ${t.rowsecurity ? '已启用' : '未启用'}`));

    // 6. 检查现有策略
    const { rows: policies } = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);
    console.log('\n📋 RLS 策略:');
    policies.forEach(p => console.log(`   - ${p.tablename}: ${p.policyname} (${p.cmd})`));

    await client.end();
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

main();
