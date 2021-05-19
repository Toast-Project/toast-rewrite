import ToastClient from "./util/classes/ToastClient";

const client = new ToastClient();
client.connect();

// Catch unhandled rejections since slash commands cause issues due to slow update rollout
process.on("unhandledRejection", (reason, p) => {});