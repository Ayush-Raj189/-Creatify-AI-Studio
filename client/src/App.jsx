import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Home from './Pages/Home.jsx';
import Layout from './Pages/Layout.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import WriteArticle from './Pages/WriteAtricle.jsx';
import BlogTitles from './Pages/BlogTitle.jsx';
import GenerateImages from './Pages/GenerateImages.jsx';
import RemoveBackground from './Pages/RemoveBackground.jsx';
import RemoveObject from './Pages/RemoveObject.jsx';
import ReviewResume from './Pages/ReviewResume.jsx';
import Community from './Pages/Community.jsx';
import { useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';


const App = () => {
  // const { getToken } = useAuth();

  // useEffect(() => {
  //   getToken().then((token) => {
  //     console.log("Clerk Token:", token);
  //   })
  // }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "ai",
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "write-article", element: <WriteArticle /> },
        { path: "blog-titles", element: <BlogTitles /> },
        { path: "generate-images", element: <GenerateImages /> },
        { path: "remove-background", element: <RemoveBackground /> },
        { path: "remove-object", element: <RemoveObject /> },
        { path: "review-resume", element: <ReviewResume /> },
        { path: "community", element: <Community /> }
      ]
    }
  ]);

  return (
    <>
      <Toaster/>
      <RouterProvider router={router} />
    </>
  )
}

export default App