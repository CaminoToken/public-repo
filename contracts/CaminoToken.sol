//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaminoToken is ERC20PresetMinterPauser, Ownable {
    uint8 _decimals;

    /// @dev Decimals with which percentages are represented
    /// For example, 2.76% will be represented by 276
    uint16 constant _percentageDecimals = 2;

    /// @dev percentage of tokens burnt on every transfer transaction
    /// Set to 0 for regular, non-taxed transactions
    uint16 public burnRate;
    
    constructor(
        string memory _name, 
        string memory _symbol, 
        uint8 _tokenDecimals,
        uint initialSupply,
        uint16 _burnRate
        ) ERC20PresetMinterPauser(_name, _symbol) {
            _decimals = _tokenDecimals;
            burnRate = _burnRate;
            
            _mint(msg.sender, initialSupply);
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        _revokeRole(DEFAULT_ADMIN_ROLE, owner());
        
        _revokeRole(MINTER_ROLE, owner());
        _revokeRole(PAUSER_ROLE, owner());

        _setupRole(MINTER_ROLE, newOwner);
        _setupRole(PAUSER_ROLE, newOwner);

        _transferOwnership(newOwner);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        uint burnAmount = amount * burnRate / 100 / 10**_percentageDecimals;
        _burn(msg.sender, burnAmount);

        _transfer(msg.sender, recipient, amount - burnAmount);
        return true;
    }

    /**
    * @dev Changes the burnRate for transfers
    * @param newRate New value for burnRate
    **/
    function setBurnRate(uint16 newRate) public onlyOwner {
        require(newRate < 100 * 10**_percentageDecimals, "Invalid value for newRate");
        burnRate = newRate;
    }
    
    /**
    * @dev Mints tokens to multiple addresses
    * @param receivers The addresses to mint tokens to
    * @param amounts Number of tokens to mint to each receiver
    **/
    function airdropMint(address[] memory receivers, uint256[] memory amounts) public onlyOwner {
        require(receivers.length == amounts.length, "Number of receivers and amounts should be same");

        for (uint256 i = 0; i < receivers.length; i++) {
            _mint(receivers[i], amounts[i]);
        }
    }
}