pragma solidity ^0.5.0;

contract SimpleStorage {
  address public owner;
  string ipfsHash;
  mapping(bytes => bool) private docProofs;

 constructor() public {
    owner = msg.sender;
  }

   // First Notarize Document
  function notarize(string memory document) public {
    bytes memory proof = abi.encodePacked(document);
    docProofs[proof] = true;
  }

  // Now check for Document if it exists and notarized
  function checkDocument(string memory document) public view returns (bool) {
    bytes memory proof = abi.encodePacked(document);
    return docProofs[proof];
  }
}
