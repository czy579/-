'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">创建账号</h1>
        <p className="text-gray-400 text-sm">开始你的 AI 伴侣之旅</p>
      </CardHeader>

      <CardContent>
        <RegisterForm />

        <p className="mt-6 text-center text-sm text-gray-400">
          已有账号？{' '}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            立即登录
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
