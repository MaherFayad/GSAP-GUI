import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sandbox, 
  HighlightOverlay, 
  InspectorOverlay,
  TimelineEditor,
  StateMachineEditor,
  EditorLayout,
  Canvas,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarGroup,
  ToolbarTitle
} from '../components';
import { LayerPanel } from '../components/LayerPanel';
import { PropertiesPanelNew } from '../components/PropertiesPanel';
import { usePostMessage } from '../hooks';
import { supabase } from '../utils/supabaseClient';
import type { AnimationData } from '../types';
import { 
  CursorArrowIcon, 
  FrameIcon,
  ExitIcon,
  PlayIcon,
  StopIcon,
  ResetIcon
} from '@radix-ui/react-icons';

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SerializedNode {
  tagName: string;
  id: string;
  classes: string;
  stableSelector: string;
  children: SerializedNode[];
}

export const EditorPageNew = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
  const [isInspectorActive, setIsInspectorActive] = useState(true);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [domTree, setDomTree] = useState<SerializedNode | null>(null);
  const [animationData, setAnimationData] = useState<AnimationData>({ 
    timelines: {} 
  });
  const [activeTab, setActiveTab] = useState('timelines');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const sendMessage = usePostMessage(iframeRef);
  const intervalRef = useRef<number | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Handle iframe load - start handshake
  const onLoad = () => {
    console.log('[EditorPage] Sandbox loaded, starting handshake...');
    
    intervalRef.current = window.setInterval(() => {
      sendMessage('HANDSHAKE_PING');
    }, 100);
  };
  
  // Send inspector mode state to sandbox whenever it changes
  useEffect(() => {
    if (isSandboxReady) {
      sendMessage('SET_INSPECTOR_MODE', { enabled: isInspectorActive });
    }
  }, [isInspectorActive, isSandboxReady, sendMessage]);

  // Listen for messages from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HANDSHAKE_PONG') {
        console.log('[EditorPage] Received HANDSHAKE_PONG - sandbox ready!');
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        setIsSandboxReady(true);
        sendMessage('GET_DOM_TREE');
      } else if (event.data.type === 'HIGHLIGHT_ELEMENT') {
        setHighlightBox(event.data.payload);
      } else if (event.data.type === 'ELEMENT_SELECTED') {
        console.log('[EditorPage] Element selected:', event.data.payload.selector);
        setSelectedSelector(event.data.payload.selector);
      } else if (event.data.type === 'DOM_TREE_RECEIVED') {
        console.log('[EditorPage] DOM tree received:', event.data.payload);
        setDomTree(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sample HTML with sandbox client script
  const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sandbox Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #ffffff;
    }
    .box {
      width: 100px;
      height: 100px;
      background: #0078D4;
      margin: 20px;
      border-radius: 8px;
    }
    .gsp-highlight {
      outline: 2px solid #0078D4 !important;
      outline-offset: 2px;
      background-color: rgba(0, 120, 212, 0.1) !important;
    }
  </style>
</head>
<body>
  <h1>GSAP Editor</h1>
  <p>Click on any element below to select it!</p>
  
  <div class="box"></div>
  <div class="box" style="background: #10B981;"></div>
  <div class="box" style="background: #8B5CF6;"></div>
  
  <button id="my-button" style="padding: 12px 24px; margin: 20px; cursor: pointer; border: none; background: #0078D4; color: white; border-radius: 6px; font-size: 14px;">Click Me!</button>
  
  <div style="margin: 20px;">
    <h3>Sample Elements</h3>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>
  
  <script src="/sandbox-client.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>
  `.trim();

  // Get iframe rect for positioning the highlight overlay
  const iframeRect = iframeRef.current ? {
    top: iframeRef.current.getBoundingClientRect().top,
    left: iframeRef.current.getBoundingClientRect().left
  } : null;

  // Toolbar header
  const header = (
    <Toolbar>
      <ToolbarTitle>GSAP Editor</ToolbarTitle>
      
      <ToolbarSeparator />
      
      <ToolbarGroup>
        <ToolbarButton 
          active={isInspectorActive}
          onClick={() => setIsInspectorActive(!isInspectorActive)}
          tooltip="Inspector Mode (V)"
        >
          <CursorArrowIcon />
        </ToolbarButton>
        
        <ToolbarButton tooltip="Frame Mode (F)">
          <FrameIcon />
        </ToolbarButton>
      </ToolbarGroup>
      
      <ToolbarSeparator />
      
      <ToolbarGroup>
        <ToolbarButton 
          onClick={() => setIsPlaying(!isPlaying)}
          tooltip={isPlaying ? "Stop" : "Play"}
          active={isPlaying}
        >
          {isPlaying ? <StopIcon /> : <PlayIcon />}
        </ToolbarButton>
        
        <ToolbarButton tooltip="Reset">
          <ResetIcon />
        </ToolbarButton>
      </ToolbarGroup>
      
      <div style={{ flex: 1 }} />
      
      {isSandboxReady && (
        <div style={{ 
          fontSize: 'var(--font-size-2)', 
          color: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: 'var(--accent-green)' 
          }} />
          Ready
        </div>
      )}
      
      {selectedSelector && (
        <div style={{ 
          fontSize: 'var(--font-size-2)', 
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--background-surface)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-2)',
          border: '1px solid var(--border-main)'
        }}>
          {selectedSelector}
        </div>
      )}
      
      <ToolbarSeparator />
      
      <ToolbarButton onClick={handleLogout} tooltip="Logout">
        <ExitIcon />
      </ToolbarButton>
    </Toolbar>
  );

  // Left panel - Layers
  const leftPanel = (
    <>
      <div className="panel-header">
        <h3 className="panel-title">Layers</h3>
      </div>
      <LayerPanel 
        node={domTree} 
        onSelect={(selector) => {
          setSelectedSelector(selector);
          setIsInspectorActive(false);
        }}
        selectedSelector={selectedSelector}
      />
    </>
  );

  // Right panel - Properties
  const rightPanel = (
    <>
      <div className="panel-header">
        <h3 className="panel-title">Properties</h3>
      </div>
      <PropertiesPanelNew
        selectedElement={selectedSelector}
        sendMessage={sendMessage}
        animationData={animationData}
        setAnimationData={setAnimationData}
        currentTime={currentTime}
      />
    </>
  );

  // Bottom panel - Timelines & Workflow
  const bottomPanel = (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="timelines">Timelines</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
      </TabsList>
      
      <TabsContent value="timelines">
        <TimelineEditor
          animationData={animationData}
          setAnimationData={setAnimationData}
          sendMessage={sendMessage}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
        />
      </TabsContent>
      
      <TabsContent value="workflow">
        <StateMachineEditor
          animationData={animationData}
          setAnimationData={setAnimationData}
          sendMessage={sendMessage}
        />
      </TabsContent>
    </Tabs>
  );

  // Canvas with sandbox
  const canvas = (
    <Canvas>
      <div 
        className="canvas-artboard"
        style={{
          width: '1200px',
          height: '800px',
          transform: 'translate(-50%, -50%)',
          position: 'relative'
        }}
      >
        <Sandbox 
          ref={iframeRef}
          srcDoc={sampleHTML}
          onLoad={onLoad}
        />
        
        {isInspectorActive && isSandboxReady && (
          <InspectorOverlay iframeRef={iframeRef} />
        )}
        
        <HighlightOverlay 
          highlightBox={highlightBox}
          iframeRect={iframeRect}
        />
      </div>
    </Canvas>
  );

  return (
    <EditorLayout
      header={header}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      bottomPanel={bottomPanel}
      canvas={canvas}
    />
  );
};

