import { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Connection,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { AnimationData } from '../../types';

interface StateMachineEditorProps {
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  sendMessage: (type: string, payload?: any) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 50 },
    style: {
      background: '#3498db',
      color: '#fff',
      border: '1px solid #2980b9',
      borderRadius: '8px',
      padding: '10px',
    },
  },
];

const initialEdges: Edge[] = [];

export const StateMachineEditor: React.FC<StateMachineEditorProps> = ({
  // animationData, // Future use: will store workflow data
  // setAnimationData, // Future use: will update workflow data
  // sendMessage, // Future use: will send workflow commands to iframe
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('[StateMachineEditor] Connection created:', params);
      setEdges((eds) => addEdge(params, eds));
      
      // Store connection logic (future enhancement)
      // This will eventually store workflow logic in animationData
    },
    [setEdges]
  );

  const addStateNode = () => {
    const newNode = {
      id: `state_${Date.now()}`,
      type: 'default',
      data: { label: 'Play Animation' },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: '#27ae60',
        color: '#fff',
        border: '1px solid #229954',
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTriggerNode = () => {
    const newNode = {
      id: `trigger_${Date.now()}`,
      type: 'output',
      data: { label: 'On Click' },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: '#e74c3c',
        color: '#fff',
        border: '1px solid #c0392b',
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#1a1a1a' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '200px',
          background: '#252525',
          borderRight: '1px solid #444',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
          Add Nodes
        </h3>
        
        <button
          onClick={addStateNode}
          style={{
            padding: '10px',
            background: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <span>+</span> State Node
        </button>

        <button
          onClick={addTriggerNode}
          style={{
            padding: '10px',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <span>+</span> Trigger Node
        </button>

        <div style={{ borderTop: '1px solid #444', margin: '10px 0' }} />

        <button
          onClick={clearWorkflow}
          style={{
            padding: '8px',
            background: 'transparent',
            color: '#888',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Clear Workflow
        </button>

        <div style={{ marginTop: 'auto', padding: '10px 0', fontSize: '11px', color: '#666' }}>
          <p style={{ margin: '0 0 5px 0' }}>
            <strong style={{ color: '#3498db' }}>Start:</strong> Entry point
          </p>
          <p style={{ margin: '0 0 5px 0' }}>
            <strong style={{ color: '#27ae60' }}>State:</strong> Animation action
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#e74c3c' }}>Trigger:</strong> Event listener
          </p>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ background: '#1a1a1a' }}
        >
          <Controls
            style={{
              background: '#252525',
              border: '1px solid #444',
            }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="#333"
          />
        </ReactFlow>

        {/* Instructions Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #444',
            fontSize: '12px',
            color: '#ccc',
            maxWidth: '300px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#fff' }}>
            How to use:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Click sidebar buttons to add nodes</li>
            <li>Drag nodes to reposition them</li>
            <li>Connect nodes by dragging from one handle to another</li>
            <li>Delete nodes by selecting and pressing Delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

