import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import UserDashboard from './pages/UserDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import CaseSummary from './pages/caseSummary';
import AddCase from './pages/AddCase';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserProfile from './pages/user_profile';
import JudgeProfile from './pages/judge_profile';
import JudgeCases from './pages/judge-cases';
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';


function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route element={<ProtectedRoute roles={["user"]} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Route>
        <Route element={<ProtectedRoute roles={["judge"]} />}>
          <Route path="/judge-dashboard" element={<JudgeDashboard />} />
          <Route path="/judge/profile" element={<JudgeProfile />} />
          <Route path="/judge/cases" element={<JudgeCases />} />
        </Route>
        <Route path="/cases/:id/summary" element={<CaseSummary />} />
        <Route path="/add-case" element={<AddCase />} />
        <Route path="/edit-case/:id" element={<AddCase />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route element={<Layout />}>
          <Route path='/register' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
        </Route>
        <Route path="/profile" element={<ProtectedRoute><Navigate to={(JSON.parse(localStorage.getItem('user')||'{}')?.role)==='judge'?'/judge/profile':'/user/profile'} replace /></ProtectedRoute>} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
