const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    console.log("Deploying CrowdFunding...");
    const crowdFunding = await CrowdFunding.deploy();

    console.log("Waiting for deployment transaction...");
    await crowdFunding.waitForDeployment();

    console.log("CrowdFunding deployed to:", await crowdFunding.getAddress());
    console.log("Deployment confirmed");
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });