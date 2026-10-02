import Landing from "./pages/Landing";
import Login from "./pages/Login";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <Login />;
  }

  return <Landing />;
}

export default App;