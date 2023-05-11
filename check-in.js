import StarRail from "./index.js";

const starrail = new StarRail();
await starrail.run()
.catch((e) => {
    console.error(e);
    process.exit(1);
});

console.log("Done!");
process.exit(0);
