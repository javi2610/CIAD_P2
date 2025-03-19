// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Evento para registrar la acuñación de NFTs
    event NFTMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("MyNFT", "NFT") Ownable(initialOwner) {}

    /**
     * @dev Acuña un nuevo NFT y asigna un tokenURI almacenado en IPFS.
     * @param recipient Dirección del destinatario del NFT.
     * @param tokenURI URI del NFT en IPFS.
     * @return newItemId ID del nuevo NFT acuñado.
     */
    function mintNFT(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(recipient != address(0), "Invalid recipient address");

        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit NFTMinted(recipient, newItemId, tokenURI);
        return newItemId;
    }

    /**
     * @dev Obtiene todos los NFTs de un usuario.
     * @param owner Dirección del usuario.
     * @return tokens Lista de IDs de los NFTs del usuario.
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        return tokens;
    }
}
