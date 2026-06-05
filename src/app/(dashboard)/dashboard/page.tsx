'use client';

import { useRouter } from 'next/navigation';
import { useCharacters } from '@/hooks/useCharacters';
import { CharacterCard } from '@/components/character/CharacterCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { characters, isLoading, error } = useCharacters();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">我的 AI 伴侣</h1>
          <p className="text-gray-400">管理你的 AI 虚拟伴侣</p>
        </div>
        <Button onClick={() => router.push('/characters/create')}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          创建新角色
        </Button>
      </div>

      {/* 角色列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">😵</div>
          <h3 className="text-lg font-medium text-white mb-2">加载失败</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </Card>
      ) : characters.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-6xl mb-6">💕</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              还没有创建 AI 伴侣
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              创建一个属于你的 AI 虚拟伴侣，选择性格、设定背景故事，开启一段独特的陪伴之旅。
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/characters/create')}
            >
              创建我的第一个伴侣
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}
    </div>
  );
}
