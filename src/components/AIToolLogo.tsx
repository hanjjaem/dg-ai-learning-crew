'use client';

import React from 'react';
import { AIToolType } from '@/lib/types';
import { Bot } from 'lucide-react';

interface AIToolLogoProps {
  tool: AIToolType;
  className?: string;
}

export default function AIToolLogo({ tool, className = 'w-10 h-10' }: AIToolLogoProps) {
  const getToolConfig = () => {
    switch (tool) {
      case 'ChatGPT':
        return {
          src: '/logos/chatgpt.svg',
          bgClass: 'bg-[#10A37F]/10 border-[#10A37F]/20',
          alt: 'OpenAI ChatGPT 공식 로고',
        };
      case 'Claude':
        return {
          src: '/logos/claude.svg',
          bgClass: 'bg-[#D97757]/10 border-[#D97757]/20',
          alt: 'Anthropic Claude 공식 로고',
        };
      case 'Gemini':
        return {
          src: '/logos/gemini.svg',
          bgClass: 'bg-[#4E95FF]/10 border-[#4E95FF]/20',
          alt: 'Google Gemini 공식 로고',
        };
      case 'Perplexity':
        return {
          src: '/logos/perplexity.svg',
          bgClass: 'bg-[#20B8CD]/10 border-[#20B8CD]/20',
          alt: 'Perplexity AI 공식 로고',
        };
      default:
        return null;
    }
  };

  const config = getToolConfig();

  if (config) {
    return (
      <div
        className={`${className} rounded-xl border ${config.bgClass} flex items-center justify-center shrink-0 shadow-2xs p-2 transition-all duration-200`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.src}
          alt={config.alt}
          className="w-full h-full object-contain select-none pointer-events-none"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center shrink-0 shadow-2xs`}
    >
      <Bot className="w-5 h-5" />
    </div>
  );
}
