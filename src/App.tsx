import './styles/App.css'
import { Button } from './components'

function App() {
  return (
    <>
      <h1>Build powerful animations, faster</h1>
      <div className="card">
        <p className="text-large">
          GSAP Editor is the animation tool for professionals.<br />
          Design freely, animate precisely, and scale<br />
          with state machines, workflows, and more.
        </p>
        <div className="button-group">
          <Button variant="primary">Start for free</Button>
          <Button variant="secondary">Learn more</Button>
        </div>
      </div>
      <p className="read-the-docs">
        Built with React, TypeScript, GSAP, XState, and Supabase
      </p>
    </>
  )
}

export default App
