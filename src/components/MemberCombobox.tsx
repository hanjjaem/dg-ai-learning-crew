'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, User } from 'lucide-react';
import { CrewMember } from '@/lib/types';

interface MemberComboboxProps {
  members: CrewMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  label?: string;
  className?: string;
}

export default function MemberCombobox({
  members,
  selectedMemberId,
  onSelectMember,
  label,
  className = '',
}: MemberComboboxProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 열릴 때 검색창 자동 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // 검색 필터링 (이름 또는 부서)
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          {label}
        </label>
      )}

      {/* 닫힌 상태의 커스텀 트리거 (피드백 명시 높이 48px, radius 10px) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 focus:outline-hidden focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {selectedMember?.name?.slice(0, 1) || '나'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 truncate">
              {selectedMember?.name}
              {selectedMember?.role === 'admin' && (
                <span className="ml-1 text-[10px] text-zinc-500 font-medium">(총무)</span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              {selectedMember?.department}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-zinc-700' : ''
          }`}
        />
      </button>

      {/* 열렸을 때의 커스텀 Combobox 팝오버 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-zinc-200/90 rounded-2xl shadow-xl overflow-hidden animate-fade-in p-1.5">
          {/* 상단: 이름 또는 부서 검색 입력창 */}
          <div className="relative mb-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="이름 또는 부서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-900 transition-colors"
            />
          </div>

          {/* 15명 크루원 목록 (44px 이상 행 높이, 부드러운 호버 & 체크) */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredMembers.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                일치하는 크루원이 없습니다.
              </div>
            ) : (
              filteredMembers.map((m) => {
                const isSelected = m.id === selectedMemberId;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMember(m.id);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-100/90 text-zinc-900 font-bold'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {m.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-snug">
                          {m.name}
                          {m.role === 'admin' && (
                            <span className="ml-1 text-[10px] text-zinc-500 font-normal">
                              (총무)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-normal leading-none mt-0.5">
                          {m.department}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-zinc-900 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
