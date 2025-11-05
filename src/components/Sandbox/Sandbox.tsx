import { forwardRef } from 'react';

interface SandboxProps {
  srcDoc: string;
  onLoad?: () => void;
}

/**
 * Sandbox Component
 * 
 * Renders an isolated iframe for executing user code with the GSAP agent.
 * The iframe uses the sandbox attribute for security and loads user HTML via srcDoc.
 */
const Sandbox = forwardRef<HTMLIFrameElement, SandboxProps>(({ srcDoc, onLoad }, ref) => {
  return (
    <iframe
      ref={ref}
      srcDoc={srcDoc}
      onLoad={onLoad}
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none'
      }}
      title="Sandbox Preview"
    />
  );
});

Sandbox.displayName = 'Sandbox';

export default Sandbox;

