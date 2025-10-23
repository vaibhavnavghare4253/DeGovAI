// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev ERC20 token for DAO governance
 * @author Vaibhav Navghare
 */
contract GovernanceToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    
    mapping(address => bool) public hasClaimedInitial;
    uint256 public initialClaimAmount = 100 * 10**18; // 100 tokens per claim
    
    event TokensClaimed(address indexed claimer, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    event InitialClaimAmountUpdated(uint256 newAmount);
    
    constructor() 
        ERC20("AI DAO Governance Token", "AIGOVERN")
        Ownable()
    {
        // Mint initial supply to contract deployer
        _mint(msg.sender, 100_000 * 10**18); // 100k tokens for initial distribution
    }
    
    /**
     * @dev Allows users to claim initial tokens (one-time)
     */
    function claimInitialTokens() external {
        require(!hasClaimedInitial[msg.sender], "Already claimed initial tokens");
        require(totalSupply() + initialClaimAmount <= MAX_SUPPLY, "Max supply exceeded");
        
        hasClaimedInitial[msg.sender] = true;
        _mint(msg.sender, initialClaimAmount);
        
        emit TokensClaimed(msg.sender, initialClaimAmount);
    }
    
    /**
     * @dev Mints new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
        
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Updates the initial claim amount (only owner)
     */
    function setInitialClaimAmount(uint256 newAmount) external onlyOwner {
        initialClaimAmount = newAmount;
        emit InitialClaimAmountUpdated(newAmount);
    }
}