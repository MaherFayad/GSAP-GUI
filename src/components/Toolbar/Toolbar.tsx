import * as RadixToolbar from '@radix-ui/react-toolbar';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import './Toolbar.css';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className = '' }) => {
  return (
    <RadixTooltip.Provider delayDuration={400}>
      <RadixToolbar.Root className={`toolbar ${className}`}>
        {children}
      </RadixToolbar.Root>
    </RadixTooltip.Provider>
  );
};

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  children, 
  onClick, 
  active = false,
  disabled = false,
  tooltip,
  className = '' 
}) => {
  const button = (
    <RadixToolbar.Button 
      className={`toolbar-button ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-state={active ? 'on' : 'off'}
    >
      {children}
    </RadixToolbar.Button>
  );

  if (tooltip) {
    return (
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {button}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="tooltip-content" sideOffset={5}>
            {tooltip}
            <RadixTooltip.Arrow className="tooltip-arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    );
  }

  return button;
};

interface ToolbarSeparatorProps {
  className?: string;
}

export const ToolbarSeparator: React.FC<ToolbarSeparatorProps> = ({ className = '' }) => {
  return <RadixToolbar.Separator className={`toolbar-separator ${className}`} />;
};

interface ToolbarGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children, className = '' }) => {
  return <div className={`toolbar-group ${className}`}>{children}</div>;
};

interface ToolbarTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolbarTitle: React.FC<ToolbarTitleProps> = ({ children, className = '' }) => {
  return <div className={`toolbar-title ${className}`}>{children}</div>;
};

