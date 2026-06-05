import { NextResponse } from 'next/server';

export async function GET() {
  // 只用 Supabase JS client 尝试添加列
  // 如果列已存在，不会报错
  const results: string[] = [];

  try {
    // 通过 REST API 的 PATCH 方法测试连接
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 使用 raw SQL 通过 Supabase 的 pg_dump 接口
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    });

    results.push(`REST API 状态: ${res.status}`);

    // 尝试通过 PostgreSQL 直接连接（使用 pg 模块）
    let pgAvailable = false;
    try {
      const pg = require('pg');
      const password = encodeURIComponent('VS%26pcBe%25Z3-57yc');
      const client = new pg.Client({
        connectionString: `postgresql://postgres:${password}@db.qcpedqfrmqntcuwydir.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      await client.connect();
      results.push('✅ 数据库直连成功');

      await client.query(`
        ALTER TABLE characters
        ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'female'
        CHECK (gender IN ('male', 'female'));
      `);
      results.push('✅ gender 列添加成功');

      await client.end();
    } catch (dbErr) {
      results.push(`❌ 直连失败: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({
      results,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
