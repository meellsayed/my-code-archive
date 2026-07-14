const { log } = require("console");
const path = require("path");
const fs = require("fs/promises");
const enter = require("prompt-sync")();
const EventEmitter = require("node:events");
const { exit } = require("node:process");
const event = new EventEmitter();

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getFilePath() {
  const fileName = enter("Enter File Name : ");
  const filePath = path.join(__dirname, fileName);
  return filePath;
} 

async function create() {
  const filePath = await getFilePath();

  if (await fileExists(filePath)) {
    const q = enter("File exists. overwrite? (y/n): ");
    if (q == "y") {
      await fs.writeFile(filePath, "", { encoding: "utf-8", flag: "w" });
      log("your old file deleted ; and new file created");
    } else {
      log("do no thing");
    }
  } else {
    await fs.writeFile(filePath, "", { encoding: "utf-8", flag: "a" });
    log("your file created");
  }
}
// create();

async function write() {
  const filePath = getFilePath();
  if (await fileExists(filePath)) {
    const q = enter("enter 'o' to override or 'a' if you wont append : ");
    if (q == "o") {
      const inputs = enter("Enter txt : ");
      await fs.writeFile(filePath, inputs + "\n", {
        encoding: "utf-8",
        flag: "w",
      });
      log("file override");
    } else if (q == "a") {
      const inputs = enter("Enter txt : ");
      await fs.writeFile(filePath, inputs + "\n", {
        encoding: "utf-8",
        flag: "a",
      });
      log("file append");
    } else {
      log("invald input");
    }
  } else {
    const inputs = enter("Enter txt : ");
    await fs.writeFile(filePath, inputs, { encoding: "utf-8", flag: "w" });
    log("your file created and fill");
  }
}
// write();

async function read() {
  const filePath = getFilePath();

  try {
    const data = await fs.readFile(filePath, { encoding: "utf-8", flag: "r" });
    log(data);
  } catch (error) {
    log("file path not found");
  }
}
// read();

async function del() {
  const filePath = getFilePath();
  try {
    await fs.unlink(filePath);
    log("file deleted");
  } catch (error) {
    log("file not found");
  }
}
// del();

async function main() {
  const action = enter(`
      Choose:
      1 - Create
      2 - Write
      3 - Read
      4 - Delete
      5 - Exit
      > `);

  if (action === "1") return "create";
  else if (action === "2") return "write";
  else if (action === "3") return "read";
  else if (action === "4") return "del";
  else if (action === "5") return "stop";
  else log("Invalid choice");
}

event.on("create", async () => {
  await create();
});
event.on("read", async () => {
  await read();
});
event.on("write", async () => {
  await write();
});
event.on("del", async () => {
  await del();
});
event.on("stop", async () => {
  exit()
});

async function run() {
  await event.emit(await main());
  
}

run();
