// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DAOTreasury
 * @dev Manages DAO treasury funds with multi-signature and AI oracle integration
 * @author Vaibhav Navghare
 */
contract DAOTreasury is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    
    struct FundAllocation {
        uint256 proposalId;
        address recipient;
        uint256 amount;
        string purpose;
        bool executed;
        uint256 approvedAt;
        uint256 executedAt;
    }
    
    mapping(uint256 => FundAllocation) public allocations;
    uint256 public allocationCount;
    
    uint256 public totalAllocated;
    uint256 public totalDisbursed;
    
    event FundsReceived(address indexed from, uint256 amount);
    event AllocationApproved(uint256 indexed allocationId, uint256 proposalId, address recipient, uint256 amount);
    event FundsDisbursed(uint256 indexed allocationId, address recipient, uint256 amount);
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    constructor(address governorAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, governorAddress);
    }
    
    /**
     * @dev Receive ETH deposits
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Get treasury balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Approve fund allocation (called by governor)
     */
    function approveAllocation(
        uint256 proposalId,
        address recipient,
        uint256 amount,
        string memory purpose
    ) external onlyRole(GOVERNOR_ROLE) returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient treasury balance");
        
        uint256 allocationId = allocationCount++;
        
        allocations[allocationId] = FundAllocation({
            proposalId: proposalId,
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            executed: false,
            approvedAt: block.timestamp,
            executedAt: 0
        });
        
        totalAllocated += amount;
        
        emit AllocationApproved(allocationId, proposalId, recipient, amount);
        return allocationId;
    }
    
    /**
     * @dev Execute approved allocation
     */
    function executeAllocation(uint256 allocationId) 
        external 
        onlyRole(GOVERNOR_ROLE) 
        nonReentrant 
    {
        FundAllocation storage allocation = allocations[allocationId];
        
        require(!allocation.executed, "Already executed");
        require(allocation.amount > 0, "Allocation does not exist");
        require(address(this).balance >= allocation.amount, "Insufficient balance");
        
        allocation.executed = true;
        allocation.executedAt = block.timestamp;
        totalDisbursed += allocation.amount;
        
        (bool success, ) = allocation.recipient.call{value: allocation.amount}("");
        require(success, "Transfer failed");
        
        emit FundsDisbursed(allocationId, allocation.recipient, allocation.amount);
    }
    
    /**
     * @dev Batch execute multiple allocations (gas optimization)
     */
    function batchExecuteAllocations(uint256[] memory allocationIds) 
        external 
        onlyRole(GOVERNOR_ROLE) 
        nonReentrant 
    {
        for (uint256 i = 0; i < allocationIds.length; i++) {
            uint256 allocationId = allocationIds[i];
            FundAllocation storage allocation = allocations[allocationId];
            
            if (!allocation.executed && allocation.amount > 0 && address(this).balance >= allocation.amount) {
                allocation.executed = true;
                allocation.executedAt = block.timestamp;
                totalDisbursed += allocation.amount;
                
                (bool success, ) = allocation.recipient.call{value: allocation.amount}("");
                if (success) {
                    emit FundsDisbursed(allocationId, allocation.recipient, allocation.amount);
                }
            }
        }
    }
    
    /**
     * @dev Emergency withdrawal (admin only)
     */
    function emergencyWithdraw(address payable to, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        require(to != address(0), "Invalid address");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyWithdrawal(to, amount);
    }
    
    /**
     * @dev Get allocation details
     */
    function getAllocation(uint256 allocationId) 
        external 
        view 
        returns (
            uint256 proposalId,
            address recipient,
            uint256 amount,
            string memory purpose,
            bool executed,
            uint256 approvedAt,
            uint256 executedAt
        ) 
    {
        FundAllocation memory allocation = allocations[allocationId];
        return (
            allocation.proposalId,
            allocation.recipient,
            allocation.amount,
            allocation.purpose,
            allocation.executed,
            allocation.approvedAt,
            allocation.executedAt
        );
    }
    
    /**
     * @dev Grant AI Oracle role
     */
    function setAIOracle(address oracleAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(AI_ORACLE_ROLE, oracleAddress);
    }
}

