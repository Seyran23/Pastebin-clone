const express = require("express");
const app = express();
const { PORT, CLIENT_URL } = require("./utils/enviromentVariables");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./modules/user/route");
const pasteRouter = require("./modules/paste/route");
const authRouter = require("./modules/auth/route");

const expiredPasteService = require("./services/expiredPastes.service");
const db = require("./db/models");

const bcrypt = require("bcrypt")

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");


// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL,
  })
);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/pastes", pasteRouter);


const startServer = async () => {
  try {
    await db.sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });


    const parol = await bcrypt.hash('admin', 10)
    console.log(parol);
    

  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

startServer()