// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { doc, db } from "../../firebase";
import { getDoc } from "firebase/firestore";

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        setCurrentUser({
          ...user,
          role: userData?.role || "user",
          username: userData?.username || null
        });
        setIsAdmin(userData?.role === "admin");
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentUser, isAdmin, loading };
}
