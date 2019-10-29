import './App.css';
import React from 'react';
import { actions, useCounterAction, useCounterState } from "./modules/counter"

const App: React.FC = () => {
  const count = useCounterState((state) => state.count)
  const increment = useCounterAction(() => actions.increment())
  const decrement = useCounterAction(() => actions.decrement())
  return (
    <div className="container">
      <p className="count">{count}</p>
      <div>
        <button className="button" onClick={increment}>inc</button>
        <button className="button" onClick={decrement}>dec</button>
      </div>
    </div>
  );
}

export default App;
