// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract NFT1155 is ERC1155URIStorage, Ownable, Pausable, ReentrancyGuard {
    mapping(address => mapping(uint256 => uint256)) private mintCounts; // userAddress => tokenId => count
    mapping(uint256 => uint256) public prices; // tokenId => price
    address public moneyReceiver;

    event Mint(
        address indexed userAddress,
        uint256 tokenId,
        uint256 count,
        uint256 amount
    );
    event SetMoneyReceiver(address indexed newMoneyReceiver);
    event SetCounts(uint256 addressesCount);
    event SetPrice(uint256 tokenId, uint256 price);
    event Withdrawed(address indexed to, uint256 amount, uint256 remainder);

    constructor() ERC1155("") {
        moneyReceiver = _msgSender();
    }

    receive() external payable {}

    fallback() external payable {}

    function mint(
        uint256 _tokenId,
        uint256 _count,
        bytes memory _data
    ) external payable nonReentrant whenNotPaused {
        require(_count > 0, "Count Greater than 0");
        require(mintCounts[_msgSender()][_tokenId] >= _count, "Limit reached");
        if (prices[_tokenId] > 0) {
            require(
                msg.value == prices[_tokenId] * _count,
                "Not correct value"
            );
            bool sent = payable(moneyReceiver).send(msg.value);
            require(sent, "Failed to send");
        }
        mintCounts[_msgSender()][_tokenId] -= _count;
        _mint(_msgSender(), _tokenId, _count, _data);
        emit Mint(_msgSender(), _tokenId, _count, prices[_tokenId] * _count);
    }

    function getRemainder(address _user, uint256 _tokenId)
        external
        view
        onlyOwner
        returns (uint256)
    {
        return mintCounts[_user][_tokenId];
    }

    function getPrice(uint256 _tokenId) external view returns (uint256) {
        return prices[_tokenId];
    }

    function setURI(uint256 _tokenId, string memory _newURI)
        external
        onlyOwner
    {
        _setURI(_tokenId, _newURI);
    }

    function setCounts(
        address[] memory _users,
        uint256[] memory _ids,
        uint256[] memory _counts
    ) external onlyOwner {
        require(
            _users.length == _ids.length && _ids.length == _counts.length,
            "Arrays of the same length are expected"
        );
        for (uint256 i = 0; i < _users.length; i++) {
            mintCounts[_users[i]][_ids[i]] = _counts[i];
        }
        emit SetCounts(_users.length);
    }

    function setMoneyReceiver(address _moneyReceiver) external onlyOwner {
        moneyReceiver = _moneyReceiver;
        emit SetMoneyReceiver(_moneyReceiver);
    }

    function setPrice(uint256 _tokenId, uint256 _price) external onlyOwner {
        prices[_tokenId] = _price;
        emit SetPrice(_tokenId, _price);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
