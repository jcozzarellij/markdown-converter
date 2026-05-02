import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface TooltipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  children: ReactNode;
}

export function TooltipButton({ label, shortcut, children, className, ...props }: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <button className={className} {...props}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{label}</span>
        {shortcut && (
          <kbd className="ml-1.5 px-1 py-0.5 rounded text-[10px] font-mono bg-[#262626] text-gray-500 border border-[#404040]">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}