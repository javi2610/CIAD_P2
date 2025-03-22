// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MyNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;

    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) public tokenPrices;
    uint256[] public tokensEnVenta;

    event NFTMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTDelisted(uint256 indexed tokenId);
    event NFTSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);

    constructor(address initialOwner) ERC721("MyNFT", "NFT") Ownable(initialOwner) {}

    function mintNFT(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(recipient != address(0), "Invalid recipient address");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _ownedTokens[recipient].push(newItemId);

        emit NFTMinted(recipient, newItemId, tokenURI);
        return newItemId;
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function setPrice(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        tokenPrices[tokenId] = price;
        tokensEnVenta.push(tokenId);
        emit NFTListed(tokenId, price);
    }

    function cancelSale(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(tokenPrices[tokenId] > 0, "Token not listed");

        tokenPrices[tokenId] = 0;
        _removeTokenFromSale(tokenId);
        emit NFTDelisted(tokenId);
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant {
        uint256 price = tokenPrices[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "NFT not for sale");
        require(msg.value >= price, "Not enough ETH");

        _transfer(seller, msg.sender, tokenId);

        tokenPrices[tokenId] = 0;
        _removeTokenFromSale(tokenId);

        _ownedTokens[msg.sender].push(tokenId);
        _removeTokenFromOwner(seller, tokenId);

        payable(seller).transfer(price);

        emit NFTSold(tokenId, seller, msg.sender, price);
    }

    function getTokensEnVenta() public view returns (uint256[] memory) {
        return tokensEnVenta;
    }

    function _removeTokenFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage tokens = _ownedTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    function _removeTokenFromSale(uint256 tokenId) internal {
        for (uint256 i = 0; i < tokensEnVenta.length; i++) {
            if (tokensEnVenta[i] == tokenId) {
                tokensEnVenta[i] = tokensEnVenta[tokensEnVenta.length - 1];
                tokensEnVenta.pop();
                break;
            }
        }
    }
}
