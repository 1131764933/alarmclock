import hre from "hardhat";

async function main() {
  const AlarmClock = await hre.ethers.getContractFactory("AlarmClock");
  const alarmClock = await AlarmClock.deploy();
  
  await alarmClock.waitForDeployment();
  const address = await alarmClock.getAddress();
  
  console.log("AlarmClock deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
