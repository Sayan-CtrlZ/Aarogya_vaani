import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  return <Landing />;
}

export default App;