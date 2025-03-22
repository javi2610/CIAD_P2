const fs = require("fs");
const dotenv = require("dotenv");

// Permitir pasar el archivo env como argumento
const envChoice = process.argv[2] || ".env";
dotenv.config({ path: envChoice });

const { ethers } = require("ethers");
const inquirer = require("inquirer");
const ora = require("ora");

// Configuración de entorno
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

const provider = new ethers.AlchemyProvider("sepolia", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractJson = require("./artifacts/contracts/MyNFT.sol/MyNFT.json");
const abi = contractJson.abi;
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer);

// Mostrar balance
async function checkBalance() {
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Balance disponible: ${ethers.formatEther(balance)} ETH`);
  if (balance < ethers.parseEther("0.005")) {
    console.log("⚠️ Advertencia: Tu saldo es bajo, las transacciones pueden fallar.");
  }
}

// Menú principal con subcategorías
async function showMenu() {
  try {
    await checkBalance();
    const { section } = await inquirer.prompt([
      {
        type: "list",
        name: "section",
        message: "Selecciona una categoría:",
        choices: [
          "🎨 Gestión de mis NFTs",
          "🏷️ Marketplace (comprar/vender)",
          "🔍 Consultas",
          "🚪 Salir",
        ],
      },
    ]);

    switch (section) {
      case "🎨 Gestión de mis NFTs":
        return showPersonalMenu();
      case "🏷️ Marketplace (comprar/vender)":
        return showMarketplaceMenu();
      case "🔍 Consultas":
        return showConsultasMenu();
      case "🚪 Salir":
        console.log("👋 ¡Hasta pronto!");
        return process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error en el menú principal:", error.message);
  }
}

// Submenú: Gestión de NFTs
async function showPersonalMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "¿Qué quieres hacer?",
      choices: [
        "Mintear un NFT",
        //"Transferir un NFT",
        "Listar mis NFTs",
        "⬅️ Volver",
      ],
    },
  ]);

  switch (action) {
    case "Mintear un NFT":
      await mintNFT();
      break;
    //case "Transferir un NFT":
    //  await transferNFT();
    //  break;
    case "Listar mis NFTs":
      await listMyNFTs();
      break;
    case "⬅️ Volver":
      return showMenu();
  }

  showPersonalMenu();
}

// Submenú: Marketplace
async function showMarketplaceMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Opciones de compra/venta:",
      choices: [
        "Poner en venta un NFT",
        "Cancelar venta de un NFT",
        "Comprar un NFT",
        "Ver NFTs en venta",
        "⬅️ Volver",
      ],
    },
  ]);

  switch (action) {
    case "Poner en venta un NFT":
      await listNFT();
      break;
    case "Cancelar venta de un NFT":
      await cancelSale();
      break;
    case "Comprar un NFT":
      await buyNFT();
      break;
    case "Ver NFTs en venta":
      await viewListedNFTs();
      break;
    case "⬅️ Volver":
      return showMenu();
  }

  showMarketplaceMenu();
}

// Submenú: Consultas
async function showConsultasMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Consultas disponibles:",
      choices: [
        "Consultar el dueño de un NFT",
        "⬅️ Volver",
      ],
    },
  ]);

  switch (action) {
    case "Consultar el dueño de un NFT":
      await getOwner();
      break;
    case "⬅️ Volver":
      return showMenu();
  }

  showConsultasMenu();
}

// 🎨 Funciones de acción

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
    const spinner = ora("Minteando NFT...").start();
    const tx = await nftContract.mintNFT(signer.address, tokenURI);
    await tx.wait();
    spinner.succeed(`✅ NFT minteado con éxito: https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Error al mintear NFT:", error.message);
  }
}

async function listMyNFTs() {
  try {
    const tokens = await nftContract.tokensOfOwner(signer.address);
    if (tokens.length === 0) {
      console.log("🔹 No tienes NFTs.");
    } else {
      console.log("🔹 Tus NFTs:");
      tokens.forEach(t => console.log(` - ID: ${t}`));
    }
  } catch (error) {
    console.error("❌ Error al listar NFTs:", error.message);
  }
}
/*
async function transferNFT() {
  try {
    const tokens = await nftContract.tokensOfOwner(signer.address);
    if (tokens.length === 0) return console.log("🔹 No tienes NFTs para transferir.");

    const { tokenId, to } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenId",
        message: "Selecciona el NFT a transferir:",
        choices: tokens.map(String),
      },
      {
        type: "input",
        name: "to",
        message: "Introduce la dirección de destino:",
        validate: input => ethers.isAddress(input) ? true : "Dirección Ethereum no válida",
      },
    ]);

    const spinner = ora("Transfiriendo NFT...").start();
    const tx = await nftContract["safeTransferFrom(address,address,uint256)"](signer.address, to, tokenId);
    await tx.wait();
    spinner.succeed(`✅ NFT transferido con éxito: https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Error al transferir NFT:", error.message);
  }
}*/

async function getOwner() {
  try {
    const { tokenId } = await inquirer.prompt([
      {
        type: "input",
        name: "tokenId",
        message: "Introduce el ID del NFT:",
        validate: input => /^\d+$/.test(input) ? true : "ID no válido",
      },
    ]);
    const owner = await nftContract.ownerOf(tokenId);
    console.log(`🔹 El propietario del NFT ${tokenId} es: ${owner}`);
  } catch (error) {
    console.error("❌ Error al obtener el dueño:", error.message);
  }
}

async function viewListedNFTs() {
  try {
    const listed = await nftContract.getTokensEnVenta();
    if (listed.length === 0) return console.log("🔹 No hay NFTs actualmente en venta.");

    console.log("🛒 NFTs en venta:");
    for (const id of listed) {
      const price = await nftContract.tokenPrices(id);
      const priceEth = ethers.formatEther(price);
      console.log(` - NFT ID ${id} → ${priceEth} ETH`);
    }
  } catch (error) {
    console.error("❌ Error al obtener NFTs en venta:", error.message);
  }
}

async function listNFT() {
  try {
    const tokens = await nftContract.tokensOfOwner(signer.address);
    if (tokens.length === 0) return console.log("🔹 No tienes NFTs disponibles.");

    const { tokenId, price } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenId",
        message: "Selecciona el NFT que deseas poner en venta:",
        choices: tokens.map(String),
      },
      {
        type: "input",
        name: "price",
        message: "Introduce el precio en ETH:",
        validate: input => !isNaN(input) && Number(input) > 0 ? true : "Precio no válido",
      },
    ]);

    const spinner = ora("Publicando NFT en venta...").start();
    const priceInWei = ethers.parseEther(price);
    const tx = await nftContract.setPrice(tokenId, priceInWei);
    await tx.wait();
    spinner.succeed(`✅ NFT ${tokenId} puesto en venta por ${price} ETH`);
  } catch (err) {
    console.error("❌ Error al poner en venta:", err.message);
  }
}

async function cancelSale() {
  try {
    const tokens = await nftContract.tokensOfOwner(signer.address);
    if (tokens.length === 0) return console.log("🔹 No tienes NFTs listados.");

    const { tokenId } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenId",
        message: "Selecciona el NFT del que deseas cancelar la venta:",
        choices: tokens.map(String),
      },
    ]);

    const spinner = ora("Cancelando venta...").start();
    const tx = await nftContract.cancelSale(tokenId);
    await tx.wait();
    spinner.succeed(`✅ Venta cancelada para el NFT ${tokenId}`);
  } catch (err) {
    console.error("❌ Error al cancelar venta:", err.message);
  }
}

async function buyNFT() {
  try {
    const { tokenId } = await inquirer.prompt([
      {
        type: "input",
        name: "tokenId",
        message: "Introduce el ID del NFT que deseas comprar:",
        validate: input => /^\d+$/.test(input) ? true : "ID no válido",
      },
    ]);

    const price = await nftContract.tokenPrices(tokenId);
    if (price == 0n) return console.log("❌ Ese NFT no está en venta.");

    const priceInEth = ethers.formatEther(price);
    console.log(`💰 Precio: ${priceInEth} ETH`);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "¿Confirmas la compra?",
      },
    ]);

    if (!confirm) return;

    const spinner = ora("Realizando compra...").start();
    const tx = await nftContract.buyNFT(tokenId, { value: price });
    await tx.wait();
    spinner.succeed(`✅ NFT ${tokenId} comprado por ${priceInEth} ETH`);
  } catch (err) {
    console.error("❌ Error al comprar:", err.message);
  }
}


// Iniciar CLI
console.log("🎨 Bienvenido al CLI de gestión de NFTs");
showMenu();
