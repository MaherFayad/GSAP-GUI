import * as RadixTabs from '@radix-ui/react-tabs';
import './Tabs.css';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children,
  className = ''
}) => {
  return (
    <RadixTabs.Root 
      className={`ws-tabs ${className}`}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      {children}
    </RadixTabs.Root>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <RadixTabs.List className={`ws-tabs-list ${className}`}>
      {children}
    </RadixTabs.List>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
  return (
    <RadixTabs.Trigger className={`ws-tabs-trigger ${className}`} value={value}>
      {children}
    </RadixTabs.Trigger>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  return (
    <RadixTabs.Content className={`ws-tabs-content ${className}`} value={value}>
      {children}
    </RadixTabs.Content>
  );
};

