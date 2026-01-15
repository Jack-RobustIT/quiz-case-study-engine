import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

const Tooltip = ({ children, content, className, side = "top" }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (side === "bottom") {
        setPosition({
          top: rect.bottom + 8, // 8px below the button
          left: rect.left + rect.width / 2, // Center of the button
        });
      } else {
        setPosition({
          top: rect.top - 8, // 8px above the button (mb-2 = 0.5rem = 8px)
          left: rect.left + rect.width / 2, // Center of the button
        });
      }
    }
  }, [side]);

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  React.useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className={cn(
              "fixed z-[9999] px-2 py-1.5 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md shadow-md pointer-events-none whitespace-nowrap",
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: side === "bottom" ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            }}
          >
            {content}
            {side === "bottom" ? (
              <>
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderBottom: "4px solid hsl(var(--popover))",
                  }}
                />
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[1px]"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderBottom: "4px solid hsl(var(--border))",
                  }}
                />
              </>
            ) : (
              <>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 -mt-px"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid hsl(var(--popover))",
                  }}
                />
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid hsl(var(--border))",
                  }}
                />
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

const TooltipTrigger = ({ children, asChild, ...props }) => {
  return <>{children}</>;
};

const TooltipContent = ({ className, ...props }) => {
  return null; // Not used in our simple implementation
};

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };
