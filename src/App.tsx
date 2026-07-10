import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import PincodeDetail from './pages/PincodeDetail';
import StatesList from './pages/StatesList';
import StateDetail from './pages/StateDetail';
import DistrictDetail from './pages/DistrictDetail';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <SearchResults /> },
      { path: 'pincode/:id', element: <PincodeDetail /> },
      { path: 'states', element: <StatesList /> },
      { path: 'state/:state', element: <StateDetail /> },
      { path: 'state/:state/district/:district', element: <DistrictDetail /> },
      { path: 'blog', element: <BlogList /> },
      { path: 'blog/:slug', element: <BlogDetail /> },
      { path: 'contact', element: <Contact /> },
      { path: 'admin', element: <Admin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
