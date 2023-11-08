import { useEffect, useState } from "react";
import Announcement from "../components/announcement/Announcement";
import { fetchAnnouncementsData } from "../services/announcementServices";
import { fetchUserData } from "../services/userServices";

const Announcements = () => {

  const [announcements, setAnnouncements] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    fetchAnnouncementsData().then((data) => {
      if (data) {
        setAnnouncements(data);
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

  return (
    <div className="p-2 flex flex-col space-y-5">
      {announcements.map((announcement) => (
        <Announcement
          key={announcement._id}
          announcement={announcement}
          role={userData.role}
        />
      ))}
    </div>
  );
};

export default Announcements;
