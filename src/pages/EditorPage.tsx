import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sandbox, 
  HighlightOverlay, 
  InspectorOverlay, 
  Button, 
  LayerTree,
  TimelineEditor,
  StateMachineEditor
} from '../components';
import { PropertiesPanelComprehensive } from '../components/PropertiesPanel';
import { usePostMessage } from '../hooks';
import { supabase } from '../utils/supabaseClient';
import type { AnimationData } from '../types';

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

export const EditorPage = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
  const [isInspectorActive, setIsInspectorActive] = useState(true); // Inspector active by default
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [domTree, setDomTree] = useState<SerializedNode | null>(null);
  const [animationData, setAnimationData] = useState<AnimationData>({ 
    timelines: {} 
  });
  const [activeTab, setActiveTab] = useState('timelines');
  const sendMessage = usePostMessage(iframeRef);
  const intervalRef = useRef<number | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Debug: Log animation data changes
  useEffect(() => {
    console.log('[EditorPage] Animation data updated:', animationData);
  }, [animationData]);

  // Handle iframe load - start handshake
  const onLoad = () => {
    console.log('[EditorPage] Sandbox loaded, starting handshake...');
    
    // Start sending HANDSHAKE_PING repeatedly
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
        
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Mark sandbox as ready
        setIsSandboxReady(true);
        
        // Request the DOM tree
        sendMessage('GET_DOM_TREE');
      } else if (event.data.type === 'HIGHLIGHT_ELEMENT') {
        // Update highlight box with element's bounding rect
        setHighlightBox(event.data.payload);
      } else if (event.data.type === 'ELEMENT_SELECTED') {
        // Store the selected element's CSS selector
        console.log('[EditorPage] Element selected:', event.data.payload.selector);
        setSelectedSelector(event.data.payload.selector);
      } else if (event.data.type === 'DOM_TREE_RECEIVED') {
        // Store the DOM tree structure
        console.log('[EditorPage] DOM tree received:', event.data.payload);
        setDomTree(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      
      // Clear interval if component unmounts
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
      font-family: sans-serif;
      background: #f5f5f5;
    }
    .box {
      width: 100px;
      height: 100px;
      background: #3498db;
      margin: 20px;
    }
    /* Highlight style for inspector */
    .gsp-highlight {
      outline: 2px solid #ff6b6b !important;
      outline-offset: 2px;
      background-color: rgba(255, 107, 107, 0.1) !important;
    }
  </style>
</head>
<body>
  <h1>GSAP Sandbox</h1>
  <p>Click on any element below to select it!</p>
  
  <div class="box"></div>
  <div class="box" style="background: #e74c3c;"></div>
  <div class="box" style="background: #f39c12;"></div>
  
  <button id="my-button" style="padding: 10px 20px; margin: 20px; cursor: pointer;">Click Me!</button>
  
  <div style="margin: 20px;">
    <h3>Sample Elements</h3>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>
  
  <!-- Inject the sandbox client script -->
  <script src="/sandbox-client.js"></script>
  
  <!-- GSAP library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>
  `.trim();

  // Get iframe rect for positioning the highlight overlay
  const iframeRect = iframeRef.current ? {
    top: iframeRef.current.getBoundingClientRect().top,
    left: iframeRef.current.getBoundingClientRect().left
  } : null;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100vw',padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'left !important' }}>
        <div>
          <h2 style={{ margin: 0, width: '100vw' }}>GSAP Editor</h2>
          <p style={{ margin: '5px 0' }}>
            Sandbox Status: {isSandboxReady ? '✅ Ready' : '⏳ Connecting...'}
          </p>
          {selectedSelector && (
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#3498db' }}>
              Selected: <code style={{ width: '100px', background: '#444', padding: '2px 6px', borderRadius: '3px' }}>{selectedSelector}</code>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsInspectorActive(!isInspectorActive)}
            style={{
              padding: '10px 20px',
              background: isInspectorActive ? '#e74c3c' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isInspectorActive ? '🔍 Inspector ON' : '🔍 Inspector OFF'}
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel - Layers */}
        <div 
          className="editor-left-panel" 
          style={{ 
            width: '250px', 
            background: '#2a2a2a', 
            color: '#fff', 
            overflowY: 'auto',
            borderRight: '1px solid #444'
          }}
        >
          <div style={{ padding: '10px', borderBottom: '1px solid #444' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Layers</h3>
          </div>
          <div style={{ padding: '10px' }}>
            {domTree ? (
              <LayerTree 
                node={domTree} 
                onSelect={(selector) => {
                  setSelectedSelector(selector);
                  setIsInspectorActive(false);
                }}
              />
            ) : (
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                Loading DOM tree...
              </p>
            )}
          </div>
        </div>
        
        {/* Main Content - Sandbox and Bottom Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Sandbox */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Sandbox 
              ref={iframeRef}
              srcDoc={sampleHTML}
              onLoad={onLoad}
            />
            
            {/* Inspector overlay to capture mouse events */}
            {isInspectorActive && isSandboxReady && (
              <InspectorOverlay iframeRef={iframeRef} />
            )}
            
            {/* Highlight overlay to show selected element */}
            <HighlightOverlay 
              highlightBox={highlightBox}
              iframeRect={iframeRect}
            />
          </div>

          {/* Bottom Panel */}
          <div 
            className="editor-bottom-panel"
            style={{
              height: '200px',
              background: '#2a2a2a',
              borderTop: '1px solid #444',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Tab Buttons */}
            <div style={{ 
              display: 'flex', 
              background: '#1e1e1e', 
              borderBottom: '1px solid #444'
            }}>
              <button
                onClick={() => setActiveTab('timelines')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'timelines' ? '#2a2a2a' : 'transparent',
                  color: activeTab === 'timelines' ? '#fff' : '#888',
                  border: 'none',
                  borderBottom: activeTab === 'timelines' ? '2px solid #3498db' : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'timelines' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Timelines
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'workflow' ? '#2a2a2a' : 'transparent',
                  color: activeTab === 'workflow' ? '#fff' : '#888',
                  border: 'none',
                  borderBottom: activeTab === 'workflow' ? '2px solid #3498db' : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'workflow' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Workflow
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeTab === 'timelines' && (
                <TimelineEditor
                  animationData={animationData}
                  setAnimationData={setAnimationData}
                  sendMessage={sendMessage} currentTime={0} onTimeChange={function (time: number): void {
                    throw new Error('Function not implemented.');
                  } }                />
              )}
              {activeTab === 'workflow' && (
                <StateMachineEditor
                  animationData={animationData}
                  setAnimationData={setAnimationData}
                  sendMessage={sendMessage}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div 
          className="editor-right-panel" 
          style={{ 
            width: '300px', 
            background: '#2a2a2a', 
            color: '#fff', 
            overflowY: 'auto',
            borderLeft: '1px solid #444'
          }}
        >
          <div style={{ padding: '10px', borderBottom: '1px solid #444' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Properties</h3>
          </div>
          <PropertiesPanelComprehensive
            selectedElement={selectedSelector}
            sendMessage={sendMessage}
            animationData={animationData}
            setAnimationData={setAnimationData}
            currentTime={0} // We'll connect this to the timeline later
          />
        </div>
      </div>
    </div>
  );
};

