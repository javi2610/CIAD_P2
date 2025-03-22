# 🧠 CIAD: Práctica 2 - Gestión, Venta y Compra de NFTs en Ethereum

Este proyecto implementa un sistema integral para la creación, gestión y compraventa de NFTs (tokens ERC-721) sobre la red de pruebas **Sepolia** en Ethereum. Incluye un contrato inteligente en Solidity desplegado con Hardhat, y una aplicación de línea de comandos (CLI) construida con Node.js que permite interactuar con el contrato de forma sencilla e intuitiva.

El proyecto hace uso de **almacenamiento descentralizado (IPFS)** para los metadatos, y de herramientas modernas como **ethers.js**, **inquirer** y **Alchemy**.

---

## 🚀 Tecnologías Utilizadas

- **Solidity** – Lógica del contrato inteligente
- **Hardhat** – Framework de desarrollo, pruebas y despliegue
- **Alchemy + Sepolia** – Nodo Ethereum para red de pruebas
- **Metamask** – Wallet para firmar transacciones
- **Pinata / IPFS** – Almacenamiento descentralizado para metadatos
- **Node.js + ethers.js + inquirer + ora** – Aplicación CLI interactiva

---

## 🛠️ Funcionalidades del Contrato Inteligente

### ✅ Lógica principal

- `mintNFT(address recipient, string memory tokenURI)`  
  Acuña un nuevo NFT, asociando un token URI almacenado en IPFS.

- `tokensOfOwner(address owner)`  
  Devuelve los IDs de los NFTs que posee una dirección.

- `setPrice(uint256 tokenId, uint256 price)`  
  El propietario puede poner su NFT en venta por un precio determinado (en wei).

- `cancelSale(uint256 tokenId)`  
  Cancela la venta de un NFT (solo el propietario puede hacerlo).

- `buyNFT(uint256 tokenId)`  
  Cualquier usuario puede comprar un NFT si paga el precio indicado.

- `getTokensEnVenta()`  
  Devuelve la lista de NFTs actualmente en venta.

### 🛡️ Seguridad y buenas prácticas

- Validaciones con `require` para evitar errores lógicos y accesos no autorizados.
- Uso de `_safeMint` para una acuñación segura.
- Protección ante ataques de reentrada usando `ReentrancyGuard`.
- Optimización de gas mediante `mapping` para almacenar los NFTs de cada usuario.
- Limpieza de arrays de forma eficiente (`_removeTokenFromOwner`, `_removeTokenFromSale`).

---

## 💻 Aplicación de Línea de Comandos (CLI)

Una aplicación sencilla y usable desde la terminal que permite gestionar NFTs sin necesidad de frontend.

### 🧩 Funciones disponibles:

#### 🎨 Gestión Personal
- **Mintear NFT** – Acuñar un NFT indicando su URI en IPFS.
- **Listar mis NFTs** – Ver IDs de los NFTs que pertenecen a tu wallet.

#### 🏷️ Marketplace
- **Poner en venta un NFT** – Definir un precio en ETH para un NFT propio.
- **Cancelar venta** – Retirar de la venta un NFT listado.
- **Comprar un NFT** – Adquirir un NFT pagando su precio al propietario.
- **Ver NFTs en venta** – Consultar todos los NFTs actualmente listados en el marketplace.

#### 🔍 Consultas
- **Consultar el dueño de un NFT** – Saber qué dirección posee un token específico.

> Toda la interacción es guiada con menús y mensajes amigables mediante `inquirer` y `ora`.

---

## 🌐 Flujo de Trabajo Recomendado

1. **Desplegar el contrato** en la red de pruebas Sepolia usando `Hardhat`.
2. **Subir imagen y metadatos del NFT** a IPFS (ej. mediante [Pinata](https://pinata.cloud/)).
3. **Ejecutar el CLI** para mintear un NFT usando la URL IPFS.
4. **Listar el NFT a la venta** especificando su precio en ETH.
5. Otro usuario puede **comprar el NFT** desde el mismo CLI, transfiriendo automáticamente el token y el ETH.

---

## 📦 Requisitos Previos

- Tener **Node.js** instalado
- Cuenta en **Metamask** conectada a **Sepolia**
- Haber obtenido **ETH de prueba** desde un faucet
- Haber desplegado el contrato previamente con Hardhat
- Configurar un archivo `.env` como este:

```
API_KEY=tu_api_de_alchemy
PRIVATE_KEY=clave_privada_de_tu_wallet
NFT_CONTRACT_ADDRESS=direccion_del_contrato_deployado
```

---

## 📁 Estructura del Proyecto

```
├── contracts/
│   └── MyNFT.sol              ← Contrato inteligente ERC-721 personalizado
├── scripts/
│   └── deploy.js              ← Script de despliegue en Hardhat
├── cli.js                     ← Aplicación interactiva CLI
├── nft-metadata.json          ← Archivo de metadatos para IPFS
├── .env                       ← Variables sensibles (clave, API, contrato)
├── hardhat.config.js          ← Configuración de compilación y redes
└── artifacts/                 ← ABI y bytecode generado automáticamente
```

---

## ✅ Estado del Proyecto

| Funcionalidad                          | Estado |
|---------------------------------------|--------|
| Creación de NFTs                      | ✅     |
| Almacenamiento descentralizado (IPFS) | ✅     |
| Listado de NFTs por usuario           | ✅     |
| Marketplace con precios configurables | ✅     |
| Compra y transferencia automática     | ✅     |
| CLI usable e interactivo              | ✅     |
| Seguridad y protección de funciones   | ✅     |

---

## ✨ Autor

- **Nombre:** Javier Otero Vizoso  
- **Curso:** Contratos Inteligentes y Aplicaciones Descentralizadas  
- **Fecha:** Marzo 2025

