import type { ComponentProps, ReactNode } from "react";
import Board from "../../Board";
import StepPanel from "../StepPanel";
import { THEMES, type ThemeKey } from "../../../lib/constants";

interface PreviewBoardProps {
  gridSize: number;
  options: string[];
  includeFreeSpace: boolean;
  themeKey: ThemeKey;
  swap?: ComponentProps<typeof Board>["swap"];
  children?: ReactNode;
}

const PreviewBoard = ({ children, ...boardProps }: PreviewBoardProps) => (
  <StepPanel
    title="Live preview"
    aside={
      <span className="rounded-full bg-veil/5 px-3 py-1 text-xs font-medium text-mist-300 ring-1 ring-inset ring-veil/10">
        {THEMES[boardProps.themeKey].themeName}
      </span>
    }
  >
    <Board {...boardProps} />
    {children && <div className="mt-6">{children}</div>}
  </StepPanel>
);

export default PreviewBoard;
