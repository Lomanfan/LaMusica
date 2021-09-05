import React from "react";
import useAuth from "./useAuth.js";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code)
  return <div>{code}</div>;
}
