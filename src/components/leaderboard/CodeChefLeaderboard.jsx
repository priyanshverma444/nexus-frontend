import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Avatar,
  Box,
  Text,
  Button,
  Center,
} from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchLeaderboardsData } from "../../services/leaderboardServices";
import * as XLSX from "xlsx";

const CodeChefLeaderboard = () => {
  const { contestName } = useParams();
  const [leaderboardsData, setLeaderboardsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchLeaderboardsData(contestName);
        setLeaderboardsData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [contestName]);

  const categorizeWinnersByYearAndStars = () => {
    const categories = {};
    if (leaderboardsData && leaderboardsData.winners) {
      leaderboardsData.winners.forEach((winner) => {
        const yearOfStudy = winner.yearOfStudy || "Unknown Year";
        const contestNameLocal = winner.contestName || "Unknown Contest";
        const stars = contestNameLocal + " - (" + winner.stars + " Star)" || "No Stars";

        if (!categories[yearOfStudy]) categories[yearOfStudy] = {};
        if (!categories[yearOfStudy][stars]) categories[yearOfStudy][stars] = [];
        categories[yearOfStudy][stars].push(winner);
      });

      Object.keys(categories).forEach((yearOfStudy) => {
        Object.keys(categories[yearOfStudy]).forEach((stars) => {
          categories[yearOfStudy][stars].sort(
            (a, b) => a.contestGlobalRank - b.contestGlobalRank
          );
        });
      });

      const sortedCategories = {};
      Object.keys(categories)
        .sort((a, b) => {
          if (a === "Unknown Year") return 1;
          if (b === "Unknown Year") return -1;
          return a - b;
        })
        .forEach((year) => {
          const sortedStars = {};
          Object.keys(categories[year])
            .sort((a, b) => {
              const getStarNumber = (str) => parseInt(str.match(/(\d+) Star/)[1]);
              return getStarNumber(b) - getStarNumber(a);
            })
            .forEach((star) => {
              sortedStars[star] = categories[year][star];
            });
          sortedCategories[year] = sortedStars;
        });

      return sortedCategories;
    }
    return categories;
  };

  const getOrdinalSuffix = (i) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  const getMedalType = (position) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  const exportToExcel = () => {
    const categories = categorizeWinnersByYearAndStars();
    const workbook = XLSX.utils.book_new();

    Object.keys(categories).forEach((yearOfStudy) => {
      const yearData = [];
      yearData.push([`Year - ${yearOfStudy}`]);

      Object.keys(categories[yearOfStudy]).forEach((stars) => {
        yearData.push([`${stars}`]);
        yearData.push([
          "Rank",
          "Student Name",
          "Year",
          "Branch",
          "Section",
          "Codechef Id",
          "Stars",
          "CC Rank",
        ]);

        categories[yearOfStudy][stars].forEach((winner, index) => {
          yearData.push([
            getOrdinalSuffix(index + 1),
            winner.username,
            winner.yearOfStudy,
            winner.branch,
            winner.section,
            winner.codechefId,
            winner.stars,
            winner.contestGlobalRank,
          ]);
        });
        yearData.push([]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(yearData);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Year ${yearOfStudy}`);
    });

    XLSX.writeFile(workbook, `${contestName}.xlsx`);
  };

  const categories = categorizeWinnersByYearAndStars();

  return (
    <div className="mb-10">
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "2em",
          fontWeight: "bold",
        }}
      >
        CodeChef Leaderboard
      </h1>
      <Center>
        <Button onClick={exportToExcel} colorScheme="red" mb="4">
          Export to Excel
        </Button>
      </Center>
      <Tabs isFitted variant="enclosed" colorScheme="teal">
        <TabList className="flex justify-between">
          {Object.keys(categories).map((yearOfStudy, index) => (
            <Tab
              key={index}
              _selected={{ color: "white", bg: "orange" }}
              style={{ fontSize: "1.2em", fontWeight: "bold" }}
            >{`Year - ${yearOfStudy}`}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {Object.keys(categories).map((yearOfStudy, index) => (
            <TabPanel key={index}>
              <Tabs isFitted variant="enclosed" colorScheme="teal">
                <TabList className="flex justify-between">
                  {Object.keys(categories[yearOfStudy]).map((stars, index) => (
                    <Tab
                      key={index}
                      _selected={{ color: "white", bg: "orange" }}
                      style={{ fontSize: "1.2em", fontWeight: "bold" }}
                    >{`${stars}`}</Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {Object.keys(categories[yearOfStudy]).map((stars, index) => (
                    <TabPanel key={index}>
                      <Box
                        display="flex"
                        flexWrap="wrap"
                        justifyContent="space-around"
                        mb="20px"
                      >
                        {categories[yearOfStudy][stars].slice(0, 3).map((winner, winnerIndex) => (
                          <Box
                            className="bg-zinc-950"
                            key={winnerIndex}
                            textAlign="center"
                            p="10px"
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            width={["100%", "45%", "30%"]}
                            mb="10px"
                          >
                            <Text fontSize={["2em", "2em"]} fontWeight="bold">
                              {getMedalType(winnerIndex + 1)}{" "}
                              {getOrdinalSuffix(winnerIndex + 1)}
                            </Text>
                            <Image
                              borderRadius="full"
                              boxSize={["80px", "100px", "120px"]}
                              as={Avatar}
                              src={winner.userImage}
                              margin="10px auto"
                            />
                            <Text fontSize={["1em", "1.2em"]} fontWeight="bold">
                              {winner.username}
                            </Text>
                            <Text fontSize={["0.8em", "1em"]} fontWeight="bold">
                              {winner.branch} - {winner.section}
                            </Text>
                            <Text fontSize={["0.8em", "1em"]} fontWeight="bold">
                              {winner.codechefId}
                            </Text>
                            <Tag
                              style={{ color: "white", backgroundColor: "black" }}
                              fontWeight="bold"
                            >
                              {winner.stars}
                              <AiFillStar className="ml-2" />
                            </Tag>
                          </Box>
                        ))}
                      </Box>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Rank
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Student Name
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Year
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Branch
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Section
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Codechef Id
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
                                Stars
                              </Th>
                              <Th style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }} isNumeric>
                                CC Rank
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {categories[yearOfStudy][stars].map((winner, winnerIndex) => (
                              <Tr key={winnerIndex} style={{ fontSize: "1em", fontWeight: "bold" }}>
                                <Td style={{ textAlign: "center" }}>{getOrdinalSuffix(winnerIndex + 1)}</Td>
                                <Td>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <Image
                                      borderRadius="full"
                                      boxSize="50px"
                                      as={Avatar}
                                      src={winner.userImage}
                                      marginRight="10px"
                                    />
                                    {winner.username}
                                  </div>
                                </Td>
                                <Td style={{ textAlign: "center" }}>{winner.yearOfStudy}</Td>
                                <Td style={{ textAlign: "center" }}>{winner.branch}</Td>
                                <Td style={{ textAlign: "center" }}>{winner.section}</Td>
                                <Td style={{ textAlign: "center" }}>{winner.codechefId}</Td>
                                <Td style={{ textAlign: "center" }}>
                                  <Tag style={{ color: "white", backgroundColor: "black" }}>
                                    {winner.stars}
                                    <AiFillStar className="ml-2" />
                                  </Tag>
                                </Td>
                                <Td isNumeric style={{ textAlign: "center" }}>
                                  {winner.contestGlobalRank}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default CodeChefLeaderboard;