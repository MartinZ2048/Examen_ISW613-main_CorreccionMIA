import React from "react";
import { useRoutes } from "react-router-dom";
import BooksPage from "../pages/BooksPage";
import BookDetailPage from "../pages/BookDetailPage"; // La harás después
import MyLoansPage from "../pages/MyLoansPage"; // La harás después
import LoginPage from "../pages/LoginPage"; // La harás después


export default function AppRouter() {



  const routes = useRoutes([
    { path: "/libros", element: <BooksPage /> },
    { path: "/libros/:id", element: <BookDetailPage /> },
    { path: "/mis-prestamos", element: <MyLoansPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "*", element: <h2>404 - Página no encontrada</h2> }
  ]);

  return routes;
}