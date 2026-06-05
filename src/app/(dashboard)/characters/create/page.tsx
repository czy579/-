'use client';

import { CharacterCreator } from '@/components/character/CharacterCreator';

export default function CreateCharacterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">创建 AI 伴侣</h1>
        <p className="text-gray-400">打造一个独一无二的虚拟伴侣</p>
      </div>

      <CharacterCreator />
    </div>
  );
}
