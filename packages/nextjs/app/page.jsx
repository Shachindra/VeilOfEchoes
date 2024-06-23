"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "@starknet-react/core";
import { FONT } from "../fonts/fonts";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

const Home = () => {
  const { address } = useAccount();
  const [isGameStartLoading, setIsGameStartLoading] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [gameMessage, setGameMessage] = useState("");
  const [gameOptions, setGameOptions] = useState([]);
  const [nftData, setNftData] = useState(null);

  const { writeAsync: startGameContract } = useScaffoldWriteContract({
    contractName: "GameContract",
    functionName: "start_game",
    args: [],
    options: { gas: 100000 },
  });

  const { writeAsync: endGameContract } = useScaffoldWriteContract({
    contractName: "GameContract",
    functionName: "end_game",
    args: [address],
    options: { gas: 100000 },
  });

  const checkpoints = [
    {
      message: "You arrive back in your eerie hometown, shrouded in mystery. The once-familiar streets feel different, and an unsettling silence hangs in the air.",
      options: ["Explore your childhood home.", "Walk toward the abandoned research facility.", "Visit the local diner for information."],
      correct: 1
    },
    {
      message: "You arrive at the gates of the abandoned research facility. A chain and padlock bar your entry.",
      options: ["Cut the chain with bolt cutters found nearby.", "Climb over the fence.", "Look for an alternative entrance."],
      correct: 2
    },
    {
      message: "Inside, you find a neglected wing of the facility. The air is thick with dust, and the shadows seem to flicker.",
      options: ["Proceed through the main hallway.", "Enter the darkened side room.", "Search for a light switch."],
      correct: 2
    },
    {
      message: "You discover a handheld radio device, humming with a strange energy. It feels important.",
      options: ["Turn on the device immediately.", "Examine the device for any instructions.", "Leave the device and move on."],
      correct: 1
    },
    {
      message: "When you tune the device, echoes of voices from the past fill the room. They mention a hidden key.",
      options: ["Follow the voices to their source.", "Search the room for a hidden compartment.", "Ignore the voices and keep exploring."],
      correct: 1
    },
    {
      message: "You find an old key with inexplicable runes, unlocking a hidden door marked as 'Research Archive.'",
      options: ["Unlock the hidden door.", "Keep the key and explore other areas.", "Leave the key in its place."],
      correct: 0
    },
    {
      message: "Within the archive, the echoes intensify. They guide you to a box of old documents detailing the town's secrets.",
      options: ["Read through the documents carefully.", "Take the box and leave the room.", "Burn the documents to destroy the evidence."],
      correct: 0
    },
    {
      message: "An ethereal entity appears, blocking your path. It speaks in riddles about the veil between worlds.",
      options: ["Use the radio to tune into its frequency.", "Confront the entity directly.", "Flee the room."],
      correct: 0
    },
    {
      message: "Tuned in, the entity reveals the existence of a final rift that must be closed to save the town and yourself.",
      options: ["Seek out the rift immediately.", "Ask the entity for more guidance.", "Destroy the radio device."],
      correct: 0
    },
    {
      message: "You find the rift in the heart of the facility. Its chaotic energy threatens to engulf everything.",
      options: ["Use the radio to stabilize the rift and close it.", "Sacrifice yourself to seal the rift.", "Abandon the mission and save yourself."],
      correct: 0
    }
  ];

  useEffect(() => {
    if (!address) {
      setIsGameStartLoading(false);
    }
  }, [address]);

  const onStartGame = async () => {
    if (!address) {
      console.log("Not connected");
      return;
    }
    setIsGameStartLoading(true);
    try {
      const result = await startGameContract();
      console.log("Transaction successful:", result);
      setCurrentCheckpoint(0);
      setGameMessage(checkpoints[0].message);
      setGameOptions(checkpoints[0].options);
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsGameStartLoading(false);
    }
  };

  const onChoiceSelect = async (choiceIndex) => {
    if (currentCheckpoint === null) return;
    const checkpoint = checkpoints[currentCheckpoint];
    if (choiceIndex === checkpoint.correct) {
      const nextCheckpoint = currentCheckpoint + 1;
      if (nextCheckpoint < checkpoints.length) {
        setCurrentCheckpoint(nextCheckpoint);
        setGameMessage(checkpoints[nextCheckpoint].message);
        setGameOptions(checkpoints[nextCheckpoint].options);
      } else {
        try {
          const result = await endGameContract();
          console.log("End game transaction successful:", result);
          setNftData({ player: address || "" });
          setGameMessage("Congratulations! You have completed the game, saved the town, and received an NFT.");
          setGameOptions([]);
        } catch (error) {
          console.error("Error ending game:", error);
          setGameMessage("Error ending game. Please try again.");
          setGameOptions([]);
        }
      }
    } else {
      setGameMessage("Wrong choice! The game has ended. Start over to try again.");
      setGameOptions([]);
      setCurrentCheckpoint(null);
    }
  };

  const getBackgroundImage = () => {
    if (currentCheckpoint === null) {
      return "/startgame.png";
    } else if (currentCheckpoint >= checkpoints.length) {
      return "/completion.png";
    }
    return `/checkpoint${currentCheckpoint + 1}.png`;
  };

  return (
    <div className={"flex flex-col items-center justify-center p-4 " + FONT.className} style={{ minHeight: "100vh", backgroundImage: `url(${getBackgroundImage()})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {!address ? (
        <div className="text-center">
          <h1 className="text-4xl mb-4">Welcome to Veil of Echoes</h1>
          <p className="mb-8 text-xl">Connect your wallet to start your adventure.</p>
        </div>
      ) : (
        <div className="text-center max-w-3xl bg-black bg-opacity-70 p-6 rounded-lg">
          {currentCheckpoint === null ? (
            <div>
              <h1 className="text-4xl mb-4 text-white">Ah, brave wanderer, welcome to my realm!</h1>
              <p className="mb-4 text-white">I am the Echo Keeper, your spectral adversary and guardian of the Veil of Echoes!</p>
              <p className="mb-4 text-white">Your quest: unravel my 10,000 mystical threads before your essence fades. Succeed, and your remaining essence will bolster your standing on the leaderboard.</p>
              <p className="mb-4 text-white">
                Choose from four actions each turn, but beware, each choice carries a shadowy consequence. Choose wisely, for each action will shape the ebb and flow of our duel, impacting both our essences.
                Remember, in this realm, every decision can lead to triumph or downfall, and every maneuver you make is fraught with peril.
              </p>
              <p className="mb-8 text-white">The ethereal crowd whispers in anticipation. Ready your resolve, courageous challenger. Let the spectral duel commence!</p>
              <button
                onClick={onStartGame}
                className="px-6 py-3 bg-[#00FF66] text-2xl text-black hover:bg-[#00b548] duration-200"
              >
                {isGameStartLoading ? "Loading..." : "Start Game"}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl mb-4 text-white">{gameMessage}</h2>
              <div className="flex flex-col items-center">
                {gameOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onChoiceSelect(index)}
                    className="mb-4 px-6 py-3 bg-[#00FF66] text-xl text-black hover:bg-[#00b548] duration-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
              {nftData && (
                <div className="mt-8 p-6 bg-white border-2 border-gray-300 rounded-lg shadow-lg w-1/2 justify-center mx-auto">
                  <h3 className="text-2xl mb-4 text-green-600">NFT Minted!</h3>
                  <div className="flex flex-col items-center">
                  <Image
                      src="/nft_image.png"
                      alt="NFT Image"
                      width={300}
                      height={300}
                      className="rounded-lg mb-4"
                    />
                    <div className="bg-gray-200 p-4 rounded-lg mb-4 w-full">
                      <h4 className="text-xl mb-2">Player</h4>
                      <p className="break-words text-black">{nftData.player}</p>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-lg w-full">
                      <h4 className="text-xl mb-2 text-black">Game Completion</h4>
                      <p className="text-black">Congratulations on completing the Veil of Echoes!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
