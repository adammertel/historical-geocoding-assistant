import { useState, useEffect } from "react";

// Test component using React 19 hooks
function TestReact19() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("React 19 is working!");
    return () => console.log("Component unmounted");
  }, []);

  return (
    <div>
      <h1>React 19 Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

export default TestReact19;
