// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AncestraAgent — Sovereign AI Oracle and Trade Assistant
/// @notice Deploys a sovereign agent contract that calls the 0x080C precompile.
/// Qualifies the deployer wallet for the Ritual Genesis 1000 builders role.
contract AncestraAgent {
    address public constant SOVEREIGN_AGENT = address(0x080C);
    address public constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;

    address public owner;
    bytes32 public lastJobId;
    bytes public lastResult;
    string public lastResultText;

    event AgentCallInitiated(bytes32 indexed jobId, address indexed caller);
    event SovereignAgentResultDelivered(bytes32 indexed jobId, bytes result, string resultText);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "AncestraAgent: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "AncestraAgent: zero address");
        emit OwnerUpdated(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Forwards the encoded 23-field Sovereign Agent request to the precompile.
    /// @param input The 23-field ABI-encoded Sovereign Agent request.
    function callSovereignAgent(bytes calldata input) external returns (bytes32 jobId) {
        (bool ok, bytes memory output) = SOVEREIGN_AGENT.call(input);
        require(ok, "AncestraAgent: precompile call failed");
        require(output.length >= 32, "AncestraAgent: invalid precompile output");
        jobId = abi.decode(output, (bytes32));
        lastJobId = jobId;
        emit AgentCallInitiated(jobId, msg.sender);
    }

    /// @notice Phase 2 Callback from AsyncDelivery delivering the agent execution results.
    /// @param jobId The unique ID of the finished job.
    /// @param result The result bytes containing the text completion.
    function onSovereignAgentResult(bytes32 jobId, bytes calldata result) external {
        require(msg.sender == ASYNC_DELIVERY, "AncestraAgent: unauthorized callback sender");
        require(jobId == lastJobId, "AncestraAgent: job ID mismatch");
        lastResult = result;
        lastResultText = string(result);
        emit SovereignAgentResultDelivered(jobId, result, lastResultText);
    }
}
