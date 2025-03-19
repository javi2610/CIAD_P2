require("dotenv").config();
const { ethers } = require("ethers");
const inquirer = require("inquirer");

// Configuración de entorno
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

// Configurar proveedor y signer
const provider = new ethers.AlchemyProvider("sepolia", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Importar ABI del contrato
const contractJson = require("./artifacts/contracts/MyNFT.sol/MyNFT.json");
const abi = contractJson.abi;
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer);

// Función para mostrar el menú interactivo
async function showMenu() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "¿Qué acción deseas realizar?",
      choices: [
        "Mintear un NFT",
        "Transferir un NFT",
        "Consultar el dueño de un NFT",
        "Listar mis NFTs",
        "Salir"
      ],
    },
  ]);

  switch (answers.action) {
    case "Mintear un NFT":
      await mintNFT();
      break;
    case "Transferir un NFT":
      await transferNFT();
      break;
    case "Consultar el dueño de un NFT":
      await getOwner();
      break;
    case "Listar mis NFTs":
      await listMyNFTs();
      break;
    case "Salir":
      console.log("Saliendo...");
      process.exit(0);
  }

  showMenu();
}

// Función para mintear un NFT
async function mintNFT() {
  const { tokenURI } = await inquirer.prompt([
    {
      type: "input",
      name: "tokenURI",
      message: "Introduce la URL del token en IPFS:",
      validate: input => input.startsWith("https://") ? true : "La URL debe comenzar con 'https://'",
    },
  ]);
  try {
    console.log("Minteando NFT...");
    let tx = await nftContract.mintNFT(signer.address, tokenURI);
    await tx.wait();
    console.log(`✅ NFT minteado con éxito: https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Error al mintear NFT:", error.message);
  }
}

// Función para transferir un NFT
async function transferNFT() {
  const { to, tokenId } = await inquirer.prompt([
    {
      type: "input",
      name: "to",
      message: "Introduce la dirección de destino:",
      validate: input => ethers.isAddress(input) ? true : "Introduce una dirección Ethereum válida",
    },
    {
      type: "input",
      name: "tokenId",
      message: "Introduce el ID del NFT a transferir:",
      validate: input => /^\d+$/.test(input) ? true : "Introduce un número válido para el ID",
    },
  ]);
  try {
    console.log("Transfiriendo NFT...");
    let tx = await nftContract["safeTransferFrom(address,address,uint256)"](signer.address, to, tokenId);
    await tx.wait();
    console.log(`✅ NFT transferido con éxito: https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Error al transferir NFT:", error.message);
  }
}

// Función para obtener el dueño de un NFT
async function getOwner() {
  const { tokenId } = await inquirer.prompt([
    {
      type: "input",
      name: "tokenId",
      message: "Introduce el ID del NFT:",
      validate: input => /^\d+$/.test(input) ? true : "Introduce un número válido para el ID",
    },
  ]);
  try {
    let owner = await nftContract.ownerOf(tokenId);
    console.log(`🔹 El propietario del NFT ${tokenId} es: ${owner}`);
  } catch (error) {
    console.error("❌ Error al obtener el dueño del NFT:", error.message);
  }
}

// Función para listar los NFTs del usuario
async function listMyNFTs() {
  try {
    console.log("Obteniendo tus NFTs...");
    let tokens = await nftContract.tokensOfOwner(signer.address);
    if (tokens.length === 0) {
      console.log("🔹 No tienes NFTs en este contrato.");
    } else {
      console.log(`🔹 Tus NFTs: ${tokens.join(", ")}`);
    }
  } catch (error) {
    console.error("❌ Error al obtener la lista de NFTs:", error.message);
  }
}

// Iniciar la aplicación
console.log("🎨 Bienvenido al CLI de gestión de NFTs");
showMenu();
