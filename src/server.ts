import app from "./app"
import { prisma } from "./lib/prisma";
 import config from "./config";


const PORT = config.port;


async function main(){
  try {
    await prisma.$connect()
    console.log("Server Connected Successfully")
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  } catch (error) {
    console.log(`Error starting the server: ${error}`);
    await prisma.$disconnect()
    process.exit(1);
  }
}

main()