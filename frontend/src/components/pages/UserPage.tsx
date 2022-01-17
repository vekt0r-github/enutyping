import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { get } from "@/utils/functions";
import { User } from "@/utils/types";


const userPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    get(`/api/users/${userId}`).then((user) => {
      if (user && user.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [])

  return (
    <>
      { user
        ? <p>This is {user.name} with id {user.id}</p>
        : <p>User not found!</p>
      }
    </>
  );
};

export default userPage;
