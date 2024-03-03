import SnakeGame from "./components/page";

export default function Home() {
  if (typeof window !== "undefined") {
    // Check if window object is defined (client-side)
    // Now you can safely use localStorage
    // Example: localStorage.setItem('key', 'value');
  }
  return (
    <div>
      <SnakeGame />
    </div>
  );
}
