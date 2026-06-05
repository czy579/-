import pg from 'pg';

const password = encodeURIComponent('VS&pcBe%Z3-57yc');
const connectionString = `postgresql://postgres:${password}@db.qcpedqfrmqyntcuwydir.supabase.co:5432/postgres`;
const client = new pg.Client({ connectionString });

async function main() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 查找在 auth.users 中存在但没有 profile 的用户
    const { rows: missingProfiles } = await client.query(`
      SELECT au.id, au.email, au.raw_user_meta_data
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.id = au.id
      WHERE p.id IS NULL
    `);

    if (missingProfiles.length === 0) {
      console.log('✅ 所有用户已有 profile，没有问题');
    } else {
      console.log(`📋 发现 ${missingProfiles.length} 个用户缺少 profile:`);
      for (const user of missingProfiles) {
        const meta = user.raw_user_meta_data || {};
        const username = meta.username || user.email.split('@')[0];
        const displayName = meta.display_name || username;

        await client.query(
          `INSERT INTO public.profiles (id, username, display_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO NOTHING`,
          [user.id, username, displayName]
        );
        console.log(`   ✅ 已创建: ${user.email} -> ${username}`);
      }
    }

    // 验证所有用户都有 profile
    const { rows: allProfiles } = await client.query(`
      SELECT au.email, p.username
      FROM auth.users au
      JOIN public.profiles p ON p.id = au.id
    `);
    console.log(`\n📋 当前所有用户资料:`);
    allProfiles.forEach(p => console.log(`   - ${p.email} (${p.username})`));

  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
