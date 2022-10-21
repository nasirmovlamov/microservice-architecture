import bcrypt from "bcrypt";
import express from "express";
import { getPGData, startPgClient } from "./database/pgClient";
import { getRedisClient, startRedisClient } from "./database/redisClient";
import { generatePasswordStrongError } from "./helpers/checkPassword";
import { generateEmptyFieldsError } from "./helpers/errorConstructor";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "./helpers/generateToken";
import { originChecker } from "./helpers/origin-checker";

require("dotenv").config();
export const app = express();
const port = 8080;

const allowlist = ["http://localhost:9000"];

startRedisClient();
startPgClient();

app.use((req, res, next) => originChecker(req, res, next, allowlist));

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  express.json({
    limit: "50mb",
  })
);

app.post("/v1/auth/login", async (req, res) => {
  const { password, email } = req.body as {
    password: string;
    email: string;
  };

  if (
    !process.env.JWT_SECRET &&
    !process.env.JWT_EXPIRATION &&
    !process.env.JWT_REFRESH_EXPIRATION
  ) {
    res.status(500).send("Server Error");
  }

  if (
    Object.keys(
      generateEmptyFieldsError({
        password,
        email,
      })
    ).length > 0
  ) {
    return res.status(400).send({
      errors: generateEmptyFieldsError({
        password,
        email,
      }),
    });
  }

  //check password is equal to the one in the database
  const { Users } = getPGData();

  const emailExistUser = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (!emailExistUser) {
    return res.status(400).send({
      errors: {
        email: "Email does not exist",
      },
    });
  }

  const passwordMatch = await bcrypt.compare(
    password,
    emailExistUser?.getDataValue("password")
  );

  if (!passwordMatch) {
    return res.status(400).send({
      errors: {
        password: "Password is incorrect",
      },
    });
  }

  const userActivityDataOnRedisString = await getRedisClient().get(
    emailExistUser.getDataValue("id").toString()
  );

  const accessToken = generateToken({
    id: emailExistUser?.getDataValue("id"),
    username: emailExistUser?.getDataValue("username"),
    email: emailExistUser?.getDataValue("email"),
  });

  const refreshToken = generateRefreshToken({
    id: emailExistUser?.getDataValue("id"),
    username: emailExistUser?.getDataValue("username"),
    email: emailExistUser?.getDataValue("email"),
  });

  if (!userActivityDataOnRedisString) {
    console.log("userActivityDataOnRedisString is null");
    await getRedisClient().set(
      emailExistUser.getDataValue("id").toString(),
      JSON.stringify({
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );

    await getRedisClient().set(
      accessToken,
      JSON.stringify({
        isAccessToken: true,
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
      {
        EX: parseInt(process.env.JWT_EXPIRATION || "3600"),
      }
    );

    await getRedisClient().set(
      refreshToken,
      JSON.stringify({
        isRefreshToken: true,
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
      {
        EX: parseInt(process.env.JWT_REFRESH_EXPIRATION || "3600"),
      }
    );

    return res.status(200).send({
      statusCode: 200,
      jwt: {
        accessToken,
        refreshToken,
      },
      user: {
        id: emailExistUser?.getDataValue("id"),
        username: emailExistUser?.getDataValue("username"),
        email: emailExistUser?.getDataValue("email"),
      },
    });
  }

  const userActivityData = JSON.parse(userActivityDataOnRedisString!);
  const isTokenVerified = verifyToken(userActivityData.accessToken);

  if (!JSON.stringify(isTokenVerified)) {
    await getRedisClient().del(emailExistUser.getDataValue("id").toString());
    await getRedisClient().del(userActivityData.accessToken);
    await getRedisClient().del(userActivityData.refreshToken);

    await getRedisClient().set(
      emailExistUser.getDataValue("id").toString(),
      JSON.stringify({
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );

    await getRedisClient().set(
      accessToken,
      JSON.stringify({
        isAccessToken: true,
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
      {
        EX: parseInt(process.env.JWT_EXPIRATION || "3600"),
      }
    );

    await getRedisClient().set(
      refreshToken,
      JSON.stringify({
        isRefreshToken: true,
        user: {
          id: emailExistUser.getDataValue("id") as string,
          username: emailExistUser.getDataValue("username") as string,
          email: emailExistUser.getDataValue("email") as string,
        },
        accessToken: accessToken,

        refreshToken: refreshToken,
      }),
      {
        EX: parseInt(process.env.JWT_REFRESH_EXPIRATION || "3600"),
      }
    );

    return res.status(200).send({
      statusCode: 200,
      jwt: {
        accessToken,
        refreshToken,
      },
      user: {
        id: emailExistUser?.getDataValue("id"),
        username: emailExistUser?.getDataValue("username"),
        email: emailExistUser?.getDataValue("email"),
      },
    });
  }

  await getRedisClient().del(emailExistUser.getDataValue("id").toString());
  await getRedisClient().del(userActivityData.accessToken.toString());
  await getRedisClient().del(userActivityData.refreshToken.toString());

  await getRedisClient().set(
    emailExistUser.getDataValue("id").toString(),
    JSON.stringify({
      user: {
        id: emailExistUser.getDataValue("id") as string,
        username: emailExistUser.getDataValue("username") as string,
        email: emailExistUser.getDataValue("email") as string,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  );

  await getRedisClient().set(
    accessToken,
    JSON.stringify({
      isAccessToken: true,
      user: {
        id: emailExistUser.getDataValue("id") as string,
        username: emailExistUser.getDataValue("username") as string,
        email: emailExistUser.getDataValue("email") as string,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  );

  await getRedisClient().set(
    refreshToken,
    JSON.stringify({
      isRefreshToken: true,
      user: {
        id: emailExistUser.getDataValue("id") as string,
        username: emailExistUser.getDataValue("username") as string,
        email: emailExistUser.getDataValue("email") as string,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  );

  res.status(200).send({
    statusCode: 200,
    jwt: {
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
    data: {
      user: {
        id: emailExistUser?.getDataValue("id"),
        username: emailExistUser?.getDataValue("username"),
        email: emailExistUser?.getDataValue("email"),
      },
    },
  });
});

app.post("/v1/auth/register", async (req, res) => {
  const { username, password, email } = req.body as {
    username: string;
    password: string;
    email: string;
  };

  if (
    !process.env.JWT_SECRET &&
    !process.env.JWT_EXPIRATION &&
    !process.env.JWT_REFRESH_EXPIRATION
  ) {
    res.status(500).send("Server Error");
  }

  if (
    Object.keys(
      generateEmptyFieldsError({
        username,
        password,
        email,
      })
    ).length > 0
  ) {
    return res.status(400).send({
      errors: generateEmptyFieldsError({
        username,
        password,
        email,
      }),
    });
  }

  const { Users } = getPGData();

  const usernameExistUser = await Users.findOne({
    where: {
      username: username,
    },
  });
  const emailExistUser = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (usernameExistUser && !usernameExistUser.isNewRecord) {
    let errors: Record<string, unknown> = {};
    if (usernameExistUser?.getDataValue("username") === username) {
      return res.status(400).send({
        errors: {
          username: "Username already exist",
        },
      });
    }
  }

  if (emailExistUser && !emailExistUser.isNewRecord) {
    let errors: Record<string, unknown> = {};
    if (emailExistUser?.getDataValue("email") === email) {
      return res.status(400).send({
        errors: {
          email: "Email already exist",
        },
      });
    }
  }

  const passwordErrors = generatePasswordStrongError(password);
  if (Object.keys(passwordErrors).length > 0) {
    return res.status(400).send({
      errors: passwordErrors,
    });
  }

  const encryptedPassword = bcrypt.hashSync(password, 10);

  const createdUser = await Users.create({
    username: username,
    password: encryptedPassword.toString(),
    email: email,
  });

  const accessToken = generateToken({
    id: createdUser.getDataValue("id") as string,
    username: createdUser.getDataValue("username") as string,
    email: createdUser.getDataValue("email") as string,
  });

  const refreshToken = generateRefreshToken({
    id: createdUser.getDataValue("id") as string,
    username: createdUser.getDataValue("username") as string,
    email: createdUser.getDataValue("email") as string,
  });

  await getRedisClient().set(
    createdUser.getDataValue("id").toString(),
    JSON.stringify({
      user: {
        id: createdUser.getDataValue("id") as string,
        username: createdUser.getDataValue("username") as string,
        email: createdUser.getDataValue("email") as string,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  );

  await getRedisClient().set(
    accessToken,
    JSON.stringify({
      isAccessToken: true,
      user: {
        id: createdUser.getDataValue("id") as string,
        username: createdUser.getDataValue("username") as string,
        email: createdUser.getDataValue("email") as string,
      },
      accessToken: accessToken,

      refreshToken: refreshToken,
    }),
    {
      EX: parseInt(process.env.JWT_EXPIRATION || "3600"),
    }
  );

  await getRedisClient().set(
    refreshToken,
    JSON.stringify({
      isRefreshToken: true,
      user: {
        id: createdUser.getDataValue("id") as string,
        username: createdUser.getDataValue("username") as string,
        email: createdUser.getDataValue("email") as string,
      },
      accessToken: accessToken,

      refreshToken: refreshToken,
    }),
    {
      EX: parseInt(process.env.JWT_REFRESH_EXPIRATION || "3600"),
    }
  );

  res.status(200).send({
    statusCode: 200,
    jwt: {
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
    data: {
      user: {
        id: createdUser.getDataValue("id"),
        username: createdUser.getDataValue("username"),
        email: createdUser.getDataValue("email"),
      },
    },
  });
});

app.get("/v1/auth/me", async (req, res) => {
  const { authorization } = req.headers as {
    authorization: string;
  };

  if (!authorization) {
    return res.status(401).send({
      errors: {
        authorization: "Invalid Authorization",
      },
    });
  }

  const accessToken = authorization.split(" ")[1];

  try {
    const verifiedToken = verifyToken(accessToken);

    if (verifiedToken === null || !JSON.stringify(verifiedToken)) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    const userAuthData = await getRedisClient().get(accessToken);
    if (JSON.parse(userAuthData || "{}").isAccessToken !== true) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    if (!JSON.stringify(userAuthData) || !userAuthData) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    const { Users } = getPGData();

    const user = await Users.findOne({
      where: {
        id: JSON.parse(userAuthData).user.id,
      },
    });

    if (!user) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    res.status(200).send({
      statusCode: 200,
      jwt: {
        accessToken: accessToken,
        refreshToken: JSON.parse(userAuthData).refreshToken,
      },
      data: {
        user: {
          id: user.getDataValue("id"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
        },
      },
    });
  } catch (error) {
    console.log("error");
    res.send(error);
  }
});

app.get("/v1/auth/refreshtoken", async (req, res) => {
  const { authorization } = req.headers as {
    authorization: string;
  };
  const refreshToken = authorization.split(" ")[1];
  const redisString = await getRedisClient().get(refreshToken);

  if (!redisString) {
    return res.status(401).send({
      statusCode: 401,
      error: {
        message: "Unauthorized",
      },
    });
  }
  const parsedData = JSON.parse(redisString || "");

  if (!parsedData.isRefreshToken) {
    res.status(401).send({
      statusCode: 401,
      error: {
        message: "Unauthorized",
      },
    });
  }
  await getRedisClient().del(refreshToken);
  await getRedisClient().del(parsedData.accessToken);
  await getRedisClient().del(parsedData.user.id.toString());

  const accessToken = generateToken({
    id: parsedData.user.id.toString(),
    username: parsedData.user.username,
    email: parsedData.user.email,
  });

  const newRefreshToken = generateRefreshToken({
    id: parsedData.user.id.toString(),
    username: parsedData.user.username,
    email: parsedData.user.email,
  });

  getRedisClient().set(
    parsedData.user.id.toString(),
    JSON.stringify({
      user: {
        id: parsedData.user.id.toString(),
        username: parsedData.user.username,
        email: parsedData.user.email,
      },
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    })
  );

  getRedisClient().set(
    accessToken,
    JSON.stringify({
      isAccessToken: true,
      user: {
        id: parsedData.user.id.toString(),
        username: parsedData.user.username,
        email: parsedData.user.email,
      },
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    })
  );

  getRedisClient().set(
    newRefreshToken,
    JSON.stringify({
      isRefreshToken: true,
      user: {
        id: parsedData.user.id.toString(),
        username: parsedData.user.username,
        email: parsedData.user.email,
      },
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    })
  );

  res.status(200).send({
    statusCode: 200,
    jwt: {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    },
    data: {
      user: parsedData.user,
    },
  });
});

app.get("/v1/auth/logout", async (req, res) => {
  const { authorization } = req.headers as {
    authorization: string;
  };
  const accessToken = authorization.split(" ")[1];

  try {
    const verifiedToken = verifyToken(accessToken);

    if (verifiedToken === null || !JSON.stringify(verifiedToken)) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    const userAuthData = await getRedisClient().get(accessToken);

    if (!JSON.parse(userAuthData || "{}").isAccessToken) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    if (!JSON.stringify(userAuthData) || !userAuthData) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    await getRedisClient().del(accessToken);
    await getRedisClient().del(JSON.parse(userAuthData).refreshToken);
    await getRedisClient().del(JSON.parse(userAuthData).user.id.toString());

    const { Users } = getPGData();

    const user = await Users.findOne({
      where: {
        id: JSON.parse(userAuthData).user.id,
      },
    });

    if (!user) {
      return res.status(401).send({
        statusCode: 401,
        error: {
          message: "Unauthorized",
        },
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "User logout successfully",
      data: {
        user: {
          id: user.getDataValue("id"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
        },
      },
    });
  } catch (error) {
    res.send(error);
  }
});

app.listen(port);
