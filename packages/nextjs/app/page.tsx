"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "@starknet-react/core";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import {FONT} from "../fonts/fonts"

const Home: NextPage = () => {
  const { address } = useAccount();
  const [isGameStartLoading, setIsGameStartLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!address) {
      setIsGameStartLoading(false);
    }
  }, [address]);

  const onStartGame = async (): Promise<void> => {
    if (!address) {
      console.log("Not connected");
      return;
    }
    setIsGameStartLoading(true);

    // Example interaction with the contract
    // const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    try {
      // const tx = await contract.invoke("startGame");
      // await tx.wait();
      // Process transaction response

    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsGameStartLoading(false);
    }
  };

  return (
    <div className={"flex flex-col items-center justify-center p-4 " + FONT.className}>
      {!address ? (
        <div className="text-center">
          <h1 className="text-4xl mb-4">Welcome to Veil of Echoes</h1>
          <p className="mb-8 text-xl">Connect your wallet to start your adventure.</p>
        </div>
      ) : (
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl mb-4">Ah, brave wanderer, welcome to my realm!</h1>
          <p className="mb-4">I am the Echo Keeper, your spectral adversary and guardian of the Veil of Echoes!</p>
          <p className="mb-4">Your quest: unravel my 10,000 mystical threads before your essence fades. Succeed, and your remaining essence will bolster your standing on the leaderboard.</p>
          <p className="mb-4">
            Choose from four actions each turn, but beware, each choice carries a shadowy consequence. Choose wisely, for each action will shape the ebb and flow of our duel, impacting both our essences.
            Remember, in this realm, every decision can lead to triumph or downfall, and every maneuver you make is fraught with peril.
          </p>
          <p className="mb-8">The ethereal crowd whispers in anticipation. Ready your resolve, courageous challenger. Let the spectral duel commence!</p>
          <button
            onClick={onStartGame}
            className="px-6 py-3 bg-[#00FF66] text-2xl text-black hover:bg-[#00b548] duration-200"
          >
            {isGameStartLoading ? "Loading..." : "Start Game"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
