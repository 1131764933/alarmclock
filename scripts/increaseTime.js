import hre from "hardhat";

async function main() {
  const seconds = 180;
  await hre.network.provider.send("evm_increaseTime", [seconds]);
  await hre.network.provider.send("evm_mine");
  console.log(`Time increased by ${seconds} seconds`);
}

main();
