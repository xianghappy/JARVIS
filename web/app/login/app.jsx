import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GitHubLoginButton from './login';
import GitHubAuthHandler from './loginCallBack';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<GitHubLoginButton />} />
        <Route path="/loginCallBack" element={<GitHubAuthHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
