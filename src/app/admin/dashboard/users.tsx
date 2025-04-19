import { useQuery } from "@tanstack/react-query";

export default function Users() {
  useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  })
  return (
    <div>
      <h1>Users</h1>
    </div>
  );
}