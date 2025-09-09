import { SiCodechef } from "react-icons/si";
import { GrResume } from "react-icons/gr";
import { BiReset } from "react-icons/bi";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChallengesData } from "../services/challengeServices";
import { Button } from "@chakra-ui/react";
import { fetchUserData } from "../services/userServices";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const Leaderboard = () => {
    const toast = useToast();
    const backendUrl = import.meta.env.VITE_BACKEND_URI || "http://localhost:5001";
    const apiKey = import.meta.env.VITE_API_KEY;
    const [challengesData, setChallengesData] = useState([]);
    const [userData, setUserData] = useState({});
    const [isGeneratingResult, setIsGeneratingResult] = useState(false);
    const [isResetingUser, setIsResetingUser] = useState(false);

    useEffect(() => {
        fetchUserData().then((data) => {
            if (data) {
                setUserData(data);
            }
        });
    }, []);

    useEffect(() => {
        fetchChallengesData().then((data) => {
            if (data) {
                // Sort challenges by name in descending order
                const sortedData = data.sort((a, b) => b.name.localeCompare(a.name));
                setChallengesData(sortedData);
            }
        });
    }, []);

    const handleGenerateStarterResult = async () => {
        if (!challengesData.length) return;

        setIsGeneratingResult(true);
        const contestName = challengesData[0].name; // first challenge in descending order

        try {
            const res = await axios.get(`${backendUrl}/api/contests/codechef/generate/allwinners/${contestName}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (res.status === 200) {
                toast({
                    title: "Result Generated",
                    description: "Result generated successfully",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to generate result",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error generating result",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsGeneratingResult(false);
        }
    };

    const handleResetCodechefUser = async () => {
        setIsResetingUser(true);

        try {
            const response = await axios.put(
                `${backendUrl}/api/contests/codechef/update/allusers`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            if (response.status === 200) {
                toast({
                    title: "Users Reset",
                    description: "Users reset successfully",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error resetting users",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsResetingUser(false);
        }
    };

    return (
        <div className="mb-10 flex flex-col justify-around space-y-5 m-2">
            {challengesData.map((challenge, index) => (
                <div
                    key={index}
                    className="flex flex-row min-[320px]:max-lg:flex-col items-center justify-between border border-zinc-700 rounded-xl p-5 bg-zinc-900/10"
                >
                    <div className="flex items-center my-5 mx-2">
                        <SiCodechef className="text-7xl text-codechef" />
                        <h2 className="text-lg font-semibold text-gray-400 ml-2">{challenge.name}</h2>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center md:space-x-3">
                        {challenge.platform.toLowerCase().split(' ')[0] === "codechef" && (
                            <>
                                {userData.role === "admin" && (
                                    <div className="flex justify-center items-center space-x-3">
                                        <Button
                                            isLoading={isGeneratingResult}
                                            loadingText="Generating Result"
                                            colorScheme="gray"
                                            spinnerPlacement="start"
                                            onClick={handleGenerateStarterResult}
                                            my={`2`}
                                        >
                                            Generate Result
                                            <GrResume className="ml-2" />
                                        </Button>
                                        <Button
                                            isLoading={isResetingUser}
                                            loadingText="Resetting User"
                                            bg="red.700"
                                            _hover={{ bg: 'red.600' }}
                                            color={'white'}
                                            spinnerPlacement="start"
                                            onClick={handleResetCodechefUser}
                                            my={`2`}
                                        >
                                            Reset Users <BiReset className="ml-2" />
                                        </Button>
                                    </div>
                                )}
                                <Link
                                    to={`/leaderboard/${challenge.name.toLowerCase()}`}
                                    className="flex justify-end items-center bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded my-2"
                                >
                                    View Results
                                    <AiOutlineArrowRight className="ml-2" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Leaderboard;
