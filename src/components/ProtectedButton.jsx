// src/components/ProtectedButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedButton({ to, onClick, children }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <button
      onClick={onClick ? onClick : () => navigate(to)}
      className="protected-button"
    >
      {children}
    </button>
  );
}