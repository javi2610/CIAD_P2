async function main() {
  try {
      const [deployer] = await ethers.getSigners();
      console.log(`Deploying contract with account: ${deployer.address}`);

      // Obtener la fábrica del contrato
      const MyNFT = await ethers.getContractFactory("MyNFT");
      console.log("Contract factory retrieved successfully.");

      // Desplegar el contrato
      console.log("Deploying contract...");
      const myNFT = await MyNFT.deploy(deployer.address);

      // Esperar a que la transacción de despliegue se confirme
      await myNFT.waitForDeployment();
      console.log(`Contract successfully deployed to address: ${await myNFT.getAddress()}`);

      const tx = myNFT.deploymentTransaction();
      console.log(`Transaction hash: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`Gas used for deployment: ${receipt.gasUsed.toString()}`);

  } catch (error) {
      console.error("Deployment failed:", error.message);
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
      console.error("Unexpected error:", error.message);
      process.exit(1);
  });