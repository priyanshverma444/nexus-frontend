import { useEffect, useState } from "react";
import Challenge from "../components/challenges/Challenge";
import { fetchChallengesData } from "../services/challengeServices";
import { fetchUserData } from "../services/userServices";
import { IoAddCircle } from "react-icons/io5";
import { useToast } from "@chakra-ui/react";
import axios from "axios";

const Challenges = () => {
  const toast = useToast();
  const [challengesData, setChallengesData] = useState([]);
  const [userData, setUserData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [challengeName, setChallengeName] = useState("");
  const [platformName, setPlatformName] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URI || "http://localhost:5001";
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchChallengesData().then((data) => {
      if (data) {
        setChallengesData(data);
      }
    });
  }, []);

  useEffect(() => {
    fetchUserData().then((data) => {
      if (data) {
        setUserData(data);
      }
    });
  }, []);

  const handleChallengeUpdate = (updatedChallenge) => {
    setChallengesData((prev) =>
      prev.map((challenge) =>
        challenge._id === updatedChallenge._id ? updatedChallenge : challenge
      )
    );
  };

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    if (!description.trim() && !challengeName.trim() && !platformName.trim()) {
      toast({
        title: "Cannot Add",
        description: "The challenge description cannot be empty.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/contests`,
        {
          description: description,
          platform: platformName,
          name: challengeName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      if (response.status === 200) {
        const newChallenge = response.data;
        setChallengesData((prev) => [newChallenge, ...prev]);
        setIsAdding(false);
        setDescription("");
        setChallengeName("");
        setPlatformName("");
      }

      toast({
        title: "Success",
        description: "Challenge added successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const sortedChallenges = [...challengesData].sort((a, b) =>
    b.name.localeCompare(a.name)
  );

  return (
    <div className="mb-14 p-2 flex flex-col space-y-5">
      {userData.role === "admin" && (
        <>
          {isAdding ? (
            <>
              <textarea
                placeholder="Platform Name"
                onChange={(e) => setPlatformName(e.target.value)}
                className="flex-grow h-10 min-h-[2rem] bg-zinc-700 text-white p-2 rounded"
              />
              <textarea
                placeholder="Challenge Name"
                onChange={(e) => setChallengeName(e.target.value)}
                className="flex-grow h-10 min-h-[2rem] bg-zinc-700 text-white p-2 rounded"
              />
              <textarea
                placeholder="Challenge Description"
                onChange={(e) => setDescription(e.target.value)}
                className="flex-grow h-32 min-h-[8rem] bg-zinc-700 text-white p-2 rounded"
              />
              <div className="flex justify-start space-x-3 mt-2">
                <button
                  onClick={handleUpdate}
                  className="bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
                >
                  Update
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/10 hover:bg-zinc-800/20 hover:cursor-pointer flex justify-between items-center">
              <div className="flex flex-col space-y-3 w-full">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-bold">New Challenge</h1>
                  <button
                    onClick={handleAdd}
                    className="bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                  >
                    Add<IoAddCircle className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {sortedChallenges.map((challenge) => (
        <Challenge
          key={challenge._id}
          challenge={challenge}
          role={userData.role}
          onUpdate={handleChallengeUpdate}
          userData={userData}
        />
      ))}
    </div>
  );
};

export default Challenges;
