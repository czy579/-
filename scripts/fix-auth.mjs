import pg from 'pg';

const password = encodeURIComponent('VS&pcBe%Z3-57yc');
const connectionString = `postgresql://postgres:${password}@db.qcpedqfrmqyntcuwydir.supabase.co:5432/postgres`;
const client = new pg.Client({ connectionString });

async function main() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 创建触发器函数：用户注册时自动创建资料
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = ''
      AS $$
      BEGIN
        INSERT INTO public.profiles (id, username, display_name)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
          COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username', NEW.email)
        );
        RETURN NEW;
      END;
      $$;
    `);
    console.log('✅ 触发器函数 handle_new_user 已创建');

    // 删除旧触发器（如果存在）
    await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');

    // 创建触发器
    await client.query(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('✅ 触发器 on_auth_user_created 已创建');

    // 更新 profiles 表的 RLS 策略
    await client.query('DROP POLICY IF EXISTS "p_insert" ON profiles');
    await client.query('DROP POLICY IF EXISTS "p_select" ON profiles');
    await client.query('DROP POLICY IF EXISTS "p_update" ON profiles');

    // 用户注册后需要能 SELECT 自己的资料
    await client.query(`
      CREATE POLICY "p_select" ON profiles
        FOR SELECT USING (auth.uid() = id);
    `);

    // UPDATE 策略
    await client.query(`
      CREATE POLICY "p_update" ON profiles
        FOR UPDATE USING (auth.uid() = id);
    `);

    // INSERT 策略 - 允许触发器（SECURITY DEFINER）插入，同时允许已认证用户插入自己的记录
    await client.query(`
      CREATE POLICY "p_insert" ON profiles
        FOR INSERT WITH CHECK (
          auth.uid() = id
          OR auth.uid() IS NULL
        );
    `);

    console.log('✅ RLS 策略已更新');

    // 验证触发器存在
    const { rows } = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public' OR (event_object_schema = 'auth' AND event_object_table = 'users')
      ORDER BY event_object_table
    `);
    console.log('📋 当前触发器:');
    rows.forEach(r => console.log(`   - ${r.event_object_table}: ${r.trigger_name} (${r.event_manipulation})`));

    console.log('\n🎉 配置完成！现在注册时会自动在 profiles 表创建资料了。');

  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
