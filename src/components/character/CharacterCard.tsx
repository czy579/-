'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PERSONALITY_OPTIONS } from '@/types/character';
import type { Character } from '@/types/database';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const router = useRouter();
  const personalityInfo = PERSONALITY_OPTIONS.find(
    (p) => p.value === character.personality,
  );

  return (
    <Card
      hover
      onClick={() => router.push(`/characters/${character.id}/chat`)}
      className="group"
    >
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar
            alt={character.name}
            size="lg"
            fallback={character.name[0]}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white truncate">
                {character.name}
              </h3>
              {personalityInfo && (
                <span className="text-sm">{personalityInfo.emoji}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              {personalityInfo && (
                <Badge variant="info" size="sm">
                  {personalityInfo.label}
                </Badge>
              )}
              {character.traits?.slice(0, 2).map((trait) => (
                <Badge key={trait} variant="default" size="sm">
                  {trait}
                </Badge>
              ))}
            </div>

            {character.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {character.description}
              </p>
            )}
          </div>

          {/* 箭头指示 */}
          <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
