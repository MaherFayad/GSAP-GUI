import { useRef, useState, useEffect, useCallback } from 'react';
import { Sandbox, HighlightOverlay, InspectorOverlay } from '../components';
import { usePostMessage } from '../hooks';

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SAMPLE_HTMLS = {
  basic: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Basic Test</title>
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
      transition: all 0.3s;
    }
    .box:hover {
      transform: scale(1.1);
    }
    .gsp-highlight {
      outline: 2px solid #ff6b6b !important;
      outline-offset: 2px;
      background-color: rgba(255, 107, 107, 0.1) !important;
    }
  </style>
</head>
<body>
  <h1>Basic Test Page</h1>
  <p>Click on any element to select it!</p>
  
  <div class="box"></div>
  <div class="box" style="background: #e74c3c;"></div>
  <div class="box" style="background: #f39c12;"></div>
  
  <button id="my-button" style="padding: 10px 20px; margin: 20px; cursor: pointer;">Click Me!</button>
  
  <script src="/sandbox-client.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>`,
  
  complex: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Complex Layout Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      width: 600px;
      height: 100%;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 20px;
      border-radius: 8px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s;
      cursor: pointer;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .card h3 {
      margin-bottom: 10px;
    }
    .sidebar {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .sidebar ul {
      list-style: none;
    }
    .sidebar li {
      padding: 10px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .sidebar li:hover {
      background: #e9ecef;
    }
    .gsp-highlight {
      outline: 3px solid #ffd93d !important;
      outline-offset: 3px;
      background-color: rgba(255, 217, 61, 0.2) !important;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Complex Layout Test</h1>
      <p>Hover and click on different elements</p>
    </div>
    
    <div class="grid">
      <div class="card" data-card="1">
        <h3>Card One</h3>
        <p>This is the first card with some content</p>
      </div>
      <div class="card" data-card="2">
        <h3>Card Two</h3>
        <p>This is the second card with different content</p>
      </div>
      <div class="card" data-card="3">
        <h3>Card Three</h3>
        <p>This is the third card with more content</p>
      </div>
    </div>
    
    <div class="sidebar">
      <h3>Sidebar Navigation</h3>
      <ul>
        <li>Home</li>
        <li>Projects</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </div>
  </div>
  
  <script src="/sandbox-client.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>`,

  animation: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Animation Test</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: sans-serif;
      background: #1a1a2e;
      color: white;
      min-height: 100vh;
    }
    .controls {
      background: #16213e;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button {
      padding: 10px 20px;
      margin: 5px;
      background: #0f3460;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }
    button:hover {
      background: #e94560;
    }
    .animation-box {
      width: 150px;
      height: 150px;
      background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
      margin: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .gsp-highlight {
      outline: 3px solid #4ecca3 !important;
      outline-offset: 3px;
    }
  </style>
</head>
<body>
  <h1>🎬 GSAP Animation Test</h1>
  
  <div class="controls">
    <h3>Animation Controls</h3>
    <button onclick="animateBox()">Animate Box</button>
    <button onclick="rotateBox()">Rotate</button>
    <button onclick="scaleBox()">Scale</button>
    <button onclick="resetBox()">Reset</button>
  </div>
  
  <div class="animation-box" id="animBox">
    🎯
  </div>
  
  <script src="/sandbox-client.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script>
    const box = document.getElementById('animBox');
    
    function animateBox() {
      gsap.to(box, {
        x: 300,
        duration: 1,
        ease: "power2.inOut"
      });
    }
    
    function rotateBox() {
      gsap.to(box, {
        rotation: 360,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      });
    }
    
    function scaleBox() {
      gsap.to(box, {
        scale: 1.5,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    }
    
    function resetBox() {
      gsap.to(box, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  </script>
</body>
</html>`
};

type SampleKey = keyof typeof SAMPLE_HTMLS;

export const TestPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
  const [isInspectorActive, setIsInspectorActive] = useState(true);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [currentSample, setCurrentSample] = useState<SampleKey>('basic');
  const [logs, setLogs] = useState<string[]>([]);
  const sendMessage = usePostMessage(iframeRef);
  const intervalRef = useRef<number | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Handle iframe load - start handshake
  const onLoad = () => {
    addLog('🔄 Sandbox loaded, starting handshake...');
    setIsSandboxReady(false);
    setHighlightBox(null);
    setSelectedSelector(null);
    
    // Start sending HANDSHAKE_PING repeatedly
    intervalRef.current = window.setInterval(() => {
      sendMessage('HANDSHAKE_PING');
    }, 100);
  };
  
  // Send inspector mode state to sandbox whenever it changes
  useEffect(() => {
    if (isSandboxReady) {
      sendMessage('SET_INSPECTOR_MODE', { enabled: isInspectorActive });
      addLog(`🔍 Inspector mode ${isInspectorActive ? 'enabled' : 'disabled'} in sandbox`);
    }
  }, [isInspectorActive, isSandboxReady, sendMessage, addLog]);

  // Listen for messages from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HANDSHAKE_PONG') {
        addLog('✅ Received HANDSHAKE_PONG - sandbox ready!');
        
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Mark sandbox as ready
        setIsSandboxReady(true);
      } else if (event.data.type === 'HIGHLIGHT_ELEMENT') {
        // Update highlight box with element's bounding rect
        setHighlightBox(event.data.payload);
      } else if (event.data.type === 'ELEMENT_SELECTED') {
        // Store the selected element's CSS selector
        const selector = event.data.payload.selector;
        addLog(`🎯 Element selected: ${selector}`);
        setSelectedSelector(selector);
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

  // Get iframe rect for positioning the highlight overlay
  const iframeRect = iframeRef.current ? {
    top: iframeRef.current.getBoundingClientRect().top,
    left: iframeRef.current.getBoundingClientRect().left
  } : null;

  const testHighlightElement = () => {
    if (!isSandboxReady) {
      addLog('❌ Sandbox not ready yet');
      return;
    }
    sendMessage('HIGHLIGHT_ELEMENT', { selector: '.box' });
    addLog('📤 Sent HIGHLIGHT_ELEMENT message for .box');
  };

  const testSelectElement = () => {
    if (!isSandboxReady) {
      addLog('❌ Sandbox not ready yet');
      return;
    }
    sendMessage('INSPECT_MODE', { enabled: true });
    addLog('📤 Enabled inspect mode');
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '15px 20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100vw',
        alignItems: 'left !important',
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', width: '100vw' }}>🧪 GSAP Editor Test Page</h2>
        <p style={{ margin: '5px 0', opacity: 0.9, fontSize: '14px' }}>
          Sandbox: {isSandboxReady ? '✅ Ready' : '⏳ Connecting...'}
          {selectedSelector && (
            <span style={{ marginLeft: '20px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '3px' }}>
              Selected: <code>{selectedSelector}</code>
            </span>
          )}
        </p>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar - Controls */}
        <div style={{ 
          width: '300px', 
          background: '#f8f9fa', 
          padding: '20px',
          overflowY: 'auto',
          borderRight: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0 }}>🎮 Controls</h3>
          
          {/* Sample selector */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="sample-selector" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Select Sample:
            </label>
            <select 
              id="sample-selector"
              value={currentSample}
              onChange={(e) => {
                setCurrentSample(e.target.value as SampleKey);
                addLog(`📄 Switched to ${e.target.value} sample`);
              }}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '14px'
              }}
              title="Select sample HTML"
            >
              <option value="basic">Basic Test</option>
              <option value="complex">Complex Layout</option>
              <option value="animation">Animation Test</option>
            </select>
          </div>

          {/* Inspector toggle */}
          <button
            onClick={() => {
              const newState = !isInspectorActive;
              setIsInspectorActive(newState);
              addLog(`🔍 Inspector ${newState ? 'enabled' : 'disabled'}`);
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: isInspectorActive ? '#e74c3c' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            {isInspectorActive ? '🔍 Disable Inspector' : '🔍 Enable Inspector'}
          </button>

          {/* Test buttons */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Manual Tests:</h4>
            <button
              onClick={testHighlightElement}
              disabled={!isSandboxReady}
              style={{
                width: '100%',
                padding: '10px',
                background: isSandboxReady ? '#3498db' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSandboxReady ? 'pointer' : 'not-allowed',
                marginBottom: '8px',
                fontSize: '13px'
              }}
            >
              Highlight First Box
            </button>
            
            <button
              onClick={testSelectElement}
              disabled={!isSandboxReady}
              style={{
                width: '100%',
                padding: '10px',
                background: isSandboxReady ? '#9b59b6' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSandboxReady ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
            >
              Test Inspect Mode
            </button>
          </div>

          {/* Logs */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h4 style={{ fontSize: '14px', margin: 0 }}>📋 Event Log:</h4>
              <button
                onClick={() => {
                  setLogs([]);
                  addLog('🗑️ Log cleared');
                }}
                style={{
                  padding: '4px 8px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear
              </button>
            </div>
            <div style={{ 
              background: '#1e1e1e', 
              color: '#d4d4d4',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {logs.length === 0 ? (
                <div style={{ opacity: 0.5 }}>No events yet...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right side - Sandbox */}
        <div style={{ flex: 1, position: 'relative', background: '#ffffff' }}>
          <Sandbox 
            ref={iframeRef}
            srcDoc={SAMPLE_HTMLS[currentSample]}
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
      </div>
    </div>
  );
};

