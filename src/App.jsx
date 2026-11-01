
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import "./App.css";
import gameConfig from "./Game";

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: "starfall-game",
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="app">
      <div id="starfall-game"></div>
    </main>
  );
}

export default App;
